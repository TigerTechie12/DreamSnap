import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import { AppSidebar } from "../components/AppSidebar"

const API_BASE_URL = import.meta.env.VITE_API_URL

interface Model {
    id: string
    name: string
    gender: string
    age: number
    bald: boolean
    ethinicity: string
    eyecolor: string
    status: string
    createdAt: string
    updatedAt: string
}

export function MyModel() {
    const { getToken } = useAuth()
    const [models, setModels] = useState<Model[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const token = await getToken()
                const res = await axios.get(`${API_BASE_URL}/models/bulk`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                setModels(res.data.dbData)
            } catch (e) {
                console.error('Failed to fetch models:', e)
            } finally {
                setLoading(false)
            }
        }
        fetchModels()
    }, [])

    if (loading) {
        return (
            <div className="flex bg-black min-h-screen">
                <AppSidebar />
                <div className="ml-56 flex-1 flex items-center justify-center">
                    <div className="text-white text-xl">Loading models...</div>
                </div>
            </div>
        )
    }

    const trainingModels = models.filter(m => m.status === 'TRAINING')
    const completedModels = models.filter(m => m.status === 'COMPLETED')
    const failedModels = models.filter(m => m.status === 'FAILED')

    return (
        <div className="flex bg-black min-h-screen">
            <AppSidebar />
            <div className="ml-56 flex-1 p-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-white font-bold text-3xl">My Models</h1>
                    <button
                        onClick={() => navigate('/models')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                        </svg>
                        Train New Model
                    </button>
                </div>
                <p className="text-gray-400 mb-6">Manage your personalized AI models</p>

                {models.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-gray-700 rounded-xl">
                        <svg className="w-14 h-14 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                        </svg>
                        <p className="text-gray-400 text-xl mb-4">No models trained yet</p>
                        <button
                            onClick={() => navigate('/models')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
                        >
                            Train your first model
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">

                        {/* Training */}
                        {trainingModels.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    <h2 className="text-xl font-bold text-white">Training</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {trainingModels.map(model => (
                                        <div key={model.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-white font-bold text-lg">{model.name}</h3>
                                                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full font-medium">Training</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-3">Training in progress... This may take ~15 minutes</p>
                                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                                                <div className="bg-blue-500 h-1.5 rounded-full animate-pulse w-3/5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed */}
                        {completedModels.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                    </svg>
                                    <h2 className="text-xl font-bold text-white">Ready to Use</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {completedModels.map(model => (
                                        <div key={model.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-white font-bold text-lg">{model.name}</h3>
                                                <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium">Ready</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                                <div className="bg-gray-800 rounded-lg p-2">
                                                    <p className="text-gray-500 text-xs mb-0.5">Gender</p>
                                                    <p className="text-gray-200">{model.gender}</p>
                                                </div>
                                                <div className="bg-gray-800 rounded-lg p-2">
                                                    <p className="text-gray-500 text-xs mb-0.5">Age</p>
                                                    <p className="text-gray-200">{model.age}</p>
                                                </div>
                                                <div className="bg-gray-800 rounded-lg p-2">
                                                    <p className="text-gray-500 text-xs mb-0.5">Ethnicity</p>
                                                    <p className="text-gray-200">{model.ethinicity}</p>
                                                </div>
                                                <div className="bg-gray-800 rounded-lg p-2">
                                                    <p className="text-gray-500 text-xs mb-0.5">Eye Color</p>
                                                    <p className="text-gray-200">{model.eyecolor}</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-xs mb-4">Created {new Date(model.createdAt).toLocaleDateString()}</p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate('/generate')}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                                                    </svg>
                                                    Generate
                                                </button>
                                                <button
                                                    onClick={() => navigate('/packs')}
                                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    Packs
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Failed */}
                        {failedModels.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                    </svg>
                                    <h2 className="text-xl font-bold text-white">Failed</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {failedModels.map(model => (
                                        <div key={model.id} className="bg-gray-900 border border-red-900/50 rounded-xl p-5">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-white font-bold text-lg">{model.name}</h3>
                                                <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full font-medium">Failed</span>
                                            </div>
                                            <p className="text-gray-500 text-sm mb-4">Training failed. Please try again with different photos.</p>
                                            <button
                                                onClick={() => navigate('/models')}
                                                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
                                            >
                                                Retrain
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    )
}
