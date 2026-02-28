import './App.css'
import { ClerkProvider } from "@clerk/clerk-react"
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Dashboard } from './pages/dashboard'
import { Gallery } from './pages/gallery'
import { GenerateImages } from './pages/generate'
import { Homepage } from './pages/homepage'
import { MyModel } from './pages/mymodel'
import { MyPacks } from './pages/mypacks'
import { SignInPage } from './pages/signin'
import { SignUpPage } from './pages/signup'
import { TrainModel } from './pages/trainmodel'
import { ProtectRoutes } from './hooks/protected'
function App() {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!clerkPubKey) {
    return (
      <div style={{ color: 'white', background: 'black', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div>
          <h2>Configuration Error</h2>
          <p>VITE_CLERK_PUBLISHABLE_KEY is not set. Please add it to your environment variables.</p>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/signin' element={<SignInPage />} />
          <Route path='/signup' element={<SignUpPage />} />
        <Route element={<ProtectRoutes />}>
          <Route path='/dashboard' element={<Dashboard />} />
          
        <Route path='/gallery' element={<Gallery />} />
          <Route path='/mymodels' element={<MyModel />} />
          <Route path='/packs' element={<MyPacks />} />
          <Route path='/models' element={<TrainModel />} />
          <Route path='/generate' element={<GenerateImages />} /></Route>  
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  )
}

export default App
