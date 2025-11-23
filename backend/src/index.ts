import express from 'express'

import { TrainModel,GenerateImage,GenerateImagesFromPack } from 'common'
import {prismaClient} from "db"
const PORT =process.env.PORT || 8080
const app=express()
app.use(express.json())
app.post('/ai/training',async(req,res)=>{
const input=req.body
const parsedResult=TrainModel.safeParse(input)
if(!parsedResult.success){
return res.status(400).json({message:"Invalid input"})

}
await prismaClient.model.create({
    data:{
        name:parsedResult.data.name,
        age:parsedResult.data.age,
        gender:parsedResult.data.gender,
        ethinicity:parsedResult.data.ethinicity,
        eyecolor:parsedResult.data.eye_color,
        bald:parsedResult.data.bald,
       
    }

})
return res.status(200).json({message:"Model training data saved"})})



app.post('/ai/generate',(req,res)=>{})
app.post('/ai/pack/generate',(req,res)=>{})
app.get('/pack/bulk',(req,res)=>{})
app.get('/image',(req,res)=>{})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})