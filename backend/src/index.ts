import express from 'express'
import { fal } from '@fal-ai/client'
import 'dotenv/config'
import { clerkMiddleware,clerkClient, requireAuth, getAuth } from '@clerk/express'
import { TrainModel,GenerateImage,GenerateImagesFromPack } from 'common'
import {prismaClient} from "db"
const PORT =process.env.PORT || 8080
const AWS = require('aws-sdk')
const cors = require('cors')
const app=express()
require('dotenv').config()
import axios from 'axios'
const AdmZip = require('adm-zip')
app.use(express.json())
app.use(clerkMiddleware())
app.use(cors())
app.get('/protected', requireAuth(), async (req, res) => {
 
  const { userId }:any = getAuth(req)

  
  const user = await clerkClient.users.getUser(userId)

  return res.json({ user })
})

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})
const BUCKET_NAME = process.env.S3_BUCKET_NAME
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
    Expires: 300, 
  };

  try {
    const uploadURL = await s3.getSignedUrlPromise('putObject', params)


    const publicURL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

    res.json({
      uploadURL,
      key,
      publicURL
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    res.status(500).json({ error: 'Failed to generate upload URL' })
  }
})
app.post('/ai/training',async(req,res)=>{
const input=req.body
const parsedResult=TrainModel.safeParse(input)

if(!parsedResult.success){
return res.status(400).json({message:"Invalid input"})

}

const { request_id } = await fal.queue.submit("fal-ai/flux-lora-fast-training", {
  input: {
    images_data_url: parsedResult.data.imageUrl as any
    
  },
  webhookUrl: "https://optional.webhook.url/for/results",
})
const dbData=await prismaClient.model.create({
    data:{
        name:parsedResult.data.name,
        age:parsedResult.data.age,
        gender:parsedResult.data.gender,
        ethinicity:parsedResult.data.ethinicity,
        eyecolor:parsedResult.data.eye_color,
        bald:parsedResult.data.bald,
        userId:parsedResult.data.userId,
        imageUrl:parsedResult.data.imageUrl,
        jobId:request_id

    }

})


return res.status(200).json({modelId:dbData.id,msg:"Training started"})

})
app.post('/ai/webhook',async(req,res)=>{
const {result}=req.body
if(!result.images_data_url){

    const dbData=await prismaClient.model.update({
    where:{
        id:result.request_id
    },
    data:{
trainingImagesUrl :result.images_data_url,
status:"FAILED"

}
})
return res.status(200).json({message:"Training failed"})
}
 
})


app.post('/ai/generate',async(req,res)=>{
    const generationBody=req.body
    const parsedResult=GenerateImage.safeParse(generationBody)
    if(!parsedResult.success){
        return res.status(400).json({message:"Invalid input"})
    }
const dbModel=await prismaClient.model.findUnique({
    where:{id:parsedResult.data.modelId},
    select:{status:true,
        trainingImagesUrl:true
    }

})
if(!dbModel || dbModel.status!=="COMPLETED"){
return res.status(400).json({message:"Model not found or not trained yet"})
}
const path:any= dbModel.trainingImagesUrl
const { request_id } = await fal.queue.submit('fal-ai/flux-lora', {
  input: {
    prompt: parsedResult.data.prompt,
 loras: [{ path:path, scale: 1.0 }]
  },
  webhookUrl: "https://optional.webhook.url/for/results",
})



const dbData=await prismaClient.outputImages.create({
    data:{
            prompt:parsedResult.data.prompt,
            modelId:parsedResult.data.modelId,
            jobid:request_id,
            userId:parsedResult.data.userId
    }
})
return res.status(200).json({ImageId:dbData.id, message:"Generation started"})
})
app.post('ai/webhook/generate',async(req,res)=>{
    const {result}=req.body

if(!result.images_data_url){
    const dbData=await prismaClient.outputImages.update({
        where:{id:result.request_id},
        data:{status:"FAILED"}
    })
return res.status(200).json({message:"Image generation failed"})
}

    const dbData=await prismaClient.outputImages.update({
        where:{id:result.request_id},
        data:{imageUrl:result.images_data_url,
        status:"COMPLETED"   
    }

    })


try{ const s3Urls: string[] = []

    for (let i = 0; i < result.images.length; i++) {
      const falImageUrl = result.images[i].url
      const s3Url = await downloadAndUploadToS3(
        falImageUrl,
        'generated-images',
        `image-${i}.png`
      )
      s3Urls.push(s3Url)
    }

const dbData=await prismaClient.model.update({
    where:{
        id:result.request_id
    },
    data:{
trainingImagesUrl :s3Urls,
status:"COMPLETED"
    }
})}
catch (error) {
    console.error('Error in generate webhook:', error)
    await prismaClient.outputImages.update({
      where: { id: result.request_id },
      data: { status: "FAILED" }
    })
    res.status(500).json({ message: "Failed to upload images to S3" })
  }



})


app.post('/ai/pack/generate',async(req,res)=>{
  const inputs=req.body
  const parsedResult=GenerateImagesFromPack.safeParse(inputs)
if(!parsedResult.success){
    return res.status(400).json({message:"Invalid input"})

}const dbModel=await prismaClient.model.findUnique({
    where:{id:parsedResult.data.modelId},
    select:{status:true,
        trainingImagesUrl:true
    }


})
if(!dbModel || dbModel.status!=="COMPLETED"){
return res.status(400).json({message:"Model not found or not trained yet"})
}
const prompts=parsedResult.data.prompts
const path:any= dbModel.trainingImagesUrl

prompts.map(async(p:string)=>{const { request_id } = await fal.queue.submit('fal-ai/flux-lora', {
  input: {
    prompt:p,
 loras: [{ path:path, scale: 1.0 }]
  },
  webhookUrl: "https://optional.webhook.url/for/results",
})
const dbPack=await prismaClient.packs.create({
    data:{modelId:parsedResult.data.modelId,
    packType:parsedResult.data.packType,
    totalImages:parsedResult.data.totalImages,
    userId:parsedResult.data.userId,
     jobId:request_id

    }
})
})

})

app.post('ai/webhook/pack/generate',async(req,res)=>{
    const {result}=req.body

if(!result.images_data_url){
    const dbData=await prismaClient.packImages.update({
        where:{id:result.request_id},
        data:{status:"FAILED"}
    })
}

    const dbData=await prismaClient.packImages.update({
        where:{id:result.request_id},
        data:{imageUrl:result.images_data_url,
        status:"COMPLETED"}
    })

 try {
   
    const s3Urls: string[] = []

    for (let i = 0; i < result.images.length; i++) {
      const falImageUrl = result.images[i].url
      const s3Url = await downloadAndUploadToS3(
        falImageUrl,
        'pack-images',
        `pack-image-${i}.png`
      )
      s3Urls.push(s3Url)
    }

    
    await prismaClient.packImages.update({
      where: { id: result.request_id },
      data: {
        imageUrl: s3Urls,
        status: "COMPLETED"
      }
    })

    res.status(200).json({ message: "Pack images uploaded to S3" })
  } catch (error) {
    console.error('Error in pack generate webhook:', error)
    await prismaClient.packImages.update({
      where: { id: result.request_id },
      data: { status: "FAILED" }
    })
    res.status(500).json({ message: "Failed to upload pack images to S3" })
  }



})
app.get('/packs/bulk',async(req,res)=>{
const userId=req.userId
const packs=await prismaClient.packs.findMany({
    where:{userId:userId},
    select:{
        packType:true,
        totalImages:true,
        createdAt:true,
        id:true,
        modelId:true
    }
})
const numberOfPacks=packs.length
return res.status(200).json({packs:packs, numberOfPacks:numberOfPacks})
})

app.get('/pack/:id',async(req,res)=>{
const id=req.params.id
const pack=await prismaClient.packImages.findUnique({
    where:{id:id},
    select:{
        prompts:true,
        imageUrl:true,
        createdAt:true,
        
    }

})
res.status(200).json({pack:pack})
})
app.get('/images/bulk',async(req,res)=>{

const userId=req.userId
const images=await prismaClient.outputImages.findMany({
    where:{userId:userId},
    select:{imageUrl:true,
        createdAt:true,
        prompt:true,
        id:true
    }
})
const numberOfImages=images.length

return res.status(200).json({images:images, numberOfImages:numberOfImages})

})

app.get('/images:id',async(req,res)=>{

const id=req.params.id
const images=await prismaClient.outputImages.findUnique({
    where:{id:id},
    select:{
        prompt:true,
        imageUrl:true,
        createdAt:true,
        
    }

})
res.status(200).json({images:images})})
app.put('/update/pack:id',async(req,res)=>{
    const id=req.params.id
    const inputs=req.body
    const validatedInputs=GenerateImagesFromPack.safeParse(inputs)
    if(!validatedInputs.success){
        return res.status(400).json({message:"Invalid input"})
    }
    const packUpdate=await prismaClient.packs.update({
        where:{id:id},
        data:{packType:validatedInputs.data.packType,
        totalImages:validatedInputs.data.totalImages,
        updatedAt:new Date()
    }

    })
    const prompts=validatedInputs.data.prompts
    const packImagesUpdate=await prismaClient.packImages.updateMany({
    where:{packId:id},
    data:{updatedAt:new Date(),
    prompts:validatedInputs.data.prompts.join(","),}
    })
   
const dbModel=await prismaClient.model.findUnique({
    where:{id:validatedInputs.data.modelId},
    select:{status:true,
        trainingImagesUrl:true
    }})
const path:any=dbModel?.trainingImagesUrl

prompts.map(async(p:string)=>{const { request_id } = await fal.queue.submit('fal-ai/flux-lora', {
  input: {
    prompt:p,
 loras: [{ path:path, scale: 1.0 }]
  },
  webhookUrl: "https://optional.webhook.url/for/results",
})
const dbUpdate=await prismaClient.packImages.updateMany({
    where:{packId:id},
    data:{falRequestId:request_id}
})


    return res.status(200).json({message:"Pack updated"
    })
})})

app.post('/update/packImages/webhook',async(req,res)=>{
    const {result}=req.body
if(!result.images_data_url){
    return res.status(400).json({message:"No images updated"})
}
 try {
    const s3Urls: string[] = []

    for (let i = 0; i < result.images.length; i++) {
      const falImageUrl = result.images[i].url
      const s3Url = await downloadAndUploadToS3(
        falImageUrl,
        'updated-pack-images',
        `updated-${i}.png`
      )
      s3Urls.push(s3Url)
    }

    await prismaClient.packImages.updateMany({
      where: { falRequestId: result.request_id },
      data: {
        imageUrl: s3Urls,
        status: "COMPLETED",
        updatedAt: new Date()
      }
    })

    return res.status(200).json({ message: "Pack Images updated" })
  } catch (error) {
    console.error('Error updating pack images:', error)
    res.status(500).json({ message: "Failed to update pack images" })
  }
})

app.delete('/image/:id',async(req,res)=>{
    const id=req.params.id
    const deleteImage=await prismaClient.outputImages.delete({
        where:{id:id},
    })
    return res.status(200).json({message:"Image Deleted!"})
})
app.delete('/pack/:id',async(req,res)=>{
    const id=req.params.id
    const deletePack=await prismaClient.packs.delete({
        where:{id:id},
    })
    return res.status(200).json({message:"Pack Deleted!"})
})
app.delete('/packimage/:id',async(req,res)=>{
    const id=req.params.id
    const deletePackImage=await prismaClient.packImages.delete({
        where:{id:id},
    })
    return res.status(200).json({message:"Pack Image Deleted!"})
})
app.get('/models/bulk',async(req,res)=>{
    const userId=req.userId
const dbData=await prismaClient.model.findMany({
where:{userId:userId},
select:{name:true,
    gender:true,
age:true,
bald:true,
ethinicity:true,
eyecolor:true,
createdAt:true,
updatedAt:true,
status:true

}
})
return res.json({dbData})
})
app.get('/models:id',async(req,res)=>{
    const id=req.params.id
const dbData=await prismaClient.model.findUnique({
    where:{id:id},
    select:{
name:true,
    gender:true,
age:true,
bald:true,
ethinicity:true,
eyecolor:true,
createdAt:true,
updatedAt:true,
status:true
    }
})
res.json({dbData})
})
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})