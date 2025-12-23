import React from "react";
import axios from "axios";
import { useState,useEffect,useCallback } from "react";
const API_BASE_URL = import.meta.env.VITE_API_URL
import { useAuth } from "@clerk/clerk-react"
export function TrainModel(){
     const { getToken } = useAuth()
const [name,setName]=useState("")
const [age,setAge]=useState(0)
const [gender,setGender]=useState("")
const [ethinicity,setEthinicity]=useState("")
const [eyeColor,setEyeColor]=useState("")
const [bald,setBald]=useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
const [isDragging,setIsDragging]=useState(false)

const handleDragOver= useCallback((e:React.DragEvent)=>{e.preventDefault()
    setIsDragging(true)
},[])
const handleDragLeave=useCallback((e:React.DragEvent)=>{
    e.preventDefault()
    setIsDragging(false)
},[])
const handleDrop=useCallback((e:React.DragEvent)=>{
      e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )

    if (files.length > 0) {
      handleFiles(files) 
    }
},[])
const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  
  const handleFiles = (files: File[]) => {
    const newFiles = [...uploadedFiles, ...files].slice(0, 20)
    setUploadedFiles(newFiles)
  }

  
  const uploadToS3 = async () => {
    if (uploadedFiles.length < 10) {
      alert('Please upload at least 10 photos')
      return
    }

    setUploading(true)
    const urls: string[] = []

    try {
      for (const file of uploadedFiles) {
    
        const { data } = await axios.post(`${API_BASE_URL}/api/get-upload-url`, {
          fileName: file.name,
          fileType: file.type,
        },{
      headers:{'Authorization':`Bearer ${getToken}`}
    })

    
        await axios.put(data.uploadURL, file, {
          headers: { 'Content-Type': file.type, 'Authorization':`Bearer ${getToken}`},
        })

        urls.push(data.publicURL)
      }

      setUploadedUrls(urls)
      setUploading(false)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
      setUploading(false)
    }
  }

    return <div>
        <h1>Train Your AI Model</h1>
        <h3>Upload 10-20 high-quality photos of yourself to create a personalized AI model</h3>
    <span className="border-white border-r-2">
        <h2>Photo Guidelines</h2>
        <div className="flex flex-col">
        <div className="flex">
            <div>Clear Face</div>
            <div>Good Lighting</div>
        </div>
        <div className="flex">
            <div>Variety</div>
            <div>Solo Photos</div>
          </div>  </div>
    </span>
    <span className="border-white border-r-2">
        <h2>Model Name</h2>
        <h4>Give your model a memorable name</h4>
        <input value={name} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setName(e.target.value)}} type="text" placeholder="name" />
    </span>
    <span className="border-white border-r-2">
        <h2>Model Age</h2>
        
        <input  type="number" value={age} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setAge(Number(e.target.value))}} placeholder="type your age" />
    </span>

 <span className="border-white border-r-2">
  <input value={gender} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setGender(e.target.value)}} list="gender" />
<datalist id="gender">
    <option value="Male"></option>
    <option value="Female"></option>
    <option value="Others"></option>
</datalist>
    </span>

 <span className="border-white border-r-2">
 <input list="ethinicity" value={ethinicity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setEthinicity(e.target.value)}} /> 
<datalist id="ethinicity">
    <option value="White"></option>
    <option value="Black"></option>
    <option value="AsianAmerican"></option>
      <option value="EastAsian"></option>
        <option value="SouthEastAsian"></option>
          <option value="SouthAsianMiddleEastern"></option>
            <option value="Pacific"></option>
              <option value= "Hispanic"></option>
</datalist>
    </span>


 
<span className="border-white border-r-2">
  <input value={eyeColor} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setEyeColor(e.target.value)}}   list="eye color" />
<datalist id="eye color">
    <option value="Brown"></option>
    <option value="Black"></option>
    <option value="Hazel"></option>
    <option value="Gray"></option>
</datalist>
    </span>

<span className="border-white border-r-2">
<input value={bald}  onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setBald(e.target.value)}} list="Bald" />  
<datalist id="Bald">
    <option value="Yes"></option>
    <option value="No"></option>

</datalist>
    </span>


    <span className="border-white border-r-2">
<h2>Upload Photos</h2>
<h4>Drag and drop your photos here or click to upload </h4>
    
    </span>
<button className="bg-blue-500 pt-2 pb-2 pr-4 pl-4" onClick={()=>{useEffect(()=>{
    const trainingModelData=async ()=>{
        const dbUpdate=await axios.post('',{name:{name},gender:{gender},age:{age},bald:{bald},ethinicity:{ethinicity},eyecolor:{eyeColor}},{
      headers:{'Authorization':`Bearer ${getToken}`}
    })
    console.log(dbUpdate)
    }
},[])}}>Start Training</button>
    </div>
}