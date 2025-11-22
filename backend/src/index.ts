import express from 'express'
const PORT =process.env.PORT || 8080
const app=express()
import { TrainModel,GenerateImage,GenerateImagesFromPack } from 'common'

app.post('/ai/training',(req,res)=>{})
app.post('/ai/generate',(req,res)=>{})
app.post('/ai/pack/generate',(req,res)=>{})
app.get('/pack/bulk',(req,res)=>{})
app.get('/image',(req,res)=>{})

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})