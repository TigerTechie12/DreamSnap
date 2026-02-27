import { useEffect, useState } from "react"
import axios from "axios"
import { createPortal } from "react-dom"
import { useAuth } from "@clerk/clerk-react"
import { AppSidebar } from "../components/AppSidebar"

const API_BASE_URL = import.meta.env.VITE_API_URL

export function MyPacks() {
    const { getToken, userId } = useAuth()

    interface Packs {
        id: string
        modelId: string
        packType: string
        status: 'PENDING' | 'COMPLETED' | 'FAILED'
        totalImages: number
        createdAt: string
        updatedAt: string
        progress?: number
        packImages?: PackImage[]
    }
    interface PackImage {
        id: string
        imageUrl: string[]
        prompts: string
    }
    interface Models {
        name: string
        gender: string
        age: string
        bald: string
        ethinicity: string
        eyecolor: string
        createdAt: string
        updatedAt: string
        status: string
        id: string
    }

    const [generatingPacks, setGeneratingPacks] = useState<Packs[]>([])
    const [completedPacks, setCompletedPacks] = useState<Packs[]>([])
    const [loading, setLoading] = useState(true)
    const [prompts, setPrompts] = useState<string[]>([""])
    const [packType, setPackType] = useState("")
    const [images, setImages] = useState(0)
    const [trainedModels, setTrainedModels] = useState<Models[]>([])
    const [inputs, setInputs] = useState<string[]>([""])
    const [showModal, setShowModal] = useState(false)
    const [selectedModelId, setSelectedModelId] = useState("")
    const [selectedPackId, setSelectedPackId] = useState("")
    const [updateShowModal, setUpdateShowModal] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const fetchPacks = async () => {
        try {
            const token = await getToken()
            const res = await axios.get(`${API_BASE_URL}/packs/bulk`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const packs: Packs[] = res.data.packs
            setGeneratingPacks(packs.filter(p => p.status === 'PENDING'))
            setCompletedPacks(packs.filter(p => p.status === 'COMPLETED'))
        } catch (e) {
            console.error('Failed to fetch packs:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const token = await getToken()
                const res = await axios.get(`${API_BASE_URL}/models/bulk`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                setTrainedModels(res.data.dbData)
            } catch (e) {
                console.error('Failed to fetch models:', e)
            }
        }
        fetchModels()
        fetchPacks()
    }, [])

    const handleCreatePack = async () => {
        if (!selectedModelId || !packType || images < 1 || prompts.filter(p => p.trim()).length < 1) {
            alert('Please fill in all fields')
            return
        }
        try {
            setSubmitting(true)
            const token = await getToken()
            await axios.post(`${API_BASE_URL}/ai/pack/generate`, {
                modelId: selectedModelId,
                packType,
                userId,
                totalImages: images,
                prompts: prompts.filter(p => p.trim())
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setShowModal(false)
            setPackType("")
            setImages(0)
            setPrompts([""])
            setInputs([""])
            setSelectedModelId("")
            await fetchPacks()
        } catch (e) {
            console.error('Failed to create pack:', e)
            alert('Failed to create pack. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdatePack = async () => {
        if (!selectedPackId) return
        try {
            setSubmitting(true)
            const token = await getToken()
            await axios.put(`${API_BASE_URL}/update/pack${selectedPackId}`, {
                modelId: selectedModelId,
                packType,
                userId,
                totalImages: images,
                prompts: prompts.filter(p => p.trim())
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setUpdateShowModal(false)
            await fetchPacks()
        } catch (e) {
            console.error('Failed to update pack:', e)
            alert('Failed to update pack. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeletePack = async (packId: string) => {
        try {
            const token = await getToken()
            await axios.delete(`${API_BASE_URL}/pack/${packId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            await fetchPacks()
        } catch (e) {
            console.error('Failed to delete pack:', e)
            alert('Failed to delete pack.')
        }
    }

    if (loading) {
        return (
            <div className="flex bg-black min-h-screen">
                <AppSidebar />
                <div className="ml-56 flex-1 flex items-center justify-center">
                    <div className="text-white text-xl">Loading packs...</div>
                </div>
            </div>
        )
    }

    return <div className="flex bg-black min-h-screen">
        <AppSidebar />
        <div className="ml-56 flex-1 p-6">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-white font-bold text-3xl">Photo Packs</h1>
                <button onClick={() => { setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                    </svg>
                    Generate Pack
                </button>
            </div>
            <h3 className="text-gray-400 mb-6">Create and manage themed image collections with custom prompts</h3>

            {/* Create Pack Modal */}
            {showModal && createPortal(
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-white font-bold text-xl mb-1">Create New Pack</h2>
                        <h3 className="text-gray-400 text-sm mb-4">Define your pack details and add multiple prompts.</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-white text-sm font-semibold mb-1">Pack Type</h2>
                                <input type="text" value={packType} onChange={(e) => { setPackType(e.target.value) }} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm" placeholder="e.g. Valentine's, Beach, Royal" />
                            </div>
                            <div>
                                <h2 className="text-white text-sm font-semibold mb-1">Total Images</h2>
                                <input type="number" value={images} onChange={(e) => { setImages(+e.target.value) }} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm" min={1} />
                            </div>
                            <div>
                                <h2 className="text-white text-sm font-semibold mb-1">Select Model</h2>
                                <select value={selectedModelId} onChange={(e) => { setSelectedModelId(e.target.value) }} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm">
                                    <option value="">-- Choose a trained model --</option>
                                    {trainedModels.filter(m => m.status === 'COMPLETED').map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <h2 className="text-white text-sm font-semibold">Prompts</h2>
                                    <button onClick={() => { setInputs([...inputs, ""]); setPrompts([...prompts, ""]) }} className="text-blue-400 text-sm hover:text-blue-300">+ Add Prompt</button>
                                </div>
                                {inputs.map((_: string, idx: number) => (
                                    <input key={idx} type="text" placeholder={`Prompt ${idx + 1}`} value={prompts[idx] ?? ""} onChange={(e) => {
                                        const updated = [...prompts]
                                        updated[idx] = e.target.value
                                        setPrompts(updated)
                                    }} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm mb-2" />
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-600 text-gray-300 py-2 rounded-xl hover:bg-gray-800">Cancel</button>
                            <button onClick={handleCreatePack} disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-2 rounded-xl">
                                {submitting ? 'Creating...' : 'Create Pack'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Generating Packs */}
            {generatingPacks.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center mb-6">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                        <h2 className="text-2xl font-bold text-white">Generating</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {generatingPacks.map((pack) => (
                            <div key={pack.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-white">{pack.packType}</h3>
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                                <p className="text-gray-400 mb-2">Generating... {pack.progress || 60}%</p>
                                <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pack.progress || 60}%` }} />
                                </div>
                                <p className="text-gray-500 text-sm">{pack.totalImages} images total</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Packs */}
            <div>
                <div className="flex items-center mb-6">
                    <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-white">Completed Packs</h2>
                </div>

                {completedPacks.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-xl">No completed packs yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {completedPacks.map((pack) => (
                            <div key={pack.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                                {pack.packImages && pack.packImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-1">
                                        {pack.packImages.slice(0, 4).map((img, idx) => (
                                            <img key={idx} src={img.imageUrl[0]} alt="" className="w-full h-48 object-cover" />
                                        ))}
                                    </div>
                                )}
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{pack.packType}</h3>
                                        <p className="text-gray-400 text-sm">{pack.totalImages} images • {new Date(pack.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                            setSelectedPackId(pack.id)
                                            setSelectedModelId(pack.modelId)
                                            setPackType(pack.packType)
                                            setUpdateShowModal(true)
                                        }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm">+ Add Images</button>
                                        <button onClick={() => handleDeletePack(pack.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Update Pack Modal */}
            {updateShowModal && createPortal(
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg">
                        <h2 className="text-white font-bold text-xl mb-4">Add More Images</h2>
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-white text-sm font-semibold mb-1">Total Images to Add</h2>
                                <input type="number" value={images} onChange={(e) => { setImages(+e.target.value) }} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm" min={1} />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <h2 className="text-white text-sm font-semibold">Prompts</h2>
                                    <button onClick={() => { setInputs([...inputs, ""]); setPrompts([...prompts, ""]) }} className="text-blue-400 text-sm hover:text-blue-300">+ Add Prompt</button>
                                </div>
                                {inputs.map((_: string, idx: number) => (
                                    <input key={idx} type="text" placeholder={`Prompt ${idx + 1}`} value={prompts[idx] ?? ""} onChange={(e) => {
                                        const updated = [...prompts]
                                        updated[idx] = e.target.value
                                        setPrompts(updated)
                                    }} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm mb-2" />
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setUpdateShowModal(false)} className="flex-1 border border-gray-600 text-gray-300 py-2 rounded-xl hover:bg-gray-800">Cancel</button>
                            <button onClick={handleUpdatePack} disabled={submitting} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-2 rounded-xl">
                                {submitting ? 'Updating...' : 'Add Images'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    </div>
}
