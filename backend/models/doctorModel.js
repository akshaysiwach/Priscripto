import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, default: "" },
        password: { type: String, required: true },
        image: { type: String, required: true },
        speciality: { type: String, required: true },
        degree: { type: String, required: true },
        experience: { type: String, required: true },
        about: { type: String, required: true },
        fees: { type: Number, required: true },
        address: {
            line1: { type: String, default: "" },
            line2: { type: String, default: "" },
            city: { type: String, default: "" },
            state: { type: String, default: "" },
            country: { type: String, default: "India" },
        },
        location: {
            clinicName: { type: String, default: "" },
            coordinates: {
                lat: { type: Number, default: 0 },
                lng: { type: Number, default: 0 },
            },
            mapLabel: { type: String, default: "" },
        },
        certificates: [
            {
                title: { type: String, required: true },
                url: { type: String, required: true },
            },
        ],
        availabilitySchedule: {
            type: Object,
            default: {
                monday: { enabled: true, start: "10:00", end: "18:00" },
                tuesday: { enabled: true, start: "10:00", end: "18:00" },
                wednesday: { enabled: true, start: "10:00", end: "18:00" },
                thursday: { enabled: true, start: "10:00", end: "18:00" },
                friday: { enabled: true, start: "10:00", end: "18:00" },
                saturday: { enabled: true, start: "10:00", end: "14:00" },
                sunday: { enabled: false, start: "10:00", end: "14:00" },
            },
        },
        available: { type: Boolean, default: true },
        slots_booked: { type: Object, default: {} },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        createdByAdmin: { type: Boolean, default: false },
        mustChangePassword: { type: Boolean, default: false },
        resetPasswordToken: { type: String, default: "" },
        resetPasswordExpires: { type: Number, default: 0 },
        date: { type: Number, required: true },
    },
    { minimize: false }
);

const doctorModel = mongoose.models.doctor || mongoose.model("doctor", doctorSchema);
export default doctorModel;
