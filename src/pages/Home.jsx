import {
  ArrowRight,
  Heart,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <header className="home-navbar">
        <div className="home-nav-container">
          <button
            className="home-brand"
            onClick={() => navigate("/")}
          >
            <span className="home-brand-mark">I</span>
            <span>ivy homes</span>
          </button>

          <nav className="home-nav-links">
            <button onClick={() => navigate("/listings")}>
              Buy
            </button>

            <button onClick={() => navigate("/rentals")}>
              Rent
            </button>

            <button onClick={() => navigate("/projects")}>
              Projects
            </button>

            <button onClick={() => navigate("/insights")}>
              Insights
            </button>
          </nav>

          <div className="home-nav-actions">
            <button
              className="home-saved-button"
              onClick={() => navigate("/saved")}
            >
              <Heart size={17} />
              Saved
            </button>

            <button
              className="home-login-button"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-background" />

          <div className="home-hero-content">
            <div className="home-hero-badge">
              <Sparkles size={15} />
              <span>A better way to find home</span>
            </div>

            <h1>
              Find a place
              <br />
              <span>you'll love.</span>
            </h1>

            <p className="home-hero-description">
              Discover thoughtfully selected homes, explore
              neighbourhoods, and find a property that fits the
              way you want to live.
            </p>

            <div className="home-search-card">
              <div className="home-search-field">
                <Search size={20} />

                <div>
                  <span>Location</span>
                  <strong>
                    Where do you want to live?
                  </strong>
                </div>
              </div>

              <button
                className="home-search-button"
                onClick={() => navigate("/listings")}
              >
                Explore homes
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="home-stats">
              <div>
                <strong>4,400+</strong>
                <span>Listings explored</span>
              </div>

              <div>
                <strong>4,300+</strong>
                <span>Unique properties</span>
              </div>

              <div>
                <strong>3,477</strong>
                <span>Active listings</span>
              </div>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="home-image-frame">
              <img
                src="/src/assets/hero.png"
                alt="Beautiful home"
              />

              <div className="home-floating-card home-property-card">
                <span className="home-card-label">
                  Featured home
                </span>

                <strong>Modern living</strong>

                <span className="home-card-location">
                  Thoughtfully designed spaces
                </span>
              </div>

              <div className="home-floating-card home-verified-card">
                <span className="home-verified-icon">✓</span>

                <div>
                  <strong>Verified</strong>
                  <span>Property details</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-feature-strip">
          <div className="home-feature-item">
            <span className="home-feature-number">01</span>

            <div>
              <strong>Explore</strong>
              <p>
                Browse properties with useful filters.
              </p>
            </div>
          </div>

          <div className="home-feature-item">
            <span className="home-feature-number">02</span>

            <div>
              <strong>Compare</strong>
              <p>
                Understand prices, areas and projects.
              </p>
            </div>
          </div>

          <div className="home-feature-item">
            <span className="home-feature-number">03</span>

            <div>
              <strong>Save</strong>
              <p>
                Keep your favourite homes in one place.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;