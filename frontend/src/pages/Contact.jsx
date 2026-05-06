import React from "react";
import { assets } from "../assets/assets";

const Contact = () => {
  const adminUrl = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174";

  const openDoctorRegistration = () => {
    window.location.href = `${adminUrl}/?mode=register-doctor`;
  };

  return (
    <div>
      <div className="text-center text-2xl pt-10 text-[#707070]">
        <p>
          CONTACT <span className="text-gray-700 font-semibold">US</span>
        </p>
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm">
        <img
          className="w-full md:max-w-[360px]"
          src={assets.contact_image}
          alt=""
        />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className=" font-semibold text-lg text-gray-600">OUR OFFICE</p>
          <p className=" text-gray-500">
            Greater Noida
            <br />
            Uttar Pardesh
          </p>
          <p className=" text-gray-500">
            Tel: (91) 9528267655 <br /> Email: siwach901@gmail.com
          </p>
          <p className=" font-semibold text-lg text-gray-600">
            CAREERS AT Prescripto
          </p>
          <p className=" text-gray-500">
            Interested doctors can register their profile for admin review.
          </p>
          <button onClick={openDoctorRegistration} className="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500">
            Explore Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
