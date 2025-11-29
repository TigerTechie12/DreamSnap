import express from 'express'
import { fal } from '@fal-ai/client'

import { TrainModel,GenerateImage,GenerateImagesFromPack } from 'common'
import {prismaClient} from "db"
const PORT =process.env.PORT || 8080
const app=express()
app.use(express.json())
app.post('/ai/training',async(req,res)=>{
const input=req.body


const userId="test-user-id"
const parsedResult=TrainModel.safeParse(input)
if(!parsedResult.success){
return res.status(400).json({message:"Invalid input"})

}

const { request_id } = await fal.queue.submit("fal-ai/flux-lora-fast-training", {
  input: {
    images_data_url: parsedResult.data.imageUrl,
    
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
        userId:userId,
        imageUrl:parsedResult.data.imageUrl,
        jobId:request_id     
    }

})


return res.status(200).json({modelId:dbData.id,msg:"Training started"})

})
app.post('/ai/webhook',async(req,res)=>{
const {result}=req.body
const dbData=await prismaClient.model.create({
    where:{
        jobId:result.request_id
    },
imagesUrl:result.images_data_url,

})})


app.post('/ai/generate',async(req,res)=>{
    const generationBody=req.body
    const parsedResult=GenerateImage.safeParse(generationBody)
    if(!parsedResult.success){
        return res.status(400).json({message:"Invalid input"})
    }
const dbData=await prismaClient.outputImages.create({
    data:{
            prompt:parsedResult.data.prompt,
            modelId:parsedResult.data.modelId,
            imageUrl:"",

    }
})
return res.status(200).json({ImageId:dbData.id})
})
app.post('/ai/pack/generate',async(req,res)=>{
    const packBody=req.body
    const parsedResult=GenerateImagesFromPack.safeParse(packBody)
    if(!parsedResult.success){
        return res.status(400).json({message:"Invalid input"})
    }
const prompts=await prismaClient.packPrompts.findMany({
where:{
packId:parsedResult.data.packId
}
})
const images=await prismaClient.outputImages.createMany({
    data:prompts.map((prompt)=>({
        prompt:prompt.prompt,
        imageUrl:"",
        modelId:parsedResult.data.modelId
    }) )
})
return res.status(200).json({})
})


app.get('/pack/bulk',(req,res)=>{

})
app.get('/image',(req,res)=>{})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})