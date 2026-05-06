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

export const defaultProfileImage =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#dbeafe" />
                    <stop offset="100%" stop-color="#bfdbfe" />
                </linearGradient>
            </defs>
            <rect width="480" height="480" rx="96" fill="url(#bg)" />
            <circle cx="240" cy="180" r="88" fill="#1d4ed8" opacity="0.15" />
            <path d="M126 384c18-58 70-94 114-94s96 36 114 94" fill="#1d4ed8" opacity="0.18" />
            <circle cx="240" cy="168" r="74" fill="#1d4ed8" opacity="0.8" />
            <path d="M126 384c18-58 70-94 114-94s96 36 114 94" fill="#1d4ed8" opacity="0.8" />
        </svg>
    `);
