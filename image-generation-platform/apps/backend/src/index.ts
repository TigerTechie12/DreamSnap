import express from 'express'
import { TrainModel, GenerateImage, GenerateImagesFromPack } from '@shreyash_iitr/common';
import { prisma } from 'db';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import {FalAIModel} from './models/FalAIModel'
const PORT=process.env.PORT || 3000

const app=express()
app.use(express.json())
const USER_ID='1123'
const FalAiModel=new FalAIModel()
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

app.get("/pre-signed-url", async (req, res) => {
    try {
        const objectKey = `models/${Date.now()}_${Math.random().toString().substring(2, 8)}.zip`;
        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: objectKey,
            ContentType: 'application/zip',
        });
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 });
        res.json({ url });
    } catch (error: any) {
        console.error('Error generating pre-signed URL:', error);
        res.status(500).json({ error: 'Failed to generate pre-signed URL', details: error.message });
    }
})
app.post('/ai/training',async(res:any,req:any)=>{
    const parsedBody=TrainModel.safeParse(req.body)
    if(!parsedBody.success){
        return res.status(411)
    }
    const images=req.body.images
    const request_id=await FalAiModel.trainModel(parsedBody.data.zipUrl,parsedBody.data.name)
const data=await prisma.model.create({
        data:{
            name:parsedBody.data.name,
            age:parsedBody.data.age,
            eyeColor:parsedBody.data.eyeColor,
            type:parsedBody.data.type,
           ethinicity: parsedBody.data.ethinicity,
            bald:parsedBody.data.bald,
            userId:USER_ID,
            zipUrl:parsedBody.data.zipUrl,
            falAiRequestId:request_id
        }
    })
    res.json({
        modelId:data.id
    })

})

app.post('/ai/generate', async(req,res)=>{
 const parsedBody=GenerateImage.safeParse(req.body)
 if(!parsedBody.success){
 return res.status(411)
 }
 const model=await prisma.model.findUnique({
    where:{
        id:parsedBody.data.modelId
    }
 })
 if(!model || !model.tensorPath){
    return res.status(411).json({message:"model not found"})
 }
 const request_id= await FalAiModel.generateImage(parsedBody.data.prompt,model?.tensorPath)
 const data=await prisma.OutputImages.create({
    data:{
        prompt:parsedBody.data.prompt,
        modelId:parsedBody.data.modelId,
userId:USER_ID,
imageUrl:"",
falAiRequestId:request_id
    }
})

})

app.post('/pack/generate',async(req,res)=>{
    const parsedBody=GenerateImagesFromPack.safeParse(req.body)
    if(!parsedBody.success){return res.status(411).json({message:"Input incorrect"})}
    const prompts=await prisma.packPrompts.findMany({
        where:{
            packId:parsedBody.data.packId
        }
    })
    let requestIds:{request_id:string}[]=await Promise.all(prompts.map((prompt:any)=>FalAiModel.generateImage(prompt.prompt,parsedBody.data.modelId)))
const images=await prisma.OutputImages.createManyAndReturn({
    data:prompts.map((prompp:any)=>({
prompt:prompp.prompt,
userId:USER_ID,
modelId:parsedBody.data.modelId,
imageUrl:"",
falAiRequestId:requestIds

    }))
})
res.json({
    images:images.map((image:any)=>image.id)
})

   })



app.get('/pack/bulk',async(req,res)=>{
 const packs=await prisma.findMany({})
res.json({packs})
})

app.get('/image/bulk',async(req,res)=>{
    const ids=req.query.ids as string[]
    const limits=req.query.limits as string ?? "10"
    const offset=req.query.offset as string ?? "0"
    const imagesData=await prisma.outputImages.findMany({
        where:{
            id:{in:ids},
            userId:USER_ID
        },
        skip:parseInt(offset),
        take:parseInt(limits)
    })
    res.json({
        images:imagesData
    })
})
app.post('/fal-ai/webhook/train',async(req,res)=>{
    console.log(req.body)
    const request_id=req.body.request_id
    await prisma.model.update({
        where:{falAiRequestId:request_id
    },
    data:{
        trainingStaus:"Generated",
        tensorPath:req.body.request_id
    }})
    res.json({
        message:'webhook received'
    })
})

app.post('/fal-ai/webhook/image',async(req,res)=>{
    console.log(req.body)
    const requestId=req.body.request_id
    const imageId=req.body.image_id
    await prisma.outputImages.update({
        where:{
           falAiRequestId:requestId
        },
        data:{
            status:"Generated",
            imageUrl:req.body.image_url
        }
    })
    res.json({
        message:'webhook received'
    })
})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})