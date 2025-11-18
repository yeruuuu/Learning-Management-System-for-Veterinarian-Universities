import { Link } from "react-router";
import Logo from "../assets/images/logo_background_removed.png";

const Landing = () => {
  return (
    <div className="min-h-screen flex justify-center items-center gap-4 p-8">
      <div className="flex flex-col items-center">
        <div className="p-10 flex flex-col gap-4">
          <h1 className="text-cookie-darkbrown text-6xl font-bold lg:max-w-4xl md:max-w-xl">
            Transform Your Passion for Pets into Expertise
          </h1>
          <p className="text-cookie-darkbrown text-xl lg:max-w-2xl md:max-w-md">
            Whether you're preparing for vet school, enhancing your practice, or
            deepening your understanding of animal care, our expert-led courses
            will guide you every step of the way
          </p>
          <p className="text-cookie-darkbrown text-xl lg:max-w-2xl md:max-w-md">
            Join thousands of students mastering veterinary science through
            interactive lessons, real-world case studies, and hands-on training
            modules.
          </p>
        </div>
        <img
          src={Logo}
          alt="Cookie University Logo"
          className="w-64 lg:w-80 h-auto flex-shrink-0"
        />
      </div>
      <div className="w-full max-w-2xl flex flex-col justify-center items-center bg-cookie-lightcream rounded-md gap-4 p-4">
        <h2 className="font-bold text-3xl text-cookie-darkbrown p-3">
          Signup / Login
        </h2>
        <div>
          <button className="bg-cookie-darkbrown rounded-md text-cookie-white p-3">
            <Link to="/signup">Signup</Link>
          </button>
        </div>
        <div>
          <button className="bg-cookie-darkbrown rounded-md text-cookie-white p-3">
            <Link to="/login">Login</Link>
          </button>
        </div>
      </div>
    </div>
  );
};
export default Landing;
