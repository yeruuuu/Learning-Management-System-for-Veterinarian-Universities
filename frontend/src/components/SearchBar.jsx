import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg border border-cookie-darkbrown/20 bg-cookie-lightcream placeholder:text-cookie-darkbrown/50 text-cookie-darkbrown focus:outline-none focus:border-cookie-darkbrown"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cookie-darkbrown/50 size-5" />
    </div>
  );
};

export default SearchBar;
