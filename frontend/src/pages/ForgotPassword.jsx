import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const { backendUrl } = useContext(AppContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/user/forgot-password", {
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
    <form onSubmit={handleSubmit} className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full border border-slate-200 rounded-[28px] bg-white p-8 shadow-xl shadow-slate-200/60">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Account Recovery</p>
        <h1 className="text-3xl font-semibold mt-3">Forgot your password?</h1>
        <p className="text-slate-500 mt-2">Enter your patient account email to generate a reset link.</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border border-slate-200 rounded-xl p-3 mt-6" placeholder="Email address" required />
        <button className="w-full mt-5 bg-black text-white rounded-xl py-3">Send reset link</button>
      </div>
    </form>
  );
};

export default ForgotPassword;
