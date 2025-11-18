import { useContext, useState } from "react";
import { Link } from "react-router";
import { RoleContext } from "../contexts/RoleContext";
import { ALargeSmall } from "lucide-react";
import logo from "../assets/images/logo_background_removed.png";

const Navbar = ({ onToggleFontSlider }) => {
  const { role } = useContext(RoleContext);

  return (
    <header>
      <div className="mx-auto max-w-full p-4 bg-cookie-lightorange rounded-3xl">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-cookie-darkbrown"
            >
              <img
                src={logo}
                alt="Pawgress Logo"
                className="h-12 w-12 object-contain"
              />
              <span className="text-2xl font-semibold">Pawgress</span>
            </Link>
          </div>

          <div className="flex justify-between items-center gap-6">
            <button
              onClick={onToggleFontSlider}
              className="hover:bg-green-50 hover:rounded-md px-2 py-1 text-cookie-darkbrown flex items-center gap-1"
              aria-label="Toggle font size"
            >
              <ALargeSmall className="size-5" />
            </button>
            {role !== "admin" && (
              <Link
                to="/help"
                className="hover:bg-green-50 hover:rounded-md px-2 py-1 text-cookie-darkbrown"
              >
                Help
              </Link>
            )}
            <Link
              to="/profile"
              className="hover:bg-green-50 hover:rounded-md px-2 py-1 text-cookie-darkbrown"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
