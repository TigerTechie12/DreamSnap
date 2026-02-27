import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from "@clerk/clerk-react"
import { useNavigate } from 'react-router-dom'
import { AppSidebar } from '../components/AppSidebar'

const API_BASE_URL = import.meta.env.VITE_API_URL

interface Photo {
    id: string
    createdAt: string
    prompt: string
    imageUrl: string[]
}

export function Gallery() {
    const { getToken } = useAuth()
    const [photos, setPhotos] = useState<Photo[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const token = await getToken()
                const res = await axios.get(`${API_BASE_URL}/images/bulk`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                setPhotos(res.data.images)
            } catch (e) {
                console.error('Failed to fetch images:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchPhotos()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id)
            const token = await getToken()
            await axios.delete(`${API_BASE_URL}/image/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setPhotos(prev => prev.filter(p => p.id !== id))
        } catch (e) {
            console.error('Failed to delete image:', e)
            alert('Failed to delete image.')
        } finally {
            setDeletingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex bg-black min-h-screen">
                <AppSidebar />
                <div className="ml-56 flex-1 flex items-center justify-center">
                    <div className="text-white text-xl">Loading gallery...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex bg-black min-h-screen">
            <AppSidebar />
            <div className="ml-56 flex-1 p-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-white font-bold text-3xl">My Gallery</h1>
                    <button
                        onClick={() => navigate('/generate')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                        </svg>
                        Generate New Image
                    </button>
                </div>
                <p className="text-gray-400 mb-6">{photos.length} images generated</p>

                {photos.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-700 rounded-xl">
                        <svg className="w-14 h-14 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400 text-xl mb-4">No images generated yet</p>
                        <button
                            onClick={() => navigate('/generate')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
                        >
                            Generate your first image
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 group">
                                <div className="relative">
                                    <img
                                        src={photo.imageUrl[0]}
                                        alt={photo.prompt}
                                        className="w-full h-64 object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
                                        onClick={() => window.open(photo.imageUrl[0], '_blank')}
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-4">
                                    <p className="text-white text-sm font-medium truncate">{photo.prompt}</p>
                                    <p className="text-gray-500 text-xs mt-1">{new Date(photo.createdAt).toLocaleDateString()}</p>
                                    <button
                                        onClick={() => handleDelete(photo.id)}
                                        disabled={deletingId === photo.id}
                                        className="mt-3 w-full bg-red-600/10 hover:bg-red-600 border border-red-600/30 hover:border-red-600 text-red-400 hover:text-white text-sm py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === photo.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
