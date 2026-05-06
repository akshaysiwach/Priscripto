import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [aToken, setAToken] = useState(localStorage.getItem("aToken") ? localStorage.getItem("aToken") : "");
    const [adminEmail, setAdminEmail] = useState(localStorage.getItem("adminEmail") || "Admin");
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [doctorRequests, setDoctorRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [dashData, setDashData] = useState(false);

    const adminHeaders = { headers: { aToken } };

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/admin/all-doctors", adminHeaders);
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getDoctorRequests = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/admin/doctor-requests", adminHeaders);
            if (data.success) {
                setDoctorRequests(data.requests);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const updateDoctorStatus = async (doctorId, status) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/admin/doctor-status",
                { doctorId, status },
                adminHeaders
            );

            if (data.success) {
                toast.success(data.message);
                getDoctorRequests();
                getAllDoctors();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getUsers = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/admin/users", adminHeaders);
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + "/api/admin/change-availability", { docId }, adminHeaders);
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getAllAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/admin/appointments", adminHeaders);
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/admin/cancel-appointment",
                { appointmentId },
                adminHeaders
            );
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/admin/dashboard", adminHeaders);
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <AdminContext.Provider
            value={{
                aToken,
                setAToken,
                adminEmail,
                setAdminEmail,
                appointments,
                getAllAppointments,
                cancelAppointment,
                doctors,
                getAllDoctors,
                changeAvailability,
                doctorRequests,
                getDoctorRequests,
                updateDoctorStatus,
                users,
                getUsers,
                dashData,
                getDashData,
                backendUrl,
            }}
        >
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
