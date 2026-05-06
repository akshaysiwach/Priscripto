import React, { useContext, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const { data } = await axios.post(backendUrl + "/api/user/reset-password", { token, password });
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full border border-slate-200 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-200/60">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Password Reset</p>
        <h1 className="text-3xl font-semibold mt-3">Set a new password</h1>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full border border-slate-200 rounded-xl p-3 mt-6" placeholder="New password" minLength={8} required />
        <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="w-full border border-slate-200 rounded-xl p-3 mt-4" placeholder="Confirm password" minLength={8} required />
        <button className="w-full mt-5 bg-black text-white rounded-xl py-3">Reset password</button>
      </div>
    </form>
  );
};

export default ResetPassword;
