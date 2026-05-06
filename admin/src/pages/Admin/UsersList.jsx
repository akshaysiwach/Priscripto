import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const UsersList = () => {
  const { aToken, users, getUsers } = useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getUsers();
    }
  }, [aToken]);

  return (
    <div className="m-5 w-full">
      <p className="text-lg font-medium mb-4">Patients</p>
      <div className="bg-white border rounded-2xl overflow-hidden">
        {users.map((user) => (
          <div key={user._id} className="border-b last:border-b-0 p-5 grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-slate-500">{user.email}</p>
            </div>
            <p className="text-slate-600">Blood Group: {user.bloodGroup || "Not set"}</p>
            <p className="text-slate-600">Phone: {user.phone || "Not set"}</p>
            <p className="text-slate-600">Age: {user.age || "Not set"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
