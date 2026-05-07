import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from 'socket.io-client';

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dToken, setDToken] = useState(localStorage.getItem("dToken") ? localStorage.getItem("dToken") : "");
    const [doctorName, setDoctorName] = useState(localStorage.getItem("doctorName") || "Doctor");
    const [mustChangePassword, setMustChangePassword] = useState(
        localStorage.getItem("doctorMustChangePassword") === "true"
    );
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);
    const [socket, setSocket] = useState(null);

    const doctorHeaders = { headers: { dToken } };

    const getAppointments = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/doctor/appointments", doctorHeaders);
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/doctor/profile", doctorHeaders);
            if (data.success) {
                setProfileData(data.profileData);
                setDoctorName(data.profileData.name || data.profileData.email || "Doctor");
                localStorage.setItem("doctorName", data.profileData.name || data.profileData.email || "Doctor");
                setMustChangePassword(Boolean(data.profileData.mustChangePassword));
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
                backendUrl + "/api/doctor/cancel-appointment",
                { appointmentId },
                doctorHeaders
            );
            if (data.success) {
                toast.success(data.message);
                getAppointments();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/doctor/complete-appointment",
                { appointmentId },
                doctorHeaders
            );
            if (data.success) {
                toast.success(data.message);
                getAppointments();
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
            const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", doctorHeaders);
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const toggleAvailability = async () => {
        try {
            const { data } = await axios.post(backendUrl + "/api/doctor/change-availability", {}, doctorHeaders);
            if (data.success) {
                toast.success(data.message);
                getProfileData();
                getDashData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/doctor/change-password",
                { currentPassword, newPassword },
                doctorHeaders
            );

            if (data.success) {
                toast.success(data.message);
                setMustChangePassword(false);
                localStorage.setItem("doctorMustChangePassword", "false");
                if (data.token) {
                    setDToken(data.token);
                    localStorage.setItem("dToken", data.token);
                }
                getProfileData();
                return true;
            }

            toast.error(data.message);
            return false;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    useEffect(() => {
        if (dToken) {
            const newSocket = io(backendUrl, {
                auth: { token: dToken }
            });
            setSocket(newSocket);
            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [dToken]);

    return (
        <DoctorContext.Provider
            value={{
                dToken,
                setDToken,
                doctorName,
                setDoctorName,
                mustChangePassword,
                setMustChangePassword,
                backendUrl,
                appointments,
                getAppointments,
                cancelAppointment,
                completeAppointment,
                dashData,
                getDashData,
                profileData,
                setProfileData,
                getProfileData,
                toggleAvailability,
                changePassword,
                socket,
            }}
        >
            {props.children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;
