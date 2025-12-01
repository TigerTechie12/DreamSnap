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
}
const dbData=await prismaClient.model.update({
    where:{
        id:result.request_id
    },
    data:{
trainingImagesUrl :result.images_data_url,
status:"COMPLETED"
    }
})})


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
            jobid:request_id
            
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
}

    const dbData=await prismaClient.outputImages.update({
        where:{id:result.request_id},
        data:{imageUrl:result.images_data_url,
        status:"COMPLETED"}
    })
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