import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll w-full">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {doctors.map((doctor) => (
          <div className="border border-[#C9D8FF] rounded-xl max-w-72 overflow-hidden bg-white" key={doctor._id}>
            <img className="bg-[#EAEFFF]" src={doctor.image} alt="" />
            <div className="p-4">
              <p className="text-[#262626] text-lg font-medium">{doctor.name}</p>
              <p className="text-[#5C5C5C] text-sm">{doctor.speciality}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400 mt-2">Status: {doctor.status}</p>
              <p className="text-sm text-slate-500 mt-2">{doctor.address?.city}</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <input onChange={() => changeAvailability(doctor._id)} type="checkbox" checked={doctor.available} />
                <p>Available for booking</p>
              </div>
              {doctor.mustChangePassword && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                  Must reset password on next login
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
