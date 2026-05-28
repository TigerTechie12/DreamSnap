import express from 'express'
import { fal } from '@fal-ai/client'
import 'dotenv/config'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'
import { TrainModel, GenerateImage, GenerateImagesFromPack } from 'dreamsnap-common'
import { prismaClient } from 'dreamsnap-db'
import cors from 'cors'
import AWS from 'aws-sdk'
import axios from 'axios'
import AdmZip from 'adm-zip'

fal.config({ credentials: process.env.FAL_KEY })

const swaggerDocument = JSON.parse(readFileSync(resolve('src', 'swagger-output.json'), 'utf-8'))

const PORT = process.env.PORT || 8080
const app = express()

const SELF_HOSTED = process.env.TRAINING_MODE === 'manual' || !process.env.FAL_KEY

const defaultOrigins = [
  'http://localhost:5173',
  'https://dream-snap-eight.vercel.app',
]
const allowedOrigins = Array.from(new Set([
  ...defaultOrigins,
  ...(process.env.CORS_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean),
]))

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true)
    else callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
  credentials: true,
}

app.use(cors(corsOptions))

app.use(express.json())
app.use(clerkMiddleware())
app.use('/api-docs/assets', express.static(resolve('node_modules', 'swagger-ui-dist')))
app.get('/api-docs', (_req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html>
  <head>
    <title>DreamSnap API Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="/api-docs/assets/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/api-docs/assets/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function() {
        SwaggerUIBundle({
          url: "/openapi.json",
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
          layout: "BaseLayout"
        })
      }
    </script>
  </body>
</html>`)
})


app.get('/openapi.json', (_req, res) => {
  res.json(swaggerDocument);
});
app.get('/protected', requireAuth(), async (req, res) => {
  const { userId }: any = getAuth(req)
  try {
    let user = await prismaClient.user.findUnique({
      where: { clerkId: userId }
    })
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId)
      user = await prismaClient.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName!,
          lastName: clerkUser.lastName!
        }
      })
    }
    return res.json({ user })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user' })
  }
})

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID  as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  region: process.env.AWS_REGION as string
})
const BUCKET_NAME = process.env.S3_BUCKET_NAME || ''

async function getOrCreateUser(clerkId: string) {
  let user = await prismaClient.user.findUnique({ where: { clerkId } })
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkId)
    user = await prismaClient.user.create({
      data: {
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
      }
    })
  }
  return user
}

function workerAuthorized(req: express.Request, res: express.Response): boolean {
  const secret = process.env.WORKER_SECRET
  if (!secret) {
    res.status(503).json({ message: 'WORKER_SECRET not configured on the server' })
    return false
  }
  if (req.header('x-worker-secret') !== secret) {
    res.status(401).json({ message: 'Unauthorized worker' })
    return false
  }
  return true
}

async function downloadAndUploadToS3(imageUrl: string, folder: string, filename: string) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    })
    const imageBuffer = Buffer.from(response.data)
    const key = `${folder}/${Date.now()}-${filename}`
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/png',
      ACL: 'public-read'
    }
    await s3.upload(uploadParams).promise()
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw error
  }
}

app.post('/api/get-upload-url', async (req, res) => {
  const { fileName, fileType } = req.body
  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'fileName and fileType required' })
  }
  const key = `user-uploads/${Date.now()}-${fileName}`
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    Expires: 3600, 
  }
  try {
    const uploadURL = await s3.getSignedUrlPromise('putObject', params)
    const publicURL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    res.json({ uploadURL, key, publicURL })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    res.status(500).json({ error: 'Failed to generate upload URL' })
  }
})

app.post('/ai/training', async (req, res) => {
  const input = req.body
  const parsedResult = TrainModel.safeParse(input)
  if (!parsedResult.success) {
    console.error('Validation error:', parsedResult.error.issues)
    return res.status(400).json({ message: 'Invalid input', details: parsedResult.error.issues })
  }
  try {
    const user = await getOrCreateUser(parsedResult.data.userId)

    const imageUrls = parsedResult.data.imageUrl
    const zip = new AdmZip()
    for (const [i, url] of imageUrls.entries()) {
      const imgRes = await axios.get(url, { responseType: 'arraybuffer' })
      const cleanUrl = url.indexOf('?') !== -1 ? url.slice(0, url.indexOf('?')) : url
      const ext = cleanUrl.split('.').pop() || 'jpg'
      zip.addFile(`image_${i}.${ext}`, Buffer.from(imgRes.data as ArrayBuffer))
    }
    const zipBuffer = zip.toBuffer()
    const zipKey = `training-zips/${Date.now()}-${parsedResult.data.userId}.zip`
    await s3.upload({ Bucket: BUCKET_NAME, Key: zipKey, Body: zipBuffer, ContentType: 'application/zip' }).promise()
    const zipUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${zipKey}`

    if (SELF_HOSTED) {
      const dbData = await prismaClient.model.create({
        data: {
          name: parsedResult.data.name,
          age: parsedResult.data.age,
          gender: parsedResult.data.gender,
          ethinicity: parsedResult.data.ethinicity,
          eyecolor: parsedResult.data.eye_color,
          bald: parsedResult.data.bald,
          userId: user.id,
          imageUrl: parsedResult.data.imageUrl,
        }
      })
      return res.status(200).json({
        modelId: dbData.id,
        zipUrl,
        mode: 'manual',
        msg: 'Training data prepared. Train this model for free in the Colab notebook, then it will appear as COMPLETED.',
      })
    }

    const submitOptions: any = {
      input: { images_data_url: zipUrl }
    }
    if (process.env.BACKEND_URL) {
      submitOptions.webhookUrl = `${process.env.BACKEND_URL}/ai/webhook`
    }

    const { request_id } = await fal.queue.submit('fal-ai/flux-lora-fast-training', submitOptions)
    const dbData = await prismaClient.model.create({
      data: {
        name: parsedResult.data.name,
        age: parsedResult.data.age,
        gender: parsedResult.data.gender,
        ethinicity: parsedResult.data.ethinicity,
        eyecolor: parsedResult.data.eye_color,
        bald: parsedResult.data.bald,
        userId: user.id,
        imageUrl: parsedResult.data.imageUrl,
        jobId: request_id
      }
    })
    return res.status(200).json({ modelId: dbData.id, msg: 'Training started' })
  } catch (e: any) {
    const status = e?.status ?? e?.response?.status
    const body = e?.body ?? e?.response?.data
    console.error('Training error:', { message: e?.message, status, body, stack: e?.stack })
    return res.status(500).json({
      message: e?.message || 'Training failed',
      status,
      detail: typeof body === 'string' ? body : JSON.stringify(body ?? {}),
    })
  }
})

app.post('/ai/webhook', async (req, res) => {
  const { result } = req.body
  try {
    if (!result.images_data_url) {
      await prismaClient.model.update({
        where: { id: result.request_id },
        data: { trainingImagesUrl: result.images_data_url, status: 'FAILED' }
      })
      return res.status(200).json({ message: 'Training failed' })
    }
  } catch (e) {
    return res.json({ e, msg: 'Something went wrong' })
  }
})

app.get('/ai/training/:modelId/data', async (req, res) => {
  try {
    const model = await prismaClient.model.findUnique({
      where: { id: req.params.modelId },
      select: { name: true, imageUrl: true, status: true }
    })
    if (!model) return res.status(404).json({ message: 'Model not found' })
    const triggerWord = `${model.name}`.toLowerCase().replace(/[^a-z0-9]/g, '') || 'subject'
    return res.json({ name: model.name, imageUrls: model.imageUrl, status: model.status, triggerWord })
  } catch (e: any) {
    console.error('Fetch training data error:', e)
    return res.status(500).json({ message: e?.message || 'Failed' })
  }
})

app.post('/ai/training/complete', async (req, res) => {
  const { modelId, loraUrl } = req.body
  if (!modelId || !loraUrl) {
    return res.status(400).json({ message: 'modelId and loraUrl are required' })
  }
  try {
    const model = await prismaClient.model.update({
      where: { id: modelId },
      data: { trainingImagesUrl: [loraUrl], status: 'COMPLETED' }
    })
    return res.status(200).json({ message: 'Model marked as trained', modelId: model.id })
  } catch (e: any) {
    console.error('Complete training error:', e)
    return res.status(500).json({ message: e?.message || 'Failed to complete training' })
  }
})

app.post('/ai/generate', async (req, res) => {
  const generationBody = req.body
  const parsedResult = GenerateImage.safeParse(generationBody)
  if (!parsedResult.success) {
    return res.status(400).json({ message: 'Invalid input' })
  }
  try {
    const dbModel = await prismaClient.model.findUnique({
      where: { id: parsedResult.data.name },
      select: { status: true, trainingImagesUrl: true }
    })
    if (!dbModel || dbModel.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Model not found or not trained yet' })
    }
    const user = await getOrCreateUser(parsedResult.data.userId)

    if (SELF_HOSTED) {
      const dbData = await prismaClient.outputImages.create({
        data: {
          prompt: parsedResult.data.prompt,
          modelId: parsedResult.data.modelId,
          jobid: '',
          userId: user.id,
        }
      })
      return res.status(200).json({ ImageId: dbData.id, message: 'Generation queued', mode: 'self-hosted' })
    }

    const path: any = dbModel.trainingImagesUrl
    const { request_id } = await fal.queue.submit('fal-ai/flux-lora', {
      input: {
        prompt: parsedResult.data.prompt,
        loras: [{ path: path, scale: 1.0 }]
      },
      webhookUrl: 'https://optional.webhook.url/for/results',
    })
    const dbData = await prismaClient.outputImages.create({
      data: {
        prompt: parsedResult.data.prompt,
        modelId: parsedResult.data.modelId,
        jobid: request_id,
        userId: user.id,
      }
    })
    return res.status(200).json({ ImageId: dbData.id, message: 'Generation started' })
  } catch (e) {
    return res.json({ e, msg: 'Something went wrong' })
  }
})

app.post('/ai/webhook/generate', async (req, res) => {
  const { result } = req.body
  try {
    if (!result.images_data_url) {
      await prismaClient.outputImages.update({
        where: { id: result.request_id },
        data: { status: 'FAILED' }
      })
      return res.status(200).json({ message: 'Image generation failed' })
    }
    await prismaClient.outputImages.update({
      where: { id: result.request_id },
      data: { imageUrl: result.images_data_url, status: 'COMPLETED' }
    })
    const s3Urls: string[] = []
    for (let i = 0; i < result.images.length; i++) {
      const falImageUrl = result.images[i].url
      const s3Url = await downloadAndUploadToS3(falImageUrl, 'generated-images', `image-${i}.png`)
      s3Urls.push(s3Url)
    }
    await prismaClient.model.update({
      where: { id: result.request_id },
      data: { trainingImagesUrl: s3Urls, status: 'COMPLETED' }
    })
    res.status(200).json({ message: 'Images uploaded to S3' })
  } catch (error) {
    console.error('Error in generate webhook:', error)
    await prismaClient.outputImages.update({
      where: { id: result.request_id },
      data: { status: 'FAILED' }
    })
    res.status(500).json({ message: 'Failed to upload images to S3' })
  }
})

app.post('/ai/pack/generate', async (req, res) => {
  const inputs = req.body
  const parsedResult = GenerateImagesFromPack.safeParse(inputs)
  if (!parsedResult.success) {
    return res.status(400).json({ message: 'Invalid input' })
  }
  try {
    const dbModel = await prismaClient.model.findUnique({
      where: { id: parsedResult.data.modelId },
      select: { status: true, trainingImagesUrl: true }
    })
    if (!dbModel || dbModel.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Model not found or not trained yet' })
    }
    const user = await getOrCreateUser(parsedResult.data.userId)
    const prompts = parsedResult.data.prompts

    if (SELF_HOSTED) {
      const pack = await prismaClient.packs.create({
        data: {
          modelId: parsedResult.data.modelId,
          packType: parsedResult.data.packType,
          totalImages: parsedResult.data.totalImages,
          userId: user.id,
          jobId: '',
        }
      })
      await prismaClient.packImages.createMany({
        data: prompts.map((p: string) => ({
          packId: pack.id,
          prompts: p,
          falRequestId: '',
        }))
      })
      return res.status(200).json({ packId: pack.id, queued: prompts.length, mode: 'self-hosted' })
    }

    const path: any = dbModel.trainingImagesUrl
    prompts.map(async (p: string) => {
      const { request_id } = await fal.queue.submit('fal-ai/flux-lora', {
        input: { prompt: p, loras: [{ path: path, scale: 1.0 }] },
        webhookUrl: 'https://optional.webhook.url/for/results',
      })
      await prismaClient.packs.create({
        data: {
          modelId: parsedResult.data.modelId,
          packType: parsedResult.data.packType,
          totalImages: parsedResult.data.totalImages,
          userId: user.id,
          jobId: request_id
        }
      })
    })
    return res.status(200).json({ message: 'Pack generation started' })
  } catch (e) {
    return res.json({ e, msg: 'Something went wrong' })
  }
})

app.post('/ai/webhook/pack/generate', async (req, res) => {
  const { result } = req.body
  try {
    if (!result.images_data_url) {
      await prismaClient.packImages.update({
        where: { id: result.request_id },
        data: { status: 'FAILED' }
      })
    }
    await prismaClient.packImages.update({
      where: { id: result.request_id },
      data: { imageUrl: result.images_data_url, status: 'COMPLETED' }
    })
    const s3Urls: string[] = []
    for (let i = 0; i < result.images.length; i++) {
      const falImageUrl = result.images[i].url
      const s3Url = await downloadAndUploadToS3(falImageUrl, 'pack-images', `pack-image-${i}.png`)
      s3Urls.push(s3Url)
    }
    await prismaClient.packImages.update({
      where: { id: result.request_id },
      data: { imageUrl: s3Urls, status: 'COMPLETED' }
    })
    res.status(200).json({ message: 'Pack images uploaded to S3' })
  } catch (error) {
    console.error('Error in pack generate webhook:', error)
    await prismaClient.packImages.update({
      where: { id: result.request_id },
      data: { status: 'FAILED' }
    })
    res.status(500).json({ message: 'Failed to upload pack images to S3' })
  }
})

app.get('/worker/jobs', async (req, res) => {
  if (!workerAuthorized(req, res)) return
  try {
    const loraCache = new Map<string, string | undefined>()
    const loraFor = async (modelId: string) => {
      if (!loraCache.has(modelId)) {
        const m = await prismaClient.model.findUnique({
          where: { id: modelId }, select: { trainingImagesUrl: true }
        })
        loraCache.set(modelId, m?.trainingImagesUrl?.[0])
      }
      return loraCache.get(modelId)
    }

    const jobs: Array<{ type: 'image' | 'packImage'; id: string; prompt: string; loraUrl: string }> = []

    const images = await prismaClient.outputImages.findMany({
      where: { status: 'PENDING' },
      select: { id: true, prompt: true, modelId: true },
      take: 20,
    })
    for (const img of images) {
      const loraUrl = await loraFor(img.modelId)
      if (loraUrl) jobs.push({ type: 'image', id: img.id, prompt: img.prompt, loraUrl })
    }

    const packImgs = await prismaClient.packImages.findMany({
      where: { status: 'PENDING' },
      select: { id: true, prompts: true, packId: true },
      take: 20,
    })
    for (const pi of packImgs) {
      const pack = await prismaClient.packs.findUnique({
        where: { id: pi.packId }, select: { modelId: true }
      })
      if (!pack) continue
      const loraUrl = await loraFor(pack.modelId)
      if (loraUrl) jobs.push({ type: 'packImage', id: pi.id, prompt: pi.prompts, loraUrl })
    }

    return res.json({ jobs })
  } catch (e: any) {
    console.error('worker jobs error:', e)
    return res.status(500).json({ message: e?.message || 'Failed' })
  }
})

app.post('/worker/jobs/image/:id/complete', async (req, res) => {
  if (!workerAuthorized(req, res)) return
  const { imageUrls, failed } = req.body
  try {
    await prismaClient.outputImages.update({
      where: { id: req.params.id },
      data: failed ? { status: 'FAILED' } : { imageUrl: imageUrls, status: 'COMPLETED' },
    })
    return res.json({ message: 'ok' })
  } catch (e: any) {
    console.error('complete image job error:', e)
    return res.status(500).json({ message: e?.message || 'Failed' })
  }
})

app.post('/worker/jobs/packimage/:id/complete', async (req, res) => {
  if (!workerAuthorized(req, res)) return
  const { imageUrls, failed } = req.body
  try {
    const updated = await prismaClient.packImages.update({
      where: { id: req.params.id },
      data: failed ? { status: 'FAILED' } : { imageUrl: imageUrls, status: 'COMPLETED' },
    })
    const siblings = await prismaClient.packImages.findMany({
      where: { packId: updated.packId }, select: { status: true }
    })
    if (siblings.length > 0 && siblings.every(s => s.status !== 'PENDING')) {
      await prismaClient.packs.update({
        where: { id: updated.packId }, data: { status: 'COMPLETED' }
      })
    }
    return res.json({ message: 'ok' })
  } catch (e: any) {
    console.error('complete pack image job error:', e)
    return res.status(500).json({ message: e?.message || 'Failed' })
  }
})

app.get('/packs/bulk', async (req, res) => {
  const { userId: clerkId }: any = getAuth(req)
  try {
    const user = await prismaClient.user.findUnique({ where: { clerkId } })
    if (!user) return res.status(200).json({ packs: [], numberOfPacks: 0 })
    const rows = await prismaClient.packs.findMany({
      where: { userId: user.id },
      select: {
        packType: true, totalImages: true, createdAt: true, id: true, modelId: true, status: true,
        packImages: { select: { id: true, imageUrl: true, prompts: true, status: true } }
      }
    })
    const packs = rows.map(p => {
      const count = p.packImages.length || 1
      const done = p.packImages.filter(pi => pi.status === 'COMPLETED').length
      return { ...p, progress: Math.round((done / count) * 100) }
    })
    return res.status(200).json({ packs, numberOfPacks: packs.length })
  } catch (e) {
    return res.json({ e, msg: 'Something went wrong' })
  }
})

app.get('/pack/:id', async (req, res) => {
  const id = req.params.id
  try {
    const pack = await prismaClient.packImages.findUnique({
      where: { id },
      select: { prompts: true, imageUrl: true, createdAt: true }
    })
    res.status(200).json({ pack })
  } catch (e) {
    return res.json({ e, msg: 'Something went wrong' })
  }
})

app.get('/images/bulk', async (req, res) => {
  const { userId: clerkId }: any = getAuth(req)
  try {
    const user = await prismaClient.user.findUnique({ where: { clerkId } })
    if (!user) return res.status(200).json({ images: [], numberOfImages: 0 })
    const images = await prismaClient.outputImages.findMany({
      where: { userId: user.id },
      select: { imageUrl: true, createdAt: true, prompt: true, id: true }
    })
    return res.status(200).json({ images, numberOfImages: images.length })
  } catch (e) {
    return res.json({ e, msg: 'Something went wrong' })
  }
})

app.get('/images/:id', async (req, res) => {
  const id = req.params.id
  try {
    const images = await prismaClient.outputImages.findUnique({
      where: { id },
      select: { prompt: true, imageUrl: true, createdAt: true }
    })
    res.status(200).json({ images })
  } catch (e) {
    return res.json({ e, msg: 'Something went wrong' })
  }
})

app.put('/update/pack/:id', async (req, res) => {
  const id = req.params.id
  const inputs = req.body
  const validatedInputs = GenerateImagesFromPack.safeParse(inputs)
  if (!validatedInputs.success) {
    return res.status(400).json({ message: 'Invalid input' })
  }
  try {
    await prismaClient.packs.update({
      where: { id },
      data: { packType: validatedInputs.data.packType, totalImages: validatedInputs.data.totalImages, updatedAt: new Date() }
    })
    const prompts = validatedInputs.data.prompts
    await prismaClient.packImages.updateMany({
      where: { packId: id },
      data: { updatedAt: new Date(), prompts: validatedInputs.data.prompts.join(',') }
    })
    const dbModel = await prismaClient.model.findUnique({
      where: { id: validatedInputs.data.modelId },
      select: { status: true, trainingImagesUrl: true }
    })
    const path: any = dbModel?.trainingImagesUrl
    prompts.map(async (p: string) => {
      const { request_id } = await fal.queue.submit('fal-ai/flux-lora', {
        input: { prompt: p, loras: [{ path, scale: 1.0 }] },
        webhookUrl: 'https://optional.webhook.url/for/results',
      })
      await prismaClient.packImages.updateMany({
        where: { packId: id },
        data: { falRequestId: request_id }
      })
    })
    return res.status(200).json({ message: 'Pack updated' })
  } catch (e) {
    return res.json({ e, msg: 'Something went wrong' })
  }
})

app.post('/update/packImages/webhook', async (req, res) => {
  const { result } = req.body
  if (!result.images_data_url) {
    return res.status(400).json({ message: 'No images updated' })
  }
  try {
    const s3Urls: string[] = []
    for (let i = 0; i < result.images.length; i++) {
      const falImageUrl = result.images[i].url
      const s3Url = await downloadAndUploadToS3(falImageUrl, 'updated-pack-images', `updated-${i}.png`)
      s3Urls.push(s3Url)
    }
    await prismaClient.packImages.updateMany({
      where: { falRequestId: result.request_id },
      data: { imageUrl: s3Urls, status: 'COMPLETED', updatedAt: new Date() }
    })
    return res.status(200).json({ message: 'Pack Images updated' })
  } catch (error) {
    console.error('Error updating pack images:', error)
    res.status(500).json({ message: 'Failed to update pack images' })
  }
})

app.delete('/image/:id', async (req, res) => {
  const id = req.params.id
  try {
    await prismaClient.outputImages.delete({ where: { id } })
    return res.status(200).json({ message: 'Image Deleted!' })
  } catch (error) {
    console.error('Error finding images:', error)
    res.status(500).json({ message: 'Failed' })
  }
})

app.delete('/pack/:id', async (req, res) => {
  const id = req.params.id
  try {
    await prismaClient.packs.delete({ where: { id } })
    return res.status(200).json({ message: 'Pack Deleted!' })
  } catch (error) {
    console.error('Error deleting pack:', error)
    res.status(500).json({ message: 'Failed' })
  }
})

app.delete('/packimage/:id', async (req, res) => {
  const id = req.params.id
  try {
    await prismaClient.packImages.delete({ where: { id } })
    return res.status(200).json({ message: 'Pack Image Deleted!' })
  } catch (error) {
    console.error('Error deleting pack image:', error)
    res.status(500).json({ message: 'Failed' })
  }
})

app.get('/models/bulk', requireAuth(), async (req, res) => {
  const { userId: clerkId }: any = getAuth(req)
  try {
    const user = await prismaClient.user.findUnique({ where: { clerkId } })
    if (!user) return res.json({ dbData: [] })
    const dbData = await prismaClient.model.findMany({
      where: { userId: user.id },
      select: { name: true, gender: true, age: true, bald: true, ethinicity: true, eyecolor: true, createdAt: true, updatedAt: true, status: true, id: true }
    })
    return res.json({ dbData })
  } catch (error) {
    console.error('Error fetching models', error)
    res.status(500).json({ message: 'Failed' })
  }
})

app.get('/models/:id', async (req, res) => {
  const id = req.params.id
  try {
    const dbData = await prismaClient.model.findUnique({
      where: { id },
      select: { name: true, gender: true, age: true, bald: true, ethinicity: true, eyecolor: true, createdAt: true, updatedAt: true, status: true }
    })
    res.json({ dbData })
  } catch (error) {
    console.error('Error fetching model', error)
    res.status(500).json({ message: 'Failed' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
