export const demoAdminCredentials = {
    email: process.env.ADMIN_EMAIL || "admin@prescripto.demo",
    password: process.env.ADMIN_PASSWORD || "Admin@12345",
};

export const demoDoctorCredentials = {
    email: process.env.DEMO_DOCTOR_EMAIL || "doctor@prescripto.demo",
    password: process.env.DEMO_DOCTOR_PASSWORD || "Doctor@12345",
};

export const demoPatientCredentials = {
    email: process.env.DEMO_PATIENT_EMAIL || "patient@prescripto.demo",
    password: process.env.DEMO_PATIENT_PASSWORD || "Patient@12345",
};

export const jwtSecret = process.env.JWT_SECRET || "prescripto-demo-secret";
export const defaultDoctorPassword = process.env.DEFAULT_DOCTOR_PASSWORD || "ivp@123";

export const defaultProfileImage = "https://i.pravatar.cc/150?img=47";
