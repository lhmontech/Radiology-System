import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import Record from "./pages/record";
import Report from "./pages/report";
import Historic from "./pages/historic";
import { FolderPen, FolderKanban, FolderSearch, Radiation } from "lucide-react";

function App() {
  const location = useLocation();
  const activePath = location.pathname; // Used to highlight the current nav link

  return (
    <div className="app-container">

      {/* Sidebar navigation with icon links and tooltips */}
      <nav className="navbar">
        <Radiation size={36} className="Logo" />

        <div className="tooltip">
          <Link to="/record" className={activePath === "/record" ? "active-link" : "link"}>
            <FolderPen />
          </Link>
          <span className="tooltipText">Registro</span>
        </div>

        <div className="tooltip">
          <Link to="/historic" className={activePath === "/historic" ? "active-link" : "link"}>
            <FolderSearch />
          </Link>
          <span className="tooltipText">Histórico</span>
        </div>

        <div className="tooltip">
          <Link to="/report" className={activePath === "/report" ? "active-link" : "link"}>
            <FolderKanban />
          </Link>
          <span className="tooltipText">Relatório</span>
        </div>
      </nav>

      {/* Main content area — renders the active page route */}
      <div className="PrincipalFrame">
        <Routes>
          <Route path="/" element={<Navigate to="/record" />} />
          <Route path="/record" element={<Record />} />
          <Route path="/historic" element={<Historic />} />
          <Route path="/report" element={<Report />} />
          <Route path="*" element={<Navigate to="/record" />} /> {/* Fallback for unknown routes */}
        </Routes>
      </div>

    </div>
  );
}

export default App;