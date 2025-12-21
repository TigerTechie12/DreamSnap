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
 const [loading, setLoading] = useState(true)
    const navigate=useNavigate()
  useEffect(()=>{
   try{
   const fetchPhotos=async()=>{
       const ph:any= await axios.get('')
    setPhotos(ph)
    }
   fetchPhotos()}
    catch(e){ console.error('Failed to fetch images:', e)}
     finally {
        setLoading(false)
      } 
  },[])
     if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }
return <div>
 <div className='flex'>
 <h1>My Gallery</h1>
    <button className='bg-blue-500 ml-auto'>+ Generate New Image</button>

 </div>
   
    <h4>{photos.length} images generated</h4>

<div>
{photos.map((p)=>(
p.status==='COMPLETED' ? <div key={p.id}   onClick={() => window.open(p.imageUrl[0], '_blank')} className='flex'><div className='border-b-amber-200'>

<img src={p.imageUrl[0]} alt={p.prompt} className="w-full h-80 object-cover"
                loading="lazy" />
 <div className="p-4">
                <p className="text-white font-semibold truncate">{p.prompt}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </p>
                 <p className="text-gray-400 text-sm mt-1">
                  {p.modelId}
                </p>
              </div>




</div><button className='bg-red-600' onClick={()=>{
  useEffect(()=>{const del=async()=>{await axios.delete('')}},[]) 
}}>Delete</button> 
</div> : null
))}
</div>
</div>

}