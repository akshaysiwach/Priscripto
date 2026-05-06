import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Number, default: 0 },
    date: { type: Number, default: Date.now },
});

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;
