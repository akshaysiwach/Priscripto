import bcrypt from "bcrypt";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { defaultProfileImage } from "../config/demoCredentials.js";
import { createPasswordResetToken, hashResetToken, signToken } from "../utils/auth.js";
import { sendPasswordResetLink } from "../utils/mailer.js";

const buildDoctorToken = (doctor) =>
    signToken({
        role: "doctor",
        id: doctor._id,
        status: doctor.status,
        mustChangePassword: doctor.mustChangePassword,
    });

const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({ email: email.toLowerCase() });

        if (!doctor) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        if (doctor.status === "pending") {
            return res.json({ success: false, message: "Your account is pending admin approval" });
        }

        if (doctor.status === "rejected") {
            return res.json({ success: false, message: "Your registration was rejected. Please contact admin." });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = buildDoctorToken(doctor);
        return res.json({
            success: true,
            token,
            mustChangePassword: doctor.mustChangePassword,
            doctor: {
                _id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                status: doctor.status,
            },
        });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const registerDoctor = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            speciality,
            degree,
            experience,
            about,
            fees,
            certificates,
            availabilitySchedule,
            clinicName,
            city,
            state,
            country,
            latitude,
            longitude,
        } = req.body;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees) {
            return res.json({ success: false, message: "Missing registration details" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        const existingDoctor = await doctorModel.findOne({ email: email.toLowerCase() });
        if (existingDoctor) {
            return res.json({ success: false, message: "Doctor already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await doctorModel.create({
            name,
            email: email.toLowerCase(),
            phone: phone || "",
            password: hashedPassword,
            image: defaultProfileImage,
            speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            certificates: certificates ? JSON.parse(certificates) : [],
            availabilitySchedule: availabilitySchedule ? JSON.parse(availabilitySchedule) : undefined,
            address: {
                line1: clinicName || `${name} Clinic`,
                line2: city || "",
                city: city || "",
                state: state || "",
                country: country || "India",
            },
            location: {
                clinicName: clinicName || `${name} Clinic`,
                coordinates: {
                    lat: Number(latitude || 0),
                    lng: Number(longitude || 0),
                },
                mapLabel: `${clinicName || name} ${city || ""}`.trim(),
            },
            status: "pending",
            createdByAdmin: false,
            mustChangePassword: false,
            date: Date.now(),
        });

        return res.json({
            success: true,
            message: "Doctor registration submitted. Wait for admin approval.",
        });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const forgotDoctorPassword = async (req, res) => {
    try {
        const { email, origin } = req.body;
        const doctor = await doctorModel.findOne({ email: email.toLowerCase() });

        if (!doctor) {
            return res.json({ success: true, message: "If that email exists, a reset link has been generated." });
        }

        const { rawToken, hashedToken, expiresAt } = createPasswordResetToken();
        doctor.resetPasswordToken = hashedToken;
        doctor.resetPasswordExpires = expiresAt;
        await doctor.save();

        const resetLink = `${origin || "http://localhost:5174"}/reset-password?role=doctor&token=${rawToken}`;
        const delivery = await sendPasswordResetLink({ email: doctor.email, resetLink });

        return res.json({
            success: true,
            message: delivery.message || "Reset link generated",
            resetLink,
        });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const resetDoctorPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const hashedToken = hashResetToken(token);
        const doctor = await doctorModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!doctor) {
            return res.json({ success: false, message: "Reset link is invalid or expired" });
        }

        const salt = await bcrypt.genSalt(10);
        doctor.password = await bcrypt.hash(password, salt);
        doctor.resetPasswordToken = "";
        doctor.resetPasswordExpires = 0;
        doctor.mustChangePassword = false;
        await doctor.save();

        return res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const changeDoctorPassword = async (req, res) => {
    try {
        const { docId, currentPassword, newPassword } = req.body;
        const doctor = await doctorModel.findById(docId);

        if (!doctor) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, doctor.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        doctor.password = await bcrypt.hash(newPassword, salt);
        doctor.mustChangePassword = false;
        await doctor.save();

        return res.json({
            success: true,
            message: "Password updated successfully",
            token: buildDoctorToken(doctor),
        });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body;
        const appointments = await appointmentModel.find({ docId }).sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const appointmentCancel = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true, status: "cancelled" });
            return res.json({ success: true, message: "Appointment Cancelled" });
        }

        res.json({ success: false, message: "Unauthorized action" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                isCompleted: true,
                status: "completed",
            });
            return res.json({ success: true, message: "Appointment Completed" });
        }

        res.json({ success: false, message: "Unauthorized action" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const doctorList = async (req, res) => {
    try {
        const { speciality, city, available } = req.query;
        const filters = { status: "approved" };

        if (speciality) {
            filters.speciality = speciality;
        }

        if (city) {
            filters["address.city"] = new RegExp(city, "i");
        }

        if (available === "true") {
            filters.available = true;
        }

        const doctors = await doctorModel
            .find(filters)
            .select(["-password", "-email", "-resetPasswordToken", "-resetPasswordExpires"])
            .sort({ fees: 1 });

        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const changeAvailablity = async (req, res) => {
    try {
        const { docId } = req.body;
        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
        res.json({ success: true, message: "Availability Updated", available: !docData.available });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const doctorProfile = async (req, res) => {
    try {
        const { docId } = req.body;
        const profileData = await doctorModel.findById(docId).select("-password -resetPasswordToken -resetPasswordExpires");
        res.json({ success: true, profileData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateDoctorProfile = async (req, res) => {
    try {
        const { docId, fees, address, about, available, certificates, availabilitySchedule, location, phone } = req.body;

        await doctorModel.findByIdAndUpdate(docId, {
            fees: Number(fees),
            address,
            about,
            available,
            phone,
            certificates,
            availabilitySchedule,
            location,
        });

        res.json({ success: true, message: "Profile Updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const doctorDashboard = async (req, res) => {
    try {
        const { docId } = req.body;
        const appointments = await appointmentModel.find({ docId }).sort({ date: -1 });

        let earnings = 0;
        appointments.forEach((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount;
            }
        });

        const patients = [];
        appointments.forEach((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId);
            }
        });

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments,
            pendingAppointments: appointments.filter((appointment) => !appointment.cancelled && !appointment.isCompleted).length,
            completedAppointments: appointments.filter((appointment) => appointment.isCompleted).length,
            cancelledAppointments: appointments.filter((appointment) => appointment.cancelled).length,
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    loginDoctor,
    registerDoctor,
    forgotDoctorPassword,
    resetDoctorPassword,
    changeDoctorPassword,
    appointmentsDoctor,
    appointmentCancel,
    doctorList,
    changeAvailablity,
    appointmentComplete,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
};
