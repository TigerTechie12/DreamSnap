import React from "react"
import axios from "axios"
import { useState,useCallback } from "react"
const API_BASE_URL = import.meta.env.VITE_API_URL
import { useAuth } from "@clerk/clerk-react"
import { AppSidebar } from "../components/AppSidebar"
export function TrainModel(){
     const { getToken, userId } = useAuth()
const [name,setName]=useState("")
const [age,setAge]=useState(0)
const [gender,setGender]=useState("")
const [ethinicity,setEthinicity]=useState("")
const [eyeColor,setEyeColor]=useState("")
const [bald,setBald]=useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
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
    setUploadedFiles(newFiles)
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
        const file = uploadedFiles[i]

        
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

        urls.push(data.publicURL)

       
        const progress = Math.round(((i + 1) / uploadedFiles.length) * 100)
        setUploadProgress(progress)
      }

      setS3Urls(urls)
      setUploading(false)
      console.log("All files uploaded to S3:", urls)
      return urls
    } catch (error: any) {
      console.error("Upload failed:", error)
      setUploading(false)
      const isNetworkErr = !error.response && error.message === "Network Error"
      throw new Error(isNetworkErr ? "Failed to upload to S3. Check S3 bucket CORS settings." : error.message)
    }
  };

  const startTraining = async () => {
  
    if (!name) {
      alert("Please enter a model name")
      return
    }
    if (uploadedFiles.length < 10) {
      alert("Please upload at least 10 photos")
      return
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
          images: imageUrls,
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
      if (response.data.mode === "queued") {
        alert(
          `Training queued!\n\nYour model is in the training queue and will be ` +
          `processed automatically. It will show as COMPLETED in your Models page when done.`
        )
      } else {
        alert(`Training started! Model ID: ${response.data.modelId}`)
      }

    
    } catch (error: any) {
      console.error("Training failed:", error)
      const msg = error.response?.data?.message || error.message || "Training failed. Please try again."
      alert(msg)
    } finally {
      setTraining(false)
    }
  }

    const selectClass = "w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-3 text-white mt-3 mb-4 appearance-none focus:outline-none focus:border-blue-500"
    const fieldClass = "border border-gray-700 rounded-xl w-full md:w-140 px-4 pt-4 pb-2 mt-4"

    return <div className="flex bg-black min-h-screen">
<AppSidebar />
<div className="md:ml-56 flex-1 pt-16 md:pt-0">

    <div className="flex flex-col mt-0 justify-center items-center px-4 pb-12">
        <h1 className="font-bold text-white mt-8 text-3xl md:text-4xl text-center">Train Your AI Model</h1>
        <p className="mt-2 mb-6 text-gray-400 text-center max-w-md">Upload high-quality photos of yourself to create a personalized AI model</p>

    <div className={fieldClass}>
        <h2 className="text-white text-base font-semibold">Model Name</h2>
        <p className="text-gray-500 text-sm mb-1">Give your model a memorable name</p>
        <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-3 text-white mt-1 mb-4 focus:outline-none focus:border-blue-500" value={name} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setName(e.target.value)}} type="text" placeholder="Name" />
    </div>

    <div className={fieldClass}>
        <h2 className="text-white text-base font-semibold">Model Age</h2>
        <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-3 text-white mt-3 mb-4 focus:outline-none focus:border-blue-500" type="number" value={age} onChange={(e:React.ChangeEvent<HTMLInputElement>)=>{setAge(Number(e.target.value))}} placeholder="Your age" />
    </div>

    <div className={fieldClass}>
        <h2 className="text-white text-base font-semibold">Gender</h2>
        <select className={selectClass} value={gender} onChange={(e)=>{setGender(e.target.value)}}>
            <option value="" disabled>Select Gender</option>
            <option value="Man">Man</option>
            <option value="Woman">Woman</option>
            <option value="Others">Others</option>
        </select>
    </div>

    <div className={fieldClass}>
        <h2 className="text-white text-base font-semibold">Ethnicity</h2>
        <select className={selectClass} value={ethinicity} onChange={(e)=>{setEthinicity(e.target.value)}}>
            <option value="" disabled>Select Ethnicity</option>
            <option value="White">White</option>
            <option value="Black">Black</option>
            <option value="AsianAmerican">Asian American</option>
            <option value="EastAsian">East Asian</option>
            <option value="SouthEastAsian">South East Asian</option>
            <option value="SouthAsianMiddleEastern">South Asian / Middle Eastern</option>
            <option value="Pacific">Pacific Islander</option>
            <option value="Hispanic">Hispanic</option>
        </select>
    </div>

    <div className={fieldClass}>
        <h2 className="text-white text-base font-semibold">Eye Color</h2>
        <select className={selectClass} value={eyeColor} onChange={(e)=>{setEyeColor(e.target.value)}}>
            <option value="" disabled>Select Eye Color</option>
            <option value="Brown">Brown</option>
            <option value="Blue">Blue</option>
            <option value="Hazel">Hazel</option>
            <option value="Gray">Gray</option>
        </select>
    </div>

    <div className={fieldClass}>
        <h2 className="text-white text-base font-semibold">Baldness</h2>
        <select className={selectClass} value={bald} onChange={(e)=>{setBald(e.target.value)}}>
            <option value="" disabled>Select Baldness</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
        </select>
    </div>
  <div className="border border-gray-700 rounded-xl w-full md:w-140 mt-4 p-5">
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
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
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
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-8 mt-6 rounded-xl transition-colors w-full"
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
    </div>
}