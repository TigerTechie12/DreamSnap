import express from 'express'
import { fal } from '@fal-ai/client'
import 'dotenv/config'
import { clerkMiddleware,clerkClient, requireAuth, getAuth } from '@clerk/express'
import { TrainModel,GenerateImage,GenerateImagesFromPack } from 'common'
import {prismaClient} from "db"
const PORT =process.env.PORT || 8080
const app=express()
app.use(express.json())
app.use(clerkMiddleware())
app.get('/protected', requireAuth(), async (req, res) => {
 
  const { userId }:any = getAuth(req)

  
  const user = await clerkClient.users.getUser(userId)

  return res.json({ user })
})

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
    //update s3
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
    userId:"test-user-id",
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
//update s3
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
return res.status(200).json({packs:packs})
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
return res.status(200).json({images:images})

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
const dbUpdate=await prismaClient.packImages.updateMany({
where:{falRequestId:result.request_id},
data:{imageUrl:result.images_data_url,
status:"COMPLETED",
updatedAt: new Date()}
})
return res.status(200).json({message:"Pack Images updated"})
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
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})