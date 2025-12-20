import React from 'react'
import { useState,useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
interface Photo{
id:string
modelId:string
createdAt:string
updatedAt:string
prompt:string
imageUrl:string
status:string
}
export function Gallery(){
    const [photos,setPhotos]=useState<Photo[]>([])

    const navigate=useNavigate()
  useEffect(()=>{
    const fetchPhotos=async()=>{
       const ph:any= await axios.get('')
    setPhotos(ph)
    }
  },[photos])
    
return <div>
 <div className='flex'>
 <h1>My Gallery</h1>
    <button className='bg-blue-500 ml-auto'>+ Generate New Image</button>

 </div>
   
    <h4>{photos.length} images generated</h4>

<div>
{photos.map((p)=>(
p.status==='COMPLETED' ? <div className='flex'><div className='border-b-amber-200'>
{p.imageUrl}
{p.id}
{p.modelId}
{p.createdAt}
{p.updatedAt}
{p.prompt}
</div><button className='bg-red-600' onClick={()=>{
  useEffect(()=>{const del=async()=>{await axios.delete('')}},[]) 
}}>Delete</button> 
</div> : null
))}
</div>
</div>

}