import { ArrowRight, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

//import { ivyApi } from "../api/ivyApi";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
    //   await ivyApi.login(form.email, form.password);
    await login(form.email, form.password);

      navigate("/listings");
    } catch (err) {
      setError(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span className="login-brand-mark">I</span>
          <span>ivy homes</span>
        </div>

        <div className="login-heading">
          <span className="eyebrow">WELCOME BACK</span>

          <h1>Sign in.</h1>

          <p>
            Sign in to explore homes and manage your saved
            listings.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="login-field">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                <span>
                  <LockKeyhole
                    size={16}
                    style={{
                      verticalAlign: "middle",
                      marginRight: "7px",
                    }}
                  />
                  Sign in
                </span>

                <ArrowRight
                  size={16}
                  style={{
                    verticalAlign: "middle",
                    marginLeft: "7px",
                  }}
                />
              </>
            )}
          </button>
        </form>

        <p className="login-footer">
          Looking around first?{" "}
          <Link to="/listings">
            Explore homes
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;