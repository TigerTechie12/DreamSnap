import express from 'express'
import { TrainModel, GenerateImage, GenerateImagesFromPack } from '@shreyash_iitr/common';
import { prisma } from 'db';
const PORT=process.env.PORT || 3000

const app=express()
app.use(express.json())
app.post('/ai/training',async(res:any,req:any)=>{
    const parsedBody=TrainModel.safeParse(req.body)
    if(!parsedBody){
        return res.status(411)
    }
    await prisma.model.create({
        data:{
            name:parsedBody.data.name,
            age:parsedBody.data.age,
            eyeColor:parsedBody.data.eyeColor,
            type:parsedBody.data.type,
           ethinicity: parsedBody.data.ethinicity,
            bald:parsedBody.data.bald
        }
    })

})

app.post('/ai/generate',(req,res)=>{})

app.post('/pack/generate',(req,res)=>{})

app.get('/pack/bulk',(req,res)=>{})

app.get('/image',(req,res)=>{})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})