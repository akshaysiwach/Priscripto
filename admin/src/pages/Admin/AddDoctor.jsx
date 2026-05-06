import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AdminContext } from "../../context/AdminContext";

const AddDoctor = () => {
  const { backendUrl, aToken, getAllDoctors } = useContext(AdminContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    speciality: "General physician",
    degree: "",
    experience: "1 Year",
    fees: "",
    city: "New Delhi",
    clinicName: "",
    latitude: "28.6139",
    longitude: "77.2090",
    about: "",
  });

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/add-doctor",
        {
          ...form,
          certificates: JSON.stringify([
            { title: `${form.degree} Certification`, url: "https://example.com/certificates/primary" },
            { title: `${form.speciality} Specialist Certificate`, url: "https://example.com/certificates/specialist" },
          ]),
        },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(`Doctor added. Default password: ${data.defaultPassword}`);
        setForm({
          name: "",
          email: "",
          phone: "",
          speciality: "General physician",
          degree: "",
          experience: "1 Year",
          fees: "",
          city: "New Delhi",
          clinicName: "",
          latitude: "28.6139",
          longitude: "77.2090",
          about: "",
        });
        getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>
      <div className="bg-white px-8 py-8 border rounded w-full max-w-5xl">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600 mb-6">
          Admin-created doctors are auto-approved, assigned the temporary password <span className="font-mono">ivp@123</span>, and must reset it on first login.
        </div>
        <div className="grid lg:grid-cols-2 gap-5 text-gray-600">
          <input name="name" onChange={onChange} value={form.name} className="border rounded px-3 py-3" type="text" placeholder="Doctor name" required />
          <input name="email" onChange={onChange} value={form.email} className="border rounded px-3 py-3" type="email" placeholder="Doctor email" required />
          <input name="phone" onChange={onChange} value={form.phone} className="border rounded px-3 py-3" type="text" placeholder="Phone number" />
          <input name="degree" onChange={onChange} value={form.degree} className="border rounded px-3 py-3" type="text" placeholder="Degree" required />
          <input name="experience" onChange={onChange} value={form.experience} className="border rounded px-3 py-3" type="text" placeholder="Experience" required />
          <input name="fees" onChange={onChange} value={form.fees} className="border rounded px-3 py-3" type="number" placeholder="Consultation fee" required />
          <input name="clinicName" onChange={onChange} value={form.clinicName} className="border rounded px-3 py-3" type="text" placeholder="Clinic name" />
          <input name="city" onChange={onChange} value={form.city} className="border rounded px-3 py-3" type="text" placeholder="City" required />
          <input name="latitude" onChange={onChange} value={form.latitude} className="border rounded px-3 py-3" type="text" placeholder="Latitude" required />
          <input name="longitude" onChange={onChange} value={form.longitude} className="border rounded px-3 py-3" type="text" placeholder="Longitude" required />
          <select name="speciality" onChange={onChange} value={form.speciality} className="border rounded px-3 py-3">
            <option value="General physician">General physician</option>
            <option value="Gynecologist">Gynecologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Pediatricians">Pediatricians</option>
            <option value="Neurologist">Neurologist</option>
            <option value="Gastroenterologist">Gastroenterologist</option>
          </select>
          <textarea name="about" onChange={onChange} value={form.about} className="border rounded px-3 py-3 lg:col-span-2" rows={5} placeholder="Professional summary" required />
        </div>
        <button type="submit" className="bg-primary px-10 py-3 mt-6 text-white rounded-full">Add doctor</button>
      </div>
    </form>
  );
};

export default AddDoctor;
