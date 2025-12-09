import React from 'react'
import { useState,useEffect } from 'react'
import axios from axios
export function Gallery(){
    const [numberOfImages,setNumberOfImages]=useState()
    const [photos,setPhotos]=useState([])
return <div>
 <div className='flex'>
 <h1>My Gallery</h1>
    <button className='bg-blue-500 ml-auto'>+ Generate New Image</button>

 </div>
   
    <h4>{numberOfImages} images generated</h4>
<input type="text" placeholder='search bar' />
<div>
    
</div>
</div>

}