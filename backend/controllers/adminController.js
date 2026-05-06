import bcrypt from "bcrypt";
import adminModel from "../models/adminModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import { defaultDoctorPassword, defaultProfileImage } from "../config/demoCredentials.js";
import { createPasswordResetToken, hashResetToken, signToken } from "../utils/auth.js";
import { sendPasswordResetLink } from "../utils/mailer.js";

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email?.toLowerCase();
        if (!normalizedEmail || !password) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const admin = await adminModel.findOne({ email: normalizedEmail });

        if (!admin) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = signToken({ role: "admin", email: admin.email });
        return res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const forgotAdminPassword = async (req, res) => {
    try {
        const { email, origin } = req.body;
        const normalizedEmail = email?.toLowerCase();
        if (!normalizedEmail) {
            return res.json({ success: false, message: "Email is required" });
        }

        const admin = await adminModel.findOne({ email: normalizedEmail });

        if (!admin) {
            return res.json({ success: true, message: "If that email exists, a reset link has been generated." });
        }

        const { rawToken, hashedToken, expiresAt } = createPasswordResetToken();
        admin.resetPasswordToken = hashedToken;
        admin.resetPasswordExpires = expiresAt;
        await admin.save();

        const resetLink = `${origin || "http://localhost:5174"}/reset-password?role=admin&token=${rawToken}`;
        const delivery = await sendPasswordResetLink({ email: admin.email, resetLink });

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

const resetAdminPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.json({ success: false, message: "Token and password are required" });
        }

        const hashedToken = hashResetToken(token);
        const admin = await adminModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            return res.json({ success: false, message: "Reset link is invalid or expired" });
        }

        admin.password = await hashPassword(password);
        admin.resetPasswordToken = "";
        admin.resetPasswordExpires = 0;
        await admin.save();

        return res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const addDoctor = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            speciality,
            degree,
            experience,
            about,
            fees,
            address,
            certificates,
            clinicName,
            city,
            state,
            country,
            latitude,
            longitude,
            availabilitySchedule,
        } = req.body;

        if (!name || !email || !speciality || !degree || !experience || !about || !fees) {
            return res.json({ success: false, message: "Missing doctor details" });
        }

        const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            return res.json({ success: false, message: "Doctor with this email already exists" });
        }

        const doctor = await doctorModel.create({
            name,
            email: email.toLowerCase(),
            phone: phone || "",
            password: await hashPassword(defaultDoctorPassword),
            image: defaultProfileImage,
            speciality,
            degree,
            experience,
            about,
            fees: Number(fees),
            address: address
                ? JSON.parse(address)
                : {
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
            certificates: certificates
                ? JSON.parse(certificates)
                : [
                      {
                          title: `${degree} Certification`,
                          url: `https://example.com/certificates/${email}/primary`,
                      },
                  ],
            availabilitySchedule: availabilitySchedule ? JSON.parse(availabilitySchedule) : undefined,
            available: true,
            createdByAdmin: true,
            status: "approved",
            mustChangePassword: true,
            date: Date.now(),
        });

        return res.json({
            success: true,
            message: "Doctor Added",
            doctor,
            defaultPassword: defaultDoctorPassword,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const appointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({}).sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const appointmentCancel = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await appointmentModel.findByIdAndUpdate(
            appointmentId,
            { cancelled: true, status: "cancelled" },
            { new: true }
        );

        res.json({ success: true, message: "Appointment Cancelled", appointment });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const allDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select("-password -resetPasswordToken -resetPasswordExpires").sort({ date: -1 });
        res.json({ success: true, doctors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const doctorRequests = async (req, res) => {
    try {
        const requests = await doctorModel
            .find({ status: { $in: ["pending", "rejected"] }, createdByAdmin: false })
            .select("-password -resetPasswordToken -resetPasswordExpires")
            .sort({ date: -1 });

        res.json({ success: true, requests });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateDoctorStatus = async (req, res) => {
    try {
        const { doctorId, status } = req.body;

        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.json({ success: false, message: "Invalid doctor status" });
        }

        const updates = {
            status,
            available: status === "approved",
        };

        if (status === "approved") {
            updates.mustChangePassword = true;
        }

        const doctor = await doctorModel.findByIdAndUpdate(doctorId, updates, { new: true }).select("-password");
        res.json({ success: true, message: `Doctor ${status}`, doctor });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel
            .find({})
            .select("-password -resetPasswordToken -resetPasswordExpires")
            .sort({ date: -1 });
        const users = await userModel
            .find({})
            .select("-password -resetPasswordToken -resetPasswordExpires")
            .sort({ name: 1 });
        const appointments = await appointmentModel.find({}).sort({ date: -1 });

        const getCreatedTime = (doc) => doc.date || doc._id?.getTimestamp?.()?.getTime?.() || Date.now();
        const appointmentHistory = appointments.map((appointment) => {
            const status = appointment.cancelled
                ? "cancelled"
                : appointment.isCompleted
                  ? "completed"
                  : appointment.status || "scheduled";

            return {
                _id: appointment._id,
                action: status === "cancelled" ? "Appointment cancelled" : status === "completed" ? "Appointment completed" : status === "rescheduled" ? "Appointment rescheduled" : "Appointment booked",
                status,
                patientName: appointment.userData?.name || "Patient",
                doctorName: appointment.docData?.name || "Doctor",
                amount: appointment.amount,
                payment: appointment.payment,
                slotDate: appointment.slotDate,
                slotTime: appointment.slotTime,
                rescheduledFrom: appointment.rescheduledFrom,
                time: appointment.date,
            };
        });

        const revenueHistory = appointments
            .filter((appointment) => appointment.payment || appointment.isCompleted)
            .map((appointment) => ({
                _id: appointment._id,
                action: appointment.payment ? "Payment received" : "Consultation completed",
                patientName: appointment.userData?.name || "Patient",
                doctorName: appointment.docData?.name || "Doctor",
                amount: appointment.amount,
                slotDate: appointment.slotDate,
                slotTime: appointment.slotTime,
                time: appointment.date,
            }));

        const doctorHistory = doctors.map((doctor) => ({
            _id: doctor._id,
            action: doctor.createdByAdmin ? "Doctor added by admin" : "Doctor registration submitted",
            name: doctor.name,
            email: doctor.email,
            speciality: doctor.speciality,
            status: doctor.status,
            available: doctor.available,
            city: doctor.address?.city || "",
            mustChangePassword: doctor.mustChangePassword,
            time: getCreatedTime(doctor),
        }));

        const patientHistory = users.map((user) => ({
            _id: user._id,
            action: "Patient account created",
            name: user.name,
            email: user.email,
            phone: user.phone,
            bloodGroup: user.bloodGroup,
            time: getCreatedTime(user),
        }));

        const dashData = {
            doctors: doctors.length,
            activeDoctors: doctors.filter((doctor) => doctor.status === "approved").length,
            pendingDoctors: doctors.filter((doctor) => doctor.status === "pending").length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.sort((a, b) => b.date - a.date),
            pendingAppointments: appointments.filter((appointment) => !appointment.cancelled && !appointment.isCompleted).length,
            completedAppointments: appointments.filter((appointment) => appointment.isCompleted).length,
            cancelledAppointments: appointments.filter((appointment) => appointment.cancelled).length,
            totalRevenue: appointments.reduce((sum, appointment) => (appointment.payment ? sum + appointment.amount : sum), 0),
            doctorHistory,
            appointmentHistory,
            patientHistory,
            revenueHistory,
        };

        res.json({ success: true, dashData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}).select("-password -resetPasswordToken -resetPasswordExpires").sort({ name: 1 });
        res.json({ success: true, users });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    loginAdmin,
    forgotAdminPassword,
    resetAdminPassword,
    addDoctor,
    appointmentsAdmin,
    appointmentCancel,
    allDoctors,
    doctorRequests,
    updateDoctorStatus,
    adminDashboard,
    listUsers,
};
