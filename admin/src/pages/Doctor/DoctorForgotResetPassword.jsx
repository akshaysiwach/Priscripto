import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorForgotResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(DoctorContext);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const role = useMemo(() => searchParams.get("role") || "doctor", [searchParams]);
  const isAdminReset = role === "admin";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Reset token is missing");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const endpoint = isAdminReset ? "/api/admin/reset-password" : "/api/doctor/reset-password";
      const { data } = await axios.post(backendUrl + endpoint, { token, password });
      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-[#F8F9FD] flex items-center justify-center px-4">
      <div className="max-w-md w-full border border-slate-200 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-200/60">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{isAdminReset ? "Admin" : "Doctor"} Password Reset</p>
        <h1 className="text-3xl font-semibold mt-3">Set a new password</h1>
        <p className="text-slate-500 mt-2">Use the email reset link to choose a new {isAdminReset ? "admin" : "doctor"} account password.</p>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border border-slate-200 rounded-xl p-3 mt-6" placeholder="New password" minLength={8} required />
        <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="w-full border border-slate-200 rounded-xl p-3 mt-4" placeholder="Confirm password" minLength={8} required />
        <button className="w-full mt-5 bg-primary text-white rounded-xl py-3">Reset password</button>
      </div>
    </form>
  );
};

export default DoctorForgotResetPassword;
