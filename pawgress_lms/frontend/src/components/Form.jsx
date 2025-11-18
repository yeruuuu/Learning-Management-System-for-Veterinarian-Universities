import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { ACCESS_TOKEN, REFRESH_TOKEN, ROLE } from "../constants";
import api from "../api";
import toast from "react-hot-toast";
import { RoleContext } from "../contexts/RoleContext";
import SignUp from "../pages/SignUp";

const Form = ({ isSignUp, route }) => {
  const [loading, setLoading] = useState(false);
  const [localRole, setLocalRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { setRole } = useContext(RoleContext);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (isSignUp) {
      const missingFields = [];
      if (!localRole) missingFields.push("Role");
      if (!firstName) missingFields.push("First Name");
      if (!lastName) missingFields.push("Last Name");
      if (!email) missingFields.push("Email");
      if (!password) missingFields.push("Password");

      if (missingFields.length > 0) {
        toast.error(`Please fill out: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }
    } else {
      const missingFields = [];
      if (!email) missingFields.push("Email");
      if (!password) missingFields.push("Password");

      if (missingFields.length > 0) {
        toast.error(`Please fill out: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const res = await api.post(route, {
          role: localRole,
          first_name: firstName,
          last_name: lastName,
          email,
          password
        });
        navigate("/login");
      } else {
        const res = await api.post(route, {
          email,
          password
        });
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        setRole(res.data.role);
        localStorage.setItem(ROLE, res.data.role);
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="mx-auto my-auto max-w-lg bg-cookie-lightcream rounded-md flex flex-col justify-center items-center p-4 gap-4"
      onSubmit={handleSubmit}
    >
      <h1 className="text-lg">{isSignUp ? "Sign Up" : "Login"}</h1>
      {isSignUp && (
        <>
          <select
            className="rounded-md p-1 bg-cookie-lightcream border border-cookie-darkbrown placeholder:text-cookie-darkbrown text-cookie-darkbrown"
            value={localRole}
            onChange={(e) => setLocalRole(e.target.value)}
          >
            <option value="" disabled>
              Select your role
            </option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <input
            className="rounded-md p-1 bg-cookie-lightcream border border-cookie-darkbrown placeholder:text-cookie-darkbrown text-cookie-darkbrown"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
          />
          <input
            className="rounded-md p-1 bg-cookie-lightcream border border-cookie-darkbrown placeholder:text-cookie-darkbrown text-cookie-darkbrown"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
          />
          <input
            className="rounded-md p-1 bg-cookie-lightcream border border-cookie-darkbrown placeholder:text-cookie-darkbrown text-cookie-darkbrown"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="rounded-md p-1 bg-cookie-lightcream border border-cookie-darkbrown placeholder:text-cookie-darkbrown text-cookie-darkbrown"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </>
      )}
      {!isSignUp && (
        <>
          <input
            className="rounded-md p-1 bg-cookie-lightcream border border-cookie-darkbrown placeholder:text-cookie-darkbrown text-cookie-darkbrown"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            className="rounded-md p-1 bg-cookie-lightcream border border-cookie-darkbrown placeholder:text-cookie-darkbrown text-cookie-darkbrown"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </>
      )}
      <button
        className="min-w-20 bg-cookie-darkbrown rounded-md text-white p-2"
        type="submit"
      >
        {isSignUp ? "Sign Up" : "Login"}
      </button>
    </form>
  );
};
export default Form;
