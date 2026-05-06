import React, { useContext, useEffect, useMemo, useState } from "react";
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat, currency } = useContext(AppContext);
  const [activeHistory, setActiveHistory] = useState("doctors");

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  const formatDateTime = (value) => {
    if (!value) return "Time not available";
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const statusClass = (status) => {
    if (status === "approved" || status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "cancelled" || status === "rejected") return "bg-rose-50 text-rose-700 border-rose-100";
    if (status === "pending" || status === "scheduled") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-slate-50 text-slate-600 border-slate-100";
  };

  const historySections = useMemo(() => {
    if (!dashData) return {};

    return {
      doctors: {
        title: "Doctor History",
        subtitle: "All doctor registrations, approval state, availability, and profile origin.",
        empty: "No doctor history found.",
        rows: dashData.doctorHistory || [],
      },
      appointments: {
        title: "Appointment History",
        subtitle: "All appointment actions with patient, doctor, slot, status, and action time.",
        empty: "No appointment history found.",
        rows: dashData.appointmentHistory || [],
      },
      patients: {
        title: "Patient History",
        subtitle: "All patient accounts currently registered in the platform.",
        empty: "No patient history found.",
        rows: dashData.patientHistory || [],
      },
      revenue: {
        title: "Money History",
        subtitle: "Paid or completed appointments that contributed to revenue tracking.",
        empty: "No revenue history found.",
        rows: dashData.revenueHistory || [],
      },
      pending: {
        title: "Pending Appointment History",
        subtitle: "Appointments waiting to be completed or cancelled.",
        empty: "No pending appointments found.",
        rows: (dashData.appointmentHistory || []).filter((item) => !["completed", "cancelled"].includes(item.status)),
      },
      completed: {
        title: "Completed Appointment History",
        subtitle: "Appointments marked as completed.",
        empty: "No completed appointments found.",
        rows: (dashData.appointmentHistory || []).filter((item) => item.status === "completed"),
      },
      cancelled: {
        title: "Cancelled Appointment History",
        subtitle: "Appointments cancelled by admin, patient, or doctor.",
        empty: "No cancelled appointments found.",
        rows: (dashData.appointmentHistory || []).filter((item) => item.status === "cancelled"),
      },
    };
  }, [dashData]);

  const summaryCards = dashData
    ? [
        { key: "doctors", icon: assets.doctor_icon, value: dashData.doctors, label: "Doctors" },
        { key: "appointments", icon: assets.appointments_icon, value: dashData.appointments, label: "Appointments" },
        { key: "patients", icon: assets.patients_icon, value: dashData.patients, label: "Patients" },
        { key: "revenue", icon: assets.earning_icon, value: `${currency} ${dashData.totalRevenue}`, label: "Revenue" },
      ]
    : [];

  const renderHistoryRows = () => {
    const section = historySections[activeHistory];
    if (!section) return null;

    if (section.rows.length === 0) {
      return <p className="px-5 py-6 text-sm text-slate-500">{section.empty}</p>;
    }

    if (activeHistory === "doctors") {
      return section.rows.map((doctor) => (
        <div key={doctor._id} className="grid gap-3 border-b last:border-b-0 px-5 py-4 text-sm md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <p className="font-semibold text-slate-900">{doctor.name}</p>
            <p className="text-slate-500">{doctor.email}</p>
          </div>
          <p className="text-slate-600">{doctor.speciality}</p>
          <p className="text-slate-600">{doctor.city || "City not set"}</p>
          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${statusClass(doctor.status)}`}>{doctor.status}</span>
          <div>
            <p className="text-slate-700">{doctor.action}</p>
            <p className="text-xs text-slate-400">{formatDateTime(doctor.time)}</p>
          </div>
        </div>
      ));
    }

    if (activeHistory === "patients") {
      return section.rows.map((patient) => (
        <div key={patient._id} className="grid gap-3 border-b last:border-b-0 px-5 py-4 text-sm md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="font-semibold text-slate-900">{patient.name}</p>
            <p className="text-slate-500">{patient.email}</p>
          </div>
          <p className="text-slate-600">Phone: {patient.phone || "Not set"}</p>
          <p className="text-slate-600">Blood Group: {patient.bloodGroup || "Not set"}</p>
          <div>
            <p className="text-slate-700">{patient.action}</p>
            <p className="text-xs text-slate-400">{formatDateTime(patient.time)}</p>
          </div>
        </div>
      ));
    }

    if (activeHistory === "revenue") {
      return section.rows.map((item) => (
        <div key={item._id} className="grid gap-3 border-b last:border-b-0 px-5 py-4 text-sm md:grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr]">
          <div>
            <p className="font-semibold text-slate-900">{item.action}</p>
            <p className="text-xs text-slate-400">{formatDateTime(item.time)}</p>
          </div>
          <p className="text-slate-600">{item.patientName}</p>
          <p className="text-slate-600">{item.doctorName}</p>
          <p className="text-slate-600">{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
          <p className="font-semibold text-emerald-700">{currency} {item.amount}</p>
        </div>
      ));
    }

    return section.rows.map((item) => (
      <div key={item._id} className="grid gap-3 border-b last:border-b-0 px-5 py-4 text-sm md:grid-cols-[1.2fr_1.1fr_1.1fr_1fr_1fr_0.8fr]">
        <div>
          <p className="font-semibold text-slate-900">{item.action}</p>
          <p className="text-xs text-slate-400">{formatDateTime(item.time)}</p>
        </div>
        <p className="text-slate-600">{item.patientName}</p>
        <p className="text-slate-600">{item.doctorName}</p>
        <p className="text-slate-600">{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span>
        <p className="font-semibold text-slate-700">{currency} {item.amount}</p>
      </div>
    ));
  };

  if (!dashData) return null;

  const activeSection = historySections[activeHistory];

  return (
    <div className="m-5 w-full">
      <div className="flex flex-wrap gap-3">
        {summaryCards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setActiveHistory(card.key)}
            className={`flex min-w-52 items-center gap-2 rounded border-2 bg-white p-4 text-left transition-all hover:scale-[1.02] ${activeHistory === card.key ? "border-primary shadow-sm" : "border-gray-100"}`}
          >
            <img className="w-14" src={card.icon} alt="" />
            <div>
              <p className="text-xl font-semibold text-gray-600">{card.value}</p>
              <p className="text-gray-400">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button type="button" onClick={() => setActiveHistory("pending")} className={`rounded-2xl border p-4 text-left transition-all ${activeHistory === "pending" ? "border-amber-300 bg-amber-100" : "border-amber-100 bg-amber-50"}`}>
          <p className="text-sm text-amber-700">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-amber-900">{dashData.pendingAppointments}</p>
        </button>
        <button type="button" onClick={() => setActiveHistory("completed")} className={`rounded-2xl border p-4 text-left transition-all ${activeHistory === "completed" ? "border-emerald-300 bg-emerald-100" : "border-emerald-100 bg-emerald-50"}`}>
          <p className="text-sm text-emerald-700">Completed</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-900">{dashData.completedAppointments}</p>
        </button>
        <button type="button" onClick={() => setActiveHistory("cancelled")} className={`rounded-2xl border p-4 text-left transition-all ${activeHistory === "cancelled" ? "border-rose-300 bg-rose-100" : "border-rose-100 bg-rose-50"}`}>
          <p className="text-sm text-rose-700">Cancelled</p>
          <p className="mt-1 text-2xl font-semibold text-rose-900">{dashData.cancelledAppointments}</p>
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border bg-white">
        <div className="border-b px-5 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-slate-900">{activeSection.title}</p>
              <p className="text-sm text-slate-500">{activeSection.subtitle}</p>
            </div>
            <p className="text-sm font-medium text-slate-500">{activeSection.rows.length} records</p>
          </div>
        </div>
        <div className="max-h-[360px] overflow-y-auto">{renderHistoryRows()}</div>
      </div>

      <div className="bg-white">
        <div className="mt-10 flex items-center gap-2.5 rounded-t border px-4 py-4">
          <img src={assets.list_icon} alt="" />
          <p className="font-semibold">Latest Bookings</p>
        </div>

        <div className="border border-t-0 pt-4">
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div className="flex items-center gap-3 px-6 py-3 hover:bg-gray-100" key={index}>
              <img className="w-10 rounded-full" src={item.docData.image} alt="" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-gray-800">{item.docData.name}</p>
                <p className="text-gray-600">Booking on {slotDateFormat(item.slotDate)} at {item.slotTime}</p>
              </div>
              {item.cancelled ? <p className="text-xs font-medium text-red-400">Cancelled</p> : item.isCompleted ? <p className="text-xs font-medium text-green-500">Completed</p> : <img onClick={() => cancelAppointment(item._id)} className="w-10 cursor-pointer" src={assets.cancel_icon} alt="" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
