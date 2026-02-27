import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@clerk/clerk-react"
import { AppSidebar } from "../components/AppSidebar"

const API_BASE_URL = import.meta.env.VITE_API_URL

interface Model {
    name: string
    id: string
    status: string
}

export function GenerateImages() {
    const { getToken, userId } = useAuth()
    const [prompt, setPrompt] = useState("")
    const [models, setModels] = useState<Model[]>([])
    const [modelId, setModelId] = useState("")
    const [generating, setGenerating] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const token = await getToken()
                const res = await axios.get(`${API_BASE_URL}/models/bulk`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const completed = res.data.dbData.filter((m: Model) => m.status === 'COMPLETED')
                setModels(completed)
            } catch (e) {
                console.error('Failed to fetch models:', e)
            }
        }
        fetchModels()
    }, [])

    const handleGenerate = async () => {
        if (!modelId || !prompt.trim()) {
            alert('Please select a model and enter a prompt')
            return
        }
        try {
            setGenerating(true)
            setStatusMessage("")
            const token = await getToken()
            const response = await axios.post(`${API_BASE_URL}/ai/generate`, {
                prompt,
                userId,
                name: modelId,
                modelId
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setIsSuccess(true)
            setStatusMessage(`Generation started! Check your gallery in a few minutes. (ID: ${response.data.ImageId})`)
        } catch (e: any) {
            console.error('Image generation failed:', e)
            setIsSuccess(false)
            setStatusMessage(e.response?.data?.message || 'Generation failed. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="flex bg-black min-h-screen">
            <AppSidebar />
            <div className="ml-56 flex-1 p-6">
                <h1 className="text-white font-bold text-3xl mb-1">Generate Images</h1>
                <p className="text-gray-400 mb-8">Create stunning AI photos using your trained models</p>

                <div className="flex gap-6">

                    <div className="w-80 shrink-0">
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col gap-5">
                            <h2 className="text-white font-semibold text-lg">Generation Settings</h2>

                            <div>
                                <label className="text-white text-sm font-medium mb-1.5 block">Select Model</label>
                                {models.length === 0 ? (
                                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-gray-500 text-sm">
                                        No trained models available.{' '}
                                        <a href="/models" className="text-blue-400 hover:underline">Train one first</a>
                                    </div>
                                ) : (
                                    <select
                                        value={modelId}
                                        onChange={(e) => setModelId(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white text-sm"
                                    >
                                        <option value="">-- Choose a model --</option>
                                        {models.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="text-white text-sm font-medium mb-1.5 block">Prompt</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe the image you want to generate... e.g. 'a professional headshot in a suit, studio lighting'"
                                    rows={5}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white text-sm resize-none placeholder-gray-600"
                                />
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating || !modelId || !prompt.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                                </svg>
                                {generating ? 'Generating...' : 'Generate Image'}
                            </button>

                            {statusMessage && (
                                <div className={`p-3 rounded-lg text-sm border ${isSuccess
                                    ? 'bg-green-900/20 text-green-400 border-green-500/30'
                                    : 'bg-red-900/20 text-red-400 border-red-500/30'
                                    }`}>
                                    {statusMessage}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-white font-semibold text-lg mb-4">How it works</h2>
                        <div className="flex flex-col gap-3 mb-8">
                            {[
                                { step: '1', label: 'Select your trained AI model from the dropdown' },
                                { step: '2', label: 'Write a detailed prompt describing the image you want' },
                                { step: '3', label: 'Click Generate - your image will be ready in the Gallery shortly' },
                            ].map(({ step, label }) => (
                                <div key={step} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
                                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                                        {step}
                                    </div>
                                    <p className="text-gray-300 text-sm pt-0.5">{label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                            <h3 className="text-white font-semibold mb-2">Prompt Tips</h3>
                            <ul className="text-gray-400 text-sm space-y-1.5 list-disc list-inside">
                                <li>Be specific about lighting, style, and setting</li>
                                <li>Include mood descriptors like "cinematic", "dramatic", "soft"</li>
                                <li>Mention camera angles like "portrait", "close-up", "wide shot"</li>
                                <li>Add style references like "studio lighting", "golden hour", "bokeh"</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
