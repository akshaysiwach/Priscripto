import express from "express";
import {
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
} from "../controllers/adminController.js";
import { changeAvailablity } from "../controllers/doctorController.js";
import authAdmin from "../middleware/authAdmin.js";

const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin);
adminRouter.post("/forgot-password", forgotAdminPassword);
adminRouter.post("/reset-password", resetAdminPassword);
adminRouter.post("/add-doctor", authAdmin, addDoctor);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.get("/doctor-requests", authAdmin, doctorRequests);
adminRouter.post("/doctor-status", authAdmin, updateDoctorStatus);
adminRouter.post("/change-availability", authAdmin, changeAvailablity);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.get("/users", authAdmin, listUsers);

export default adminRouter;
