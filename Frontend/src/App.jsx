import Navbar from './components/Navbar'
import Signup from './pages/Signup'
import {BrowserRouter as Router} from "react-router-dom"
import Registrationroutes from './routes/registrationroutes'
import MainRoutes from './routes/MainRoutes'

function App() {
  return (
    <>
    <Router>
      <Navbar />
      <Registrationroutes />
      <MainRoutes />
    </Router>
    </>
  )
}

export default App