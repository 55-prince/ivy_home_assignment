import {
  Heart,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="nav-container">

        <button
          type="button"
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
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Buy
          </NavLink>

          <NavLink
            to="/rentals"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Rent
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Projects
          </NavLink>

          <NavLink
            to="/insights"
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            Insights
          </NavLink>

        </nav>


        <div className="nav-actions">

          <button
            type="button"
            className={`saved-button ${
              location.pathname === "/saved"
                ? "saved-active"
                : ""
            }`}
            onClick={() => navigate("/saved")}
          >
            <Heart size={16} />
            <span>Saved</span>
          </button>


          {user ? (
            <>
              <div
                className="user-badge"
                title={user.email}
              >
                <span className="user-avatar">
                  {user.email
                    ?.charAt(0)
                    .toUpperCase()}
                </span>

                <span className="user-email">
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="login-button"
              onClick={() => navigate("/login")}
            >
              <LogIn size={16} />
              <span>Sign in</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}

export default Navbar;