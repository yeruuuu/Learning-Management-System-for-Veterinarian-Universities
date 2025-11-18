import { createContext, useState} from "react";
import { ROLE } from "../constants";

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [role, _setRole] = useState(() => localStorage.getItem(ROLE) || "");
  const setRole = (newRole) => {
        localStorage.setItem(ROLE, newRole);
        _setRole(newRole);
    };
    return (
      <RoleContext.Provider value={{ role, setRole }}>
        {children}
      </RoleContext.Provider>
    );
}