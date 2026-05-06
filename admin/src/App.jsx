import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import Login from "./pages/Login";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorDashBoard from "./pages/Doctor/DoctorDashBoard";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import { DoctorContext } from "./context/DoctorContext";
import { AdminContext } from "./context/AdminContext";
import DoctorRequests from "./pages/Admin/DoctorRequests";
import UsersList from "./pages/Admin/UsersList";
import DoctorResetPassword from "./pages/Doctor/DoctorResetPassword";
import DoctorForgotResetPassword from "./pages/Doctor/DoctorForgotResetPassword";

const App = () => {
  const { dToken, mustChangePassword } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  const isAdmin = Boolean(aToken);
  const isDoctor = Boolean(dToken) && !isAdmin;

  if (!isAdmin && !isDoctor) {
    return (
      <>
        <ToastContainer />
        <Routes>
          <Route path="/reset-password" element={<DoctorForgotResetPassword />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </>
    );
  }

  return (
    <div className="bg-[#F8F9FD] min-h-screen">
      <ToastContainer />
      <Navbar />
      <div className="flex items-start">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to={isAdmin ? "/admin-dashboard" : mustChangePassword ? "/doctor-reset-password" : "/doctor-dashboard"} replace />} />
          <Route path="/admin-dashboard" element={isAdmin ? <Dashboard /> : <Navigate to={mustChangePassword ? "/doctor-reset-password" : "/doctor-dashboard"} replace />} />
          <Route path="/all-appointments" element={isAdmin ? <AllAppointments /> : <Navigate to="/" replace />} />
          <Route path="/add-doctor" element={isAdmin ? <AddDoctor /> : <Navigate to="/" replace />} />
          <Route path="/doctor-list" element={isAdmin ? <DoctorsList /> : <Navigate to="/" replace />} />
          <Route path="/doctor-requests" element={isAdmin ? <DoctorRequests /> : <Navigate to="/" replace />} />
          <Route path="/users" element={isAdmin ? <UsersList /> : <Navigate to="/" replace />} />
          <Route path="/doctor-reset-password" element={isDoctor ? <DoctorResetPassword /> : <Navigate to="/" replace />} />
          <Route path="/doctor-dashboard" element={isDoctor && !mustChangePassword ? <DoctorDashBoard /> : <Navigate to="/doctor-reset-password" replace />} />
          <Route path="/doctor-appointments" element={isDoctor && !mustChangePassword ? <DoctorAppointments /> : <Navigate to="/doctor-reset-password" replace />} />
          <Route path="/doctor-profile" element={isDoctor && !mustChangePassword ? <DoctorProfile /> : <Navigate to="/doctor-reset-password" replace />} />
          <Route path="/reset-password" element={<DoctorForgotResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
