import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const demoPatientCredentials = {
  name: "Aarav Sharma",
  email: "patient@prescripto.demo",
  password: "Patient@12345",
};

const Login = () => {
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { backendUrl, token, setToken, clearSession, userData } = useContext(AppContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === "Sign Up") {
        clearSession();
        const { data } = await axios.post(backendUrl + "/api/user/register", { name, email, password });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        } else {
          toast.error(data.message);
        }
      } else {
        clearSession();
        const { data } = await axios.post(backendUrl + "/api/user/login", { email, password });
        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fillDemoCredentials = () => {
    setName(demoPatientCredentials.name);
    setEmail(demoPatientCredentials.email);
    setPassword(demoPatientCredentials.password);
    setState("Login");
  };

  useEffect(() => {
    if (token && userData) {
      navigate("/");
    }
  }, [token, userData, navigate]);

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
      <div className="hidden lg:block rounded-[32px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 text-white p-10 min-h-[560px]">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Prescripto Secure Access</p>
        <h1 className="text-5xl font-semibold leading-tight mt-6">
    Seamless doctor appointment booking, smart scheduling, and secure patient management.</h1>
        <p className="mt-6 max-w-xl text-base text-slate-200">
              Book appointments with verified doctors, manage schedules efficiently, and ensure a smooth healthcare experience for both patients and professionals.
        </p>
      </div>

      <form onSubmit={onSubmitHandler} className="bg-white border border-slate-200 rounded-[28px] shadow-xl shadow-slate-200/70 p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Patient Access</p>
        <p className="text-3xl font-semibold mt-3">{state === "Sign Up" ? "Create Account" : "Login"}</p>
        <p className="text-slate-500 mt-2">Sign in to manage appointments, prescriptions, and medical details.</p>
        {/* <div className="mt-6">
          <button type="button" onClick={fillDemoCredentials} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Use Patient Demo
          </button>
        </div> */}
        {state === "Sign Up" && (
          <div className="w-full mt-6">
            <p>Full Name</p>
            <input onChange={(e) => setName(e.target.value)} value={name} className="border border-slate-200 rounded-xl w-full p-3 mt-1" type="text" required />
          </div>
        )}
        <div className="w-full mt-4">
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className="border border-slate-200 rounded-xl w-full p-3 mt-1" type="email" required />
        </div>
        <div className="w-full mt-4">
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className="border border-slate-200 rounded-xl w-full p-3 mt-1" type="password" minLength={8} required />
        </div>
        {state === "Login" && (
          <Link to="/forgot-password" className="inline-block mt-3 text-sm text-primary underline">
            Forgot password?
          </Link>
        )}
        <button className="bg-black text-white w-full py-3 my-6 rounded-xl text-base">
          {state === "Sign Up" ? "Create account" : "Login"}
        </button>
        {state === "Sign Up" ? (
          <p className="text-slate-500">
            Already have an account?{" "}
            <span onClick={() => setState("Login")} className="text-black underline cursor-pointer">
              Login here
            </span>
          </p>
        ) : (
          <p className="text-slate-500">
            Create a new account?{" "}
            <span onClick={() => setState("Sign Up")} className="text-black underline cursor-pointer">
              Click here
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
