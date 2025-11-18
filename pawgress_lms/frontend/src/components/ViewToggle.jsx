import { useContext } from "react";
import { Grid, List } from "lucide-react";
import { ViewContext } from "../contexts/ViewContext";

const ViewToggle = () => {
  const { view, setView } = useContext(ViewContext);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setView("grid")}
        aria-pressed={view === "grid"}
        className={`p-2 rounded ${
          view === "grid"
            ? "bg-cookie-darkbrown text-cookie-white"
            : "bg-cookie-lightcream"
        }`}
      >
        <Grid />
      </button>
      <button
        onClick={() => setView("list")}
        aria-pressed={view === "list"}
        className={`p-2 rounded ${
          view === "list"
            ? "bg-cookie-darkbrown text-cookie-white"
            : "bg-cookie-lightcream"
        }`}
      >
        <List />
      </button>
    </div>
  );
};

export default ViewToggle;
