import {
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ivyApi } from "../api/ivyApi";
import PageLayout from "../components/PageLayout";
import "./Projects.css";

const PAGE_SIZE = 20;

function formatPrice(value) {
  if (value == null || value === "") {
    return "Price on request";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  // Project API uses compact lakh/crore values.
  // Values below 100 are represented in lakhs.
  // Values such as 2.05 represent crores.
  if (number < 10) {
    return `₹${number.toFixed(2)} Cr`;
  }

  return `₹${number.toLocaleString("en-IN")} L`;
}

function formatArea(min, max) {
  const minArea = Number(min);
  const maxArea = Number(max);

  if (!Number.isFinite(minArea)) {
    return "Area unavailable";
  }

  if (
    Number.isFinite(maxArea) &&
    maxArea !== minArea
  ) {
    return `${minArea.toLocaleString(
      "en-IN"
    )} - ${maxArea.toLocaleString(
      "en-IN"
    )} sq ft`;
  }

  return `${minArea.toLocaleString(
    "en-IN"
  )} sq ft`;
}

function Projects() {
  const [projects, setProjects] =
    useState([]);

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      total: 0,
      limit: PAGE_SIZE,
      has_more: false,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadProjects();
  }, [page]);

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const response =
        await ivyApi.getProjects({
          page,
          limit: PAGE_SIZE,
        });

      const results =
        Array.isArray(response?.results)
          ? response.results
          : [];

      setProjects(results);

      setPagination({
        total: Number(
          response?.total ??
            results.length
        ),
        limit: Number(
          response?.limit ??
            PAGE_SIZE
        ),
        has_more: Boolean(
          response?.has_more
        ),
      });
    } catch (err) {
      setProjects([]);

      setPagination({
        total: 0,
        limit: PAGE_SIZE,
        has_more: false,
      });

      setError(
        err.message ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  }

  function previousPage() {
    if (page <= 1) return;

    setPage(
      (current) => current - 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function nextPage() {
    if (!pagination.has_more) return;

    setPage(
      (current) => current + 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const firstResult =
    pagination.total === 0
      ? 0
      : (page - 1) *
          pagination.limit +
        1;

  const lastResult =
    pagination.total === 0
      ? 0
      : Math.min(
          page * pagination.limit,
          pagination.total
        );

  return (
    <PageLayout>
      <main className="projects-page">
        <section className="projects-header">
          <div>
            <span className="projects-eyebrow">
              DISCOVER DEVELOPMENTS
            </span>

            <h1>
              Explore new projects.
            </h1>

            <p>
              Discover residential
              developments, their pricing,
              areas and available inventory.
            </p>
          </div>

          <div className="projects-icon">
            <Building2 size={25} />
          </div>
        </section>

        {loading && (
          <div className="projects-state">
            <div className="projects-spinner" />

            <span>
              Loading projects...
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="projects-state projects-error">
            <strong>
              Unable to load projects.
            </strong>

            <p>{error}</p>

            <button
              type="button"
              className="primary-button"
              onClick={loadProjects}
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {!loading &&
          !error && (
            <>
              {projects.length > 0 ? (
                <>
                  <div className="projects-results">
                    Showing{" "}
                    <strong>
                      {firstResult}
                    </strong>
                    {" - "}
                    <strong>
                      {lastResult}
                    </strong>
                    {" of "}
                    <strong>
                      {pagination.total.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <section className="projects-grid">
                    {projects.map(
                      (project) => {
                        const projectId =
                          project.project_id;

                        return (
                          <article
                            className="project-card"
                            key={projectId}
                          >
                            <div className="project-card-top">
                              <div className="project-card-icon">
                                <Building2 size={21} />
                              </div>

                              <span className="project-label">
                                {project.project_status ||
                                  "PROJECT"}
                              </span>
                            </div>

                            <h2>
                              {project.apartment_name ||
                                "Project name unavailable"}
                            </h2>

                            <div className="project-developer">
                              {project.developer_name ||
                                "Developer unavailable"}
                            </div>

                            <div className="project-location">
                              <MapPin size={15} />

                              <span>
                                {project.locality ||
                                  "Location unavailable"}
                              </span>
                            </div>

                            <div className="project-details">
                              <div>
                                <span>
                                  Starting price
                                </span>

                                <strong>
                                  {formatPrice(
                                    project.price_min
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Maximum price
                                </span>

                                <strong>
                                  {formatPrice(
                                    project.price_max
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Area
                                </span>

                                <strong>
                                  {formatArea(
                                    project.min_area_sqft,
                                    project.max_area_sqft
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Listings
                                </span>

                                <strong>
                                  {Number(
                                    project.total_listings ??
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </strong>
                              </div>
                            </div>

                            <div className="project-meta">
                              <span>
                                {project.total_units?.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                units
                              </span>

                              <span>
                                {project.total_towers}{" "}
                                towers
                              </span>

                              <span>
                                {project.total_floors}{" "}
                                floors
                              </span>
                            </div>
                          </article>
                        );
                      }
                    )}
                  </section>

                  <div className="projects-pagination">
                    <button
                      type="button"
                      disabled={
                        page === 1
                      }
                      onClick={
                        previousPage
                      }
                    >
                      <ChevronLeft
                        size={17}
                      />
                      Previous
                    </button>

                    <div>
                      Page{" "}
                      <strong>
                        {page}
                      </strong>
                    </div>

                    <button
                      type="button"
                      disabled={
                        !pagination.has_more
                      }
                      onClick={
                        nextPage
                      }
                    >
                      Next
                      <ChevronRight
                        size={17}
                      />
                    </button>
                  </div>
                </>
              ) : (
                <div className="projects-empty">
                  <Building2 size={30} />

                  <h2>
                    No projects found
                  </h2>

                  <p>
                    There are currently no
                    projects to display.
                  </p>
                </div>
              )}
            </>
          )}
      </main>
    </PageLayout>
  );
}

export default Projects;