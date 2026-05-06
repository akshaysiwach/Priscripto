import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";

const demoCredentials = {
  Admin: { email: "admin@prescripto.demo", password: "Admin@12345" },
  Doctor: { email: "doctor@prescripto.demo", password: "ivp@123" },
};

const defaultCertificates = [
  { title: "Medical Council Registration", url: "https://example.com/certificates/registration" },
  { title: "Specialist Training Certificate", url: "https://example.com/certificates/specialist" },
];

const Login = () => {
  const [mode, setMode] = useState("Admin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [experience, setExperience] = useState("");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [city, setCity] = useState("New Delhi");
  const [latitude, setLatitude] = useState("28.6139");
  const [longitude, setLongitude] = useState("77.2090");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { setDToken, setMustChangePassword, setDoctorName } = useContext(DoctorContext);
  const { setAToken, setAdminEmail } = useContext(AdminContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("mode") === "register-doctor") {
      setMode("Register Doctor");
    }
  }, [searchParams]);

  const fillDemoCredentials = () => {
    const creds = demoCredentials[mode];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (mode === "Admin") {
        const { data } = await axios.post(backendUrl + "/api/admin/login", { email, password });
        if (data.success) {
          localStorage.removeItem("dToken");
          localStorage.removeItem("doctorName");
          localStorage.setItem("aToken", data.token);
          localStorage.setItem("adminEmail", email);
          setAToken(data.token);
          setAdminEmail(email);
          navigate("/admin-dashboard");
        } else {
          toast.error(data.message);
        }
        return;
      }

      if (mode === "Doctor") {
        const { data } = await axios.post(backendUrl + "/api/doctor/login", { email, password });
        if (data.success) {
          localStorage.removeItem("aToken");
          localStorage.removeItem("adminEmail");
          localStorage.setItem("dToken", data.token);
          localStorage.setItem("doctorName", data.doctor?.name || email);
          localStorage.setItem("doctorMustChangePassword", String(Boolean(data.mustChangePassword)));
          setDToken(data.token);
          setDoctorName(data.doctor?.name || email);
          setMustChangePassword(Boolean(data.mustChangePassword));
          navigate(data.mustChangePassword ? "/doctor-reset-password" : "/doctor-dashboard");
        } else {
          toast.error(data.message);
        }
        return;
      }

      const { data } = await axios.post(backendUrl + "/api/doctor/register", {
        name,
        email,
        password,
        speciality,
        degree,
        experience,
        fees,
        about,
        clinicName: `${name} Clinic`,
        city,
        state: "Delhi NCR",
        country: "India",
        latitude,
        longitude,
        certificates: JSON.stringify(defaultCertificates),
      });

      if (data.success) {
        toast.success(data.message);
        setMode("Doctor");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const requestForgotPassword = async () => {
    if (!email) {
      toast.error(`Enter your ${mode.toLowerCase()} email first`);
      return;
    }

    try {
      const endpoint = mode === "Admin" ? "/api/admin/forgot-password" : "/api/doctor/forgot-password";
      const { data } = await axios.post(backendUrl + endpoint, {
        email,
        origin: window.location.origin,
      });
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
      <div className="hidden lg:block rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 text-white p-10 min-h-[560px]">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Prescripto Secure Access</p>
        <h1 className="text-5xl font-semibold leading-tight mt-6">
    Seamless doctor appointment booking, smart scheduling, and secure patient management.</h1>
        <p className="mt-6 max-w-xl text-base text-slate-200">
              Book appointments with verified doctors, manage schedules efficiently, and ensure a smooth healthcare experience for both patients and professionals.
        </p>
      </div>

      <form onSubmit={onSubmitHandler} className="bg-white border border-slate-200 shadow-xl shadow-slate-200/60 rounded-[28px] p-8 sm:p-10">
        <div className="flex gap-2 flex-wrap">
          {["Admin", "Doctor", "Register Doctor"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-4 py-2 text-sm ${mode === item ? "bg-slate-900 text-white" : "border border-slate-200 text-slate-700"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="text-3xl font-semibold mt-6">{mode}</p>
        <p className="text-sm text-slate-500 mt-2">
          {mode === "Register Doctor"
            ? "Submit your details. Your profile stays hidden until an admin approves it."
            : "Use secure role-based sign in."}
        </p>

        {/* {(mode === "Admin" || mode === "Doctor") && (
          <button type="button" onClick={fillDemoCredentials} className="mt-4 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Fill Demo Credentials
          </button>
        )} */}

        {mode === "Register Doctor" && (
          <div className="mt-4 rounded-full border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <input value={name} onChange={(e) => setName(e.target.value)} className="border border-slate-200 rounded-xl w-full p-3" placeholder="Full name" required />
            <input value={speciality} onChange={(e) => setSpeciality(e.target.value)} className="border border-slate-200 rounded-xl w-full p-3" placeholder="Speciality" required />
            <input value={degree} onChange={(e) => setDegree(e.target.value)} className="border border-slate-200 rounded-xl w-full p-3" placeholder="Degree" required />
            <input value={experience} onChange={(e) => setExperience(e.target.value)} className="border border-slate-200 rounded-xl w-full p-3" placeholder="Experience" required />
            <input value={fees} onChange={(e) => setFees(e.target.value)} type="number" className="border border-slate-200 rounded-xl w-full p-3" placeholder="Consultation fee" required />
            <input value={city} onChange={(e) => setCity(e.target.value)} className="border border-slate-200 rounded-xl w-full p-3" placeholder="City" required />
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} className="border border-slate-200 rounded-xl w-full p-3" placeholder="Latitude" required />
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} className="border border-slate-200 rounded-xl w-full p-3" placeholder="Longitude" required />
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} className="border border-slate-200 rounded-xl w-full p-3 md:col-span-2" placeholder="Professional summary" rows={4} required />
          </div>
        )}

        <div className="w-full mt-4">
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className="border border-slate-200 rounded-xl w-full p-3 mt-1" type="email" required />
        </div>
        <div className="w-full mt-4">
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className="border border-slate-200 rounded-xl w-full p-3 mt-1" type="password" required />
        </div>

        {(mode === "Admin" || mode === "Doctor") && (
          <button type="button" onClick={requestForgotPassword} className="mt-3 text-sm text-primary underline">
            Forgot password?
          </button>
        )}

        <button className="bg-primary text-white w-full py-3 rounded-xl text-base mt-6">
          {mode === "Register Doctor" ? "Submit registration" : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default Login;
