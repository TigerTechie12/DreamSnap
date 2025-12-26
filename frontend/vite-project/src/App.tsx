
import './App.css'
import { ClerkProvider } from "@clerk/clerk-react"
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import { Dashboard } from './pages/dashboard'
import { Gallery } from './pages/gallery'
import { GenerateImages } from './pages/generate'
import { Homepage } from './pages/homepage'
import { MyModel } from './pages/mymodel'
import { MyPacks } from './pages/mypacks'
import { SignInPage } from './pages/signin'
import { SignUpPage } from './pages/signup'
import { TrainModel } from './pages/trainmodel'
function App() {

 const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  console.log('Clerk Key exists:', !! clerkPubKey)
  console.log('Clerk Key starts with pk_:',  clerkPubKey?.startsWith('pk_'))
  return (
    <>
        <ClerkProvider publishableKey={clerkPubKey}>

      <BrowserRouter>
      <Routes>
<Route path='/' element={<Homepage></Homepage>}></Route>
<Route path='/dashboard' element={<Dashboard></Dashboard>}></Route>
<Route path='/signin' element={<SignInPage></SignInPage>}></Route>
<Route path='/signup' element={<SignUpPage></SignUpPage>}></Route>
<Route path='/gallery' element={<Gallery></Gallery>}> </Route>
<Route path='/mymodels'element={<MyModel></MyModel>}></Route>
<Route path='/packs' element={<MyPacks></MyPacks>}></Route>
<Route path='/models' element={<TrainModel></TrainModel>}></Route>
<Route path='/generate' element={<GenerateImages></GenerateImages>}></Route>
      </Routes>
      </BrowserRouter>  </ClerkProvider>
    </>
  )
}

export default App
