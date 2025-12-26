import React from "react";
import axios from "axios";
import { useState,useEffect,useCallback } from "react";
const API_BASE_URL = import.meta.env.VITE_API_URL
import { useAuth } from "@clerk/clerk-react"
import {Sidebar,SidebarContent,SidebarProvider} from "../components/ui/sidebar"
export function TrainModel(){
     const { getToken } = useAuth()
const [name,setName]=useState("")
const [age,setAge]=useState(0)
const [gender,setGender]=useState("")
const [ethinicity,setEthinicity]=useState("")
const [eyeColor,setEyeColor]=useState("")
const [bald,setBald]=useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [s3Urls, setS3Urls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [training, setTraining] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

 
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    )

    if (files.length > 0) {
      handleFiles(files)
    }
  }, [])

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

 
  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index)
    setUploadedFiles(newFiles);
  };


  const uploadToS3 = async (): Promise<string[]> => {
    if (uploadedFiles.length < 10) {
      alert("Please upload at least 10 photos")
      throw new Error("Not enough files")
    }

    setUploading(true)
    const urls: string[] = []
    const token = await getToken()

    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];

        
        const { data } = await axios.post(
          `${API_BASE_URL}/api/get-upload-url`,
          {
            fileName: file.name,
            fileType: file.type,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        
        await axios.put(data.uploadURL, file, {
          headers: { "Content-Type": file.type },
        })

        urls.push(data.publicURL);

       
        const progress = Math.round(((i + 1) / uploadedFiles.length) * 100)
        setUploadProgress(progress)
      }

      setS3Urls(urls)
      setUploading(false)
      console.log("All files uploaded to S3:", urls)
      return urls
    } catch (error) {
      console.error("Upload failed:", error)
      setUploading(false)
      throw error
    }
  };

  const startTraining = async () => {
  
    if (!name) {
      alert("Please enter a model name");
      return;
    }
    if (uploadedFiles.length < 10) {
      alert("Please upload at least 10 photos")
      return;
    }

    setTraining(true)

    try {
      
      let imageUrls = s3Urls
      if (s3Urls.length === 0) {
        imageUrls = await uploadToS3()
      }

      
      const token = await getToken()

      
      const response = await axios.post(
        `${API_BASE_URL}/ai/training`,
        {
          imageUrl: imageUrls, 
          name: name,
          age: age,
          gender: gender,
          ethinicity: ethinicity,
          eye_color: eyeColor,
          bald: bald === "Yes",
          userId: userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Training started:", response.data)
      alert(`Training started! Model ID: ${response.data.modelId}`)

    
    } catch (error: any) {
      console.error("Training failed:", error)
      alert(error.response?.data?.message || "Training failed. Please try again.")
    } finally {
      setTraining(false)
    }
  }

    return <div className="bg-black"> 
    <SidebarProvider>
<Sidebar></Sidebar>
<SidebarContent ></SidebarContent>
</SidebarProvider>
    <div className="flex flex-col justify-center items-center">
        <h1 className="font-bold text-white mt-7 ml-5 text-4xl text-center">Train Your AI Model</h1>
        <h3 className="ml-5 mb-5 text-gray-400 text-center">Upload high-quality photos of yourself to create a personalized AI model</h3>
   
    <div className="border border-gray-700 rounded-lg w-1/2">
        <h2 className="text-white text-xl ml-3 font-semibold mt-3">Model Name</h2>
        <h4 className="text-gray-400 ml-3">Give your model a memorable name</h4>
        <input className="border border-gray-700 rounded-md border-r-2 w-3/4 ml-3 mb-6 text-gray-500 mt-3" value={name} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setName(e.target.value)}} type="text" placeholder="Name" />
    </div>
    <div className="border border-gray-700 rounded-lg mt-4 w-1/2">
        <h2 className="text-white text-xl ml-3  font-semibold mt-3" >Model Age</h2>
        
        <input className="border border-gray-700 rounded-md w-3/4 ml-3 mb-6 text-gray-500 mt-3"  type="number" value={age} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setAge(Number(e.target.value))}} placeholder="type your age" />
    </div>

 <div className="border border-gray-700 rounded-lg w-1/2  mt-5">
 <h2 className="text-white text-xl ml-3  font-semibold mt-3" >Gender</h2>
  <input  className="border border-gray-700 rounded-md w-3/4 ml-3 mb-6 text-gray-500 mt-3" placeholder="Select Gender" value={gender} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setGender(e.target.value)}} list="gender" />
<datalist className="text-white" id="gender">
    <option value="Male"></option>
    <option value="Female"></option>
    <option value="Others"></option>
</datalist>
    </div>

 <div className="border border-gray-700 rounded-lg w-1/2 mt-5">
     <h2 className="text-white text-xl ml-3  font-semibold mt-3" >Ethinicity</h2>
 <input   className="border border-gray-700 rounded-md w-3/4 ml-3 mb-6 text-gray-500 mt-3" placeholder="Select Ethinicity"  list="ethinicity" value={ethinicity} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setEthinicity(e.target.value)}} /> 
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
    </div>


 
<div className="border border-gray-700 rounded-lg  mt-5 w-1/2">
    <h2 className="text-white text-xl ml-3  font-semibold mt-3" >Eye Color</h2>
  <input  className="border border-gray-700 rounded-md w-3/4 ml-3 mb-6 text-gray-500 mt-3" value={eyeColor}  placeholder="Select Eye Color" onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setEyeColor(e.target.value)}}   list="eye color" />
<datalist id="eye color">
    <option value="Brown"></option>
    <option value="Black"></option>
    <option value="Hazel"></option>
    <option value="Gray"></option>
</datalist>
    </div>

<div className="border border-gray-700 rounded-lg w-1/2 mt-5">
     <h2 className="text-white text-xl ml-3  font-semibold mt-3" >Baldness</h2>
<input className="border border-gray-700 rounded-md w-3/4 ml-3 mb-6 text-gray-500 mt-3"  value={bald} placeholder="Select Baldness"  onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setBald(e.target.value)}} list="Bald" />  
<datalist id="Bald">
    <option value="Yes"></option>
    <option value="No"></option>

</datalist>
    </div>
  <div className="border border-gray-700 rounded-lg w-1/2 mt-5 p-6">
          <h2 className="text-white font-bold text-xl text-center">Upload Photos</h2>
          <h4 className="text-gray-400 text-center mb-4">
            {uploadedFiles.length}/20 photos uploaded (minimum 10 required)
          </h4>

        
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-all duration-200
              ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-600 bg-gray-900/50 hover:border-gray-500"
              }
            `}
          >
            <div className="flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-blue-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="font-medium text-white text-lg">
                Drop files to Attach, or{" "}
                <span className="text-blue-500 underline">browse</span>
              </span>
            </div>
            <input
              id="fileInput"
              type="file"
              name="file_upload"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileInput}
            />
          </div>
 {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <div className="grid grid-cols-5 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 
                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
{uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Uploading to S3...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
 {s3Urls.length > 0 && !uploading && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500 rounded">
              <p className="text-green-500 text-center">
                ✅ {s3Urls.length} images uploaded to S3 successfully!
              </p>
            </div>
          )}
        </div>
<button
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed
            text-white font-bold py-4 px-8 mt-8 rounded-xl transition-colors w-1/2"
          onClick={startTraining}
          disabled={uploading || training || uploadedFiles.length < 10}
        >
          {uploading
            ? `Uploading... ${uploadProgress}%`
            : training
            ? "Starting Training..."
            : "Start Training (~15 min)"}
        </button>
    </div>
    </div>
}