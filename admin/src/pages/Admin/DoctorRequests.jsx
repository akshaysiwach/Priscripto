import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorRequests = () => {
  const { aToken, doctorRequests, getDoctorRequests, updateDoctorStatus } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getDoctorRequests();
    }
  }, [aToken]);

  return (
    <div className="m-5 w-full">
      <p className="text-lg font-medium mb-4">Doctor Registration Requests</p>
      <div className="bg-white border rounded-2xl overflow-hidden">
        {doctorRequests.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No pending or rejected doctor requests right now.</p>
        ) : (
          doctorRequests.map((doctor) => (
            <div key={doctor._id} className="border-b last:border-b-0 p-5 flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <p className="text-lg font-semibold text-slate-900">{doctor.name}</p>
                <p className="text-sm text-slate-500">{doctor.speciality} • {doctor.experience}</p>
                <p className="text-sm text-slate-500 mt-1">{doctor.email}</p>
                <p className="text-sm text-slate-600 mt-3">{doctor.about}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400 mt-3">Status: {doctor.status}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => updateDoctorStatus(doctor._id, "approved")} className="rounded-full bg-emerald-600 text-white px-4 py-2 text-sm">Approve</button>
                <button onClick={() => updateDoctorStatus(doctor._id, "rejected")} className="rounded-full border border-rose-200 text-rose-600 px-4 py-2 text-sm">Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorRequests;
