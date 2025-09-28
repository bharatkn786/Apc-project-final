import { Route , Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import SubmitComplaint from "../pages/SubmitComplaint";
import UpdateStatus from "../pages/UpdateStatus";
import MyComplaints from "../pages/MyComplaints";

function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/submit-complaint" element={<SubmitComplaint />} />
      <Route path="/my-complaints" element={<MyComplaints />} />
      <Route path="/update-status" element={<UpdateStatus />} />
    </Routes>
  )
}

export default MainRoutes