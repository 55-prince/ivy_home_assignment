import {
  ArrowRight,
  Building2,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">

      {/* Main navigation */}
      <Navbar />

      <main>

        {/* --------------------------------
            Hero
        -------------------------------- */}

        <section className="home-hero">

          <div className="home-hero-background" />

          <div className="home-hero-content">

            <div className="home-hero-badge">
              <Sparkles size={15} />
              <span>
                A smarter way to find your next home
              </span>
            </div>


            <h1>
              Find a place
              <br />
              <span>you'll love.</span>
            </h1>


            <p className="home-hero-description">
              Explore carefully selected homes, compare
              neighbourhoods, and discover a property that
              fits the way you want to live.
            </p>


            {/* Search / Explore card */}

            <div className="home-search-card">

              <div className="home-search-field">
                <div className="home-search-icon">
                  <Search size={19} />
                </div>

                <div>
                  <span>Explore properties</span>

                  <strong>
                    Find homes across your preferred locality
                  </strong>
                </div>
              </div>


              <button
                type="button"
                className="home-search-button"
                onClick={() => navigate("/listings")}
              >
                Explore homes
                <ArrowRight size={18} />
              </button>

            </div>


            {/* Stats */}

            <div className="home-stats">

              <div className="home-stat">
                <div className="home-stat-icon">
                  <Building2 size={17} />
                </div>

                <div>
                  <strong>4,400+</strong>
                  <span>Listings explored</span>
                </div>
              </div>


              <div className="home-stat">
                <div className="home-stat-icon">
                  <MapPin size={17} />
                </div>

                <div>
                  <strong>4,300+</strong>
                  <span>Unique properties</span>
                </div>
              </div>


              <div className="home-stat">
                <div className="home-stat-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <strong>3,477</strong>
                  <span>Active listings</span>
                </div>
              </div>

            </div>

          </div>


          {/* --------------------------------
              Hero visual
          -------------------------------- */}

          <div className="home-hero-visual">

            <div className="home-image-frame">

              <img
                src="/src/assets/hero.png"
                alt="Modern residential home"
              />


              {/* Image overlay */}

              <div className="home-image-overlay" />


              {/* Featured property card */}

              <div className="home-floating-card home-property-card">

                <div className="home-floating-icon">
                  <Building2 size={17} />
                </div>

                <div>
                  <span className="home-card-label">
                    Featured home
                  </span>

                  <strong>
                    Modern living
                  </strong>

                  <span className="home-card-location">
                    Thoughtfully designed spaces
                  </span>
                </div>

              </div>


              {/* Verified card */}

              <div className="home-floating-card home-verified-card">

                <span className="home-verified-icon">
                  <ShieldCheck size={17} />
                </span>

                <div>
                  <strong>Verified details</strong>
                  <span>Property information</span>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* --------------------------------
            Feature strip
        -------------------------------- */}

        <section className="home-feature-strip">

          <div className="home-feature-intro">
            <span>WHY IVY HOMES</span>

            <h2>
              Everything you need
              <br />
              before you choose.
            </h2>
          </div>


          <div className="home-feature-item">

            <span className="home-feature-number">
              01
            </span>

            <div className="home-feature-icon">
              <Search size={17} />
            </div>

            <div>
              <strong>Explore</strong>

              <p>
                Browse properties with useful
                filters and relevant details.
              </p>
            </div>

          </div>


          <div className="home-feature-item">

            <span className="home-feature-number">
              02
            </span>

            <div className="home-feature-icon">
              <MapPin size={17} />
            </div>

            <div>
              <strong>Compare</strong>

              <p>
                Understand prices, areas and
                neighbourhoods before deciding.
              </p>
            </div>

          </div>


          <div className="home-feature-item">

            <span className="home-feature-number">
              03
            </span>

            <div className="home-feature-icon">
              <Heart size={17} />
            </div>

            <div>
              <strong>Save</strong>

              <p>
                Keep your favourite homes together
                and come back whenever you want.
              </p>
            </div>

          </div>

        </section>


        {/* --------------------------------
            Bottom CTA
        -------------------------------- */}

        <section className="home-bottom-cta">

          <div>

            <span className="home-bottom-eyebrow">
              READY TO EXPLORE?
            </span>

            <h2>
              Your next place
              <br />
              might be closer than you think.
            </h2>

          </div>


          <button
            type="button"
            className="home-bottom-button"
            onClick={() => navigate("/listings")}
          >
            Browse listings
            <ArrowRight size={18} />
          </button>

        </section>

      </main>

    </div>
  );
}

export default Home;