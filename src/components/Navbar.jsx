import { Heart, LogIn } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="nav-container">
        <button
          className="brand"
          onClick={() => navigate("/")}
          aria-label="Go to Ivy Homes home"
        >
          <span className="brand-mark">I</span>
          <span>ivy homes</span>
        </button>

        <nav className="nav-links">
          <NavLink
            to="/listings"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Buy
          </NavLink>

          <NavLink
            to="/rentals"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Rent
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Projects
          </NavLink>

          <NavLink
            to="/insights"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Insights
          </NavLink>
        </nav>

        <div className="nav-actions">
          <button
            className="saved-button"
            onClick={() => navigate("/saved")}
          >
            <Heart size={16} />
            Saved
          </button>

          <button
            className="login-button"
            onClick={() => navigate("/login")}
          >
            <LogIn size={16} />
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;