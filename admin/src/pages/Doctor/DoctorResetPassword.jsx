import React, { useContext, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorResetPassword = () => {
  const { changePassword } = useContext(DoctorContext);
  const [currentPassword, setCurrentPassword] = useState("ivp@123");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      return;
    }
    if (newPassword !== confirmPassword) {
      return;
    }
    await changePassword(currentPassword, newPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="m-5 w-full max-w-xl">
      <div className="bg-white border rounded-[28px] p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Security Setup</p>
        <h1 className="text-3xl font-semibold mt-3">Reset your default doctor password</h1>
        <p className="text-slate-500 mt-2">You must change the admin-assigned default password before accessing doctor tools.</p>
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-slate-600">Current password</p>
            <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 mt-1" type="password" required />
          </div>
          <div>
            <p className="text-sm text-slate-600">New password</p>
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 mt-1" type="password" minLength={8} required />
          </div>
          <div>
            <p className="text-sm text-slate-600">Confirm new password</p>
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 mt-1" type="password" minLength={8} required />
          </div>
        </div>
        <button className="mt-6 rounded-xl bg-slate-900 text-white px-5 py-3">Save new password</button>
      </div>
    </form>
  );
};

export default DoctorResetPassword;
