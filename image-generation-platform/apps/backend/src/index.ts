import express from 'express'
import { TrainModel, GenerateImage, GenerateImagesFromPack } from '@shreyash_iitr/common';
import { prisma } from 'db';
const PORT=process.env.PORT || 3000

const app=express()
app.use(express.json())
const USER_ID='1123'
app.post('/ai/training',async(res:any,req:any)=>{
    const parsedBody=TrainModel.safeParse(req.body)
    if(!parsedBody.success){
        return res.status(411)
    }
const data=await prisma.model.create({
        data:{
            name:parsedBody.data.name,
            age:parsedBody.data.age,
            eyeColor:parsedBody.data.eyeColor,
            type:parsedBody.data.type,
           ethinicity: parsedBody.data.ethinicity,
            bald:parsedBody.data.bald,
            userId:USER_ID
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
 const data=await prisma.OutputImages.create({
    data:{
        prompt:parsedBody.data.prompt,
        modelId:parsedBody.data.modelId,
userId:USER_ID,
imageUrl:""
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
const images=await prisma.OutputImages.createManyAndReturn({
    data:prompts.map((prompp:any)=>({
prompt:prompp.prompt,
userId:USER_ID,
modelId:parsedBody.data.modelId,
imageUrl:""

    }))
})
res.json({
    images:images.map((image:any)=>image.id)
})

   })



app.get('/pack/bulk',async(req,res)=>{})

app.get('/image',async(req,res)=>{})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})