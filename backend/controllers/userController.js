import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { defaultProfileImage } from "../config/demoCredentials.js";
import {
    createPasswordResetToken,
    hashResetToken,
    signToken,
} from "../utils/auth.js";
import { sendPasswordResetLink } from "../utils/mailer.js";

const getStripeUnavailableMessage = () => "Stripe is not configured yet";
const getRazorpayUnavailableMessage = () => "Razorpay is not configured yet";

const getStripeInstance = async () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        return null;
    }
    const stripe = (await import("stripe")).default;
    return new stripe(process.env.STRIPE_SECRET_KEY);
};

const getRazorpayInstance = async () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return null;
    }
    const razorpay = (await import("razorpay")).default;
    return new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

const generateUserToken = (user) => signToken({ role: "patient", id: user._id });

const normalizeArrayField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing details" });
        }

        const existingUser = await userModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists. Please log in." });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            image: defaultProfileImage,
        });

        return res.json({ success: true, token: generateUserToken(user) });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        return res.json({ success: true, token: generateUserToken(user) });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email, origin } = req.body;
        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.json({ success: true, message: "If that email exists, a reset link has been generated." });
        }

        const { rawToken, hashedToken, expiresAt } = createPasswordResetToken();
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = expiresAt;
        await user.save();

        const resetLink = `${origin || "http://localhost:5173"}/reset-password?role=patient&token=${rawToken}`;
        const delivery = await sendPasswordResetLink({ email: user.email, resetLink });

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

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const hashedToken = hashResetToken(token);
        const user = await userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.json({ success: false, message: "Reset link is invalid or expired" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = "";
        user.resetPasswordExpires = 0;
        await user.save();

        return res.json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
        return res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const {
            userId,
            name,
            phone,
            address,
            dob,
            age,
            gender,
            bloodGroup,
            allergies,
            previousHealthIssues,
            medications,
        } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data missing" });
        }

        const updates = {
            name,
            phone,
            address: typeof address === "string" ? JSON.parse(address) : address,
            dob,
            age: Number(age || 0),
            gender,
            bloodGroup,
            allergies: normalizeArrayField(allergies),
            previousHealthIssues: normalizeArrayField(previousHealthIssues),
            medications: normalizeArrayField(medications),
        };

        await userModel.findByIdAndUpdate(userId, updates);

        if (imageFile && process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_SECRET_KEY) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            await userModel.findByIdAndUpdate(userId, { image: imageUpload.secure_url });
        }

        return res.json({ success: true, message: "Profile Updated" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const reserveDoctorSlot = async (doctor, slotDate, slotTime) => {
    const slotsBooked = doctor.slots_booked || {};
    const bookedSlots = slotsBooked[slotDate] || [];

    if (bookedSlots.includes(slotTime)) {
        return { success: false, message: "Slot Not Available" };
    }

    slotsBooked[slotDate] = [...bookedSlots, slotTime];
    await doctorModel.findByIdAndUpdate(doctor._id, { slots_booked: slotsBooked });
    return { success: true, slotsBooked };
};

const releaseDoctorSlot = async (doctorId, slotDate, slotTime) => {
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) return;
    const slotsBooked = doctor.slots_booked || {};
    slotsBooked[slotDate] = (slotsBooked[slotDate] || []).filter((entry) => entry !== slotTime);
    await doctorModel.findByIdAndUpdate(doctorId, { slots_booked: slotsBooked });
};

const buildAppointmentDocData = (doctor) => ({
    _id: doctor._id,
    name: doctor.name,
    speciality: doctor.speciality,
    image: doctor.image,
    address: doctor.address,
    fees: doctor.fees,
    certificates: doctor.certificates,
    location: doctor.location,
    experience: doctor.experience,
});

const buildAppointmentUserData = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
    dob: user.dob,
    phone: user.phone,
    bloodGroup: user.bloodGroup,
    allergies: user.allergies,
});

const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;

        if (!slotDate || !slotTime) {
            return res.json({ success: false, message: "Please select an available time slot" });
        }

        const doctor = await doctorModel.findById(docId).select("-password -resetPasswordToken -resetPasswordExpires");
        if (!doctor || doctor.status !== "approved") {
            return res.json({ success: false, message: "Doctor not available for booking" });
        }

        if (!doctor.available) {
            return res.json({ success: false, message: "Doctor is currently unavailable" });
        }

        const user = await userModel.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
        const slotReservation = await reserveDoctorSlot(doctor, slotDate, slotTime);
        if (!slotReservation.success) {
            return res.json(slotReservation);
        }

        const appointment = await appointmentModel.create({
            userId,
            docId,
            slotDate,
            slotTime,
            userData: buildAppointmentUserData(user),
            docData: buildAppointmentDocData(doctor),
            amount: doctor.fees,
            date: Date.now(),
            status: "scheduled",
        });

        return res.json({ success: true, message: "Appointment booked successfully", appointment });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment || appointment.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, {
            cancelled: true,
            status: "cancelled",
        });
        await releaseDoctorSlot(appointment.docId, appointment.slotDate, appointment.slotTime);

        return res.json({ success: true, message: "Appointment Cancelled" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const rescheduleAppointment = async (req, res) => {
    try {
        const { userId, appointmentId, slotDate, slotTime } = req.body;
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment || appointment.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        const doctor = await doctorModel.findById(appointment.docId).select("-password -resetPasswordToken -resetPasswordExpires");
        if (!doctor || doctor.status !== "approved" || !doctor.available) {
            return res.json({ success: false, message: "Doctor is unavailable for rescheduling" });
        }

        const slotReservation = await reserveDoctorSlot(doctor, slotDate, slotTime);
        if (!slotReservation.success) {
            return res.json(slotReservation);
        }

        await releaseDoctorSlot(appointment.docId, appointment.slotDate, appointment.slotTime);

        const updatedAppointment = await appointmentModel.findByIdAndUpdate(
            appointmentId,
            {
                slotDate,
                slotTime,
                status: "rescheduled",
                rescheduledFrom: `${appointment.slotDate} ${appointment.slotTime}`,
            },
            { new: true }
        );

        return res.json({
            success: true,
            message: "Appointment rescheduled successfully",
            appointment: updatedAppointment,
        });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 });
        return res.json({ success: true, appointments });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const paymentRazorpay = async (req, res) => {
    try {
        const razorpayInstance = await getRazorpayInstance();
        if (!razorpayInstance) {
            return res.json({ success: false, message: getRazorpayUnavailableMessage() });
        }

        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment cancelled or not found" });
        }

        const order = await razorpayInstance.orders.create({
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY || "INR",
            receipt: appointmentId,
        });

        return res.json({ success: true, order });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const verifyRazorpay = async (req, res) => {
    try {
        const razorpayInstance = await getRazorpayInstance();
        if (!razorpayInstance) {
            return res.json({ success: false, message: getRazorpayUnavailableMessage() });
        }

        const { razorpay_order_id } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (orderInfo.status === "paid") {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            return res.json({ success: true, message: "Payment Successful" });
        }

        return res.json({ success: false, message: "Payment Failed" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const paymentStripe = async (req, res) => {
    try {
        const stripeInstance = await getStripeInstance();
        if (!stripeInstance) {
            return res.json({ success: false, message: getStripeUnavailableMessage() });
        }

        const { appointmentId } = req.body;
        const { origin } = req.headers;
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment cancelled or not found" });
        }

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&appointmentId=${appointmentData._id}`,
            cancel_url: `${origin}/verify?success=false&appointmentId=${appointmentData._id}`,
            line_items: [
                {
                    price_data: {
                        currency: (process.env.CURRENCY || "INR").toLowerCase(),
                        product_data: { name: "Appointment Fees" },
                        unit_amount: appointmentData.amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
        });

        return res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

const verifyStripe = async (req, res) => {
    try {
        const { appointmentId, success } = req.body;

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
            return res.json({ success: true, message: "Payment Successful" });
        }

        return res.json({ success: false, message: "Payment Failed" });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: error.message });
    }
};

export {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    changePassword,
    getProfile,
    updateProfile,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    listAppointment,
    paymentRazorpay,
    verifyRazorpay,
    paymentStripe,
    verifyStripe,
};
