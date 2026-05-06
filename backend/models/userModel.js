import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: {
        line1: { type: String, default: "" },
        line2: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "India" },
    },
    gender: { type: String, default: "Not Selected" },
    dob: { type: String, default: "" },
    age: { type: Number, default: 0 },
    bloodGroup: { type: String, default: "" },
    allergies: [{ type: String }],
    previousHealthIssues: [{ type: String }],
    medications: [{ type: String }],
    password: { type: String, required: true },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Number, default: 0 },
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
