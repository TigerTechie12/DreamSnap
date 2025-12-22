
import './App.css'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import { Dashboard } from './pages/dashboard'
import { ForgotPassword } from './pages/forgotpassword'
import { Gallery } from './pages/gallery'
import { GenerateImages } from './pages/generate'
import { Homepage } from './pages/homepage'
import { MyModel } from './pages/mymodel'
import { MyPacks } from './pages/mypacks'
import { SignInPage } from './pages/signin'
import { SignUpPage } from './pages/signup'
import { TrainModel } from './pages/trainmodel'
function App() {


  return (
    <>
      <BrowserRouter>
      <Routes>
<Route path='/' element={<Homepage></Homepage>}></Route>
<Route path='/dashboard' element={<Dashboard></Dashboard>}></Route>
<Route path='/signin' element={<SignInPage></SignInPage>}></Route>
<Route path='/signup' element={<SignUpPage></SignUpPage>}></Route>
<Route path='/forgot' element={<ForgotPassword></ForgotPassword>}></Route>
<Route path='/gallery' element={<Gallery></Gallery>}> </Route>
<Route path='/mymodels'element={<MyModel></MyModel>}></Route>
<Route path='/packs' element={<MyPacks></MyPacks>}></Route>
<Route path='/models' element={<TrainModel></TrainModel>}></Route>
<Route path='/generate' element={<GenerateImages></GenerateImages>}></Route>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
