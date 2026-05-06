import bcrypt from "bcrypt";
import appointmentModel from "../models/appointmentModel.js";
import adminModel from "../models/adminModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import {
    demoAdminCredentials,
    defaultProfileImage,
    demoDoctorCredentials,
    demoPatientCredentials,
} from "../config/demoCredentials.js";

const defaultDoctorPassword = "ivp@123";

const defaultSchedule = {
    monday: { enabled: true, start: "10:00", end: "18:00" },
    tuesday: { enabled: true, start: "10:00", end: "18:00" },
    wednesday: { enabled: true, start: "10:00", end: "18:00" },
    thursday: { enabled: true, start: "10:00", end: "18:00" },
    friday: { enabled: true, start: "10:00", end: "18:00" },
    saturday: { enabled: true, start: "10:00", end: "14:00" },
    sunday: { enabled: false, start: "10:00", end: "14:00" },
};

const doctorsSeed = [
    ["Dr. Sarah Johnson", "General physician", "MBBS, MD", "8 Years", 700, "New Delhi", 28.6139, 77.209],
    ["Dr. Michael Chen", "Dermatologist", "MBBS, DDVL", "6 Years", 850, "Gurugram", 28.4595, 77.0266],
    ["Dr. Priya Mehta", "Gynecologist", "MBBS, MS", "10 Years", 900, "Noida", 28.5355, 77.391],
    ["Dr. Arjun Kapoor", "Pediatricians", "MBBS, DCH", "7 Years", 650, "Faridabad", 28.4089, 77.3178],
    ["Dr. Neha Bansal", "Neurologist", "MBBS, DM", "12 Years", 1200, "South Delhi", 28.5245, 77.1855],
    ["Dr. Rohan Sharma", "Gastroenterologist", "MBBS, DM", "9 Years", 1100, "Ghaziabad", 28.6692, 77.4538],
    ["Dr. Kavya Iyer", "General physician", "MBBS", "5 Years", 600, "Dwarka", 28.5921, 77.046],
    ["Dr. Manish Verma", "Dermatologist", "MBBS, MD", "11 Years", 950, "Rohini", 28.7495, 77.0565],
    ["Dr. Ananya Rao", "Gynecologist", "MBBS, DGO", "8 Years", 850, "Saket", 28.5244, 77.2066],
    ["Dr. Dev Malhotra", "Neurologist", "MBBS, DM", "14 Years", 1350, "Connaught Place", 28.6315, 77.2167],
];

const buildDateKey = (date) => `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;

const createHashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const buildDoctorSeed = (index, doctorTuple) => {
    const [name, speciality, degree, experience, fees, city, lat, lng] = doctorTuple;
    const email =
        index === 0
            ? demoDoctorCredentials.email
            : `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/\.+$/g, "")}@prescripto.demo`;

    return {
        name,
        email,
        phone: `98${String(index + 1).padStart(8, "0")}`,
        image: defaultProfileImage,
        passwordPlaceholder: index === 0 ? demoDoctorCredentials.password : defaultDoctorPassword,
        speciality,
        degree,
        experience,
        about: `${name} offers attentive ${speciality.toLowerCase()} consultations with a strong focus on patient safety, evidence-based treatment, and practical follow-up care.`,
        fees,
        address: {
            line1: `${12 + index} Health Avenue`,
            line2: city,
            city,
            state: "Delhi NCR",
            country: "India",
        },
        location: {
            clinicName: `${name.split(" ")[1] || "Care"} Clinic`,
            coordinates: { lat, lng },
            mapLabel: `${name} Clinic, ${city}`,
        },
        certificates: [
            {
                title: `${degree} Board Certification`,
                url: `https://example.com/certificates/${email}/board-certification`,
            },
            {
                title: `${speciality} Clinical Practice Certificate`,
                url: `https://example.com/certificates/${email}/clinical-practice`,
            },
        ],
        availabilitySchedule: defaultSchedule,
        available: true,
        status: "approved",
        createdByAdmin: true,
        mustChangePassword: true,
        slots_booked: {},
        date: Date.now(),
    };
};

const ensureSeedDoctors = async () => {
    const seededDoctors = [];

    for (let index = 0; index < doctorsSeed.length; index += 1) {
        const doctorSeed = buildDoctorSeed(index, doctorsSeed[index]);
        let doctor = await doctorModel.findOne({ email: doctorSeed.email });

        if (!doctor) {
            doctor = await doctorModel.create({
                ...doctorSeed,
                password: await createHashedPassword(doctorSeed.passwordPlaceholder),
            });
        }

        seededDoctors.push(doctor);
    }

    return seededDoctors;
};

const ensureDemoPatient = async () => {
    let patient = await userModel.findOne({ email: demoPatientCredentials.email });

    if (!patient) {
        patient = await userModel.create({
            name: "Aarav Sharma",
            email: demoPatientCredentials.email,
            password: await createHashedPassword(demoPatientCredentials.password),
            image: defaultProfileImage,
            phone: "9876543210",
            address: {
                line1: "18 Health Street",
                line2: "New Delhi",
                city: "New Delhi",
                state: "Delhi",
                country: "India",
            },
            gender: "Male",
            dob: "1998-06-14",
            age: 27,
            bloodGroup: "B+",
            allergies: ["Dust"],
            previousHealthIssues: ["Migraines"],
            medications: ["Vitamin D"],
        });
    }

    return patient;
};

const ensureDemoAdmin = async () => {
    const email = demoAdminCredentials.email.toLowerCase();
    let admin = await adminModel.findOne({ email });

    if (!admin) {
        admin = await adminModel.create({
            email,
            password: await createHashedPassword(demoAdminCredentials.password),
            date: Date.now(),
        });
    }

    return admin;
};

const ensureDemoAppointments = async (doctor, patient) => {
    const existingAppointments = await appointmentModel.countDocuments({
        userId: String(patient._id),
        docId: String(doctor._id),
    });

    if (existingAppointments > 0) {
        return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);

    const tomorrowSlotDate = buildDateKey(tomorrow);
    const nextWeekSlotDate = buildDateKey(nextWeek);

    await appointmentModel.insertMany([
        {
            userId: String(patient._id),
            docId: String(doctor._id),
            slotDate: tomorrowSlotDate,
            slotTime: "11:00 AM",
            userData: {
                _id: patient._id,
                name: patient.name,
                email: patient.email,
                image: patient.image,
                dob: patient.dob,
                phone: patient.phone,
                bloodGroup: patient.bloodGroup,
            },
            docData: {
                _id: doctor._id,
                name: doctor.name,
                speciality: doctor.speciality,
                image: doctor.image,
                address: doctor.address,
                fees: doctor.fees,
                certificates: doctor.certificates,
                location: doctor.location,
            },
            amount: doctor.fees,
            date: Date.now(),
            payment: true,
            status: "scheduled",
        },
        {
            userId: String(patient._id),
            docId: String(doctor._id),
            slotDate: nextWeekSlotDate,
            slotTime: "02:00 PM",
            userData: {
                _id: patient._id,
                name: patient.name,
                email: patient.email,
                image: patient.image,
                dob: patient.dob,
                phone: patient.phone,
                bloodGroup: patient.bloodGroup,
            },
            docData: {
                _id: doctor._id,
                name: doctor.name,
                speciality: doctor.speciality,
                image: doctor.image,
                address: doctor.address,
                fees: doctor.fees,
                certificates: doctor.certificates,
                location: doctor.location,
            },
            amount: doctor.fees,
            date: Date.now(),
            payment: false,
            status: "scheduled",
        },
    ]);

    await doctorModel.findByIdAndUpdate(doctor._id, {
        slots_booked: {
            ...doctor.slots_booked,
            [tomorrowSlotDate]: [...(doctor.slots_booked?.[tomorrowSlotDate] || []), "11:00 AM"],
            [nextWeekSlotDate]: [...(doctor.slots_booked?.[nextWeekSlotDate] || []), "02:00 PM"],
        },
    });
};

const seedDemoData = async () => {
    await ensureDemoAdmin();
    const doctors = await ensureSeedDoctors();
    const patient = await ensureDemoPatient();
    await ensureDemoAppointments(doctors[0], patient);
};

export default seedDemoData;
