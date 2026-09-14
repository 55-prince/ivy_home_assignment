import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  IndianRupee,
  MapPin,
  TrendingUp,
  Home,
  AlertCircle,
} from "lucide-react";

import { ivyApi } from "../api/ivyApi";
import PageLayout from "../components/PageLayout";

import "./Insights.css";

function formatIndianNumber(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return new Intl.NumberFormat("en-IN").format(
    Number(value)
  );
}

function formatRupees(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return `₹${formatIndianNumber(value)}`;
}

function formatCompactPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)} Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)} L`;
  }

  return formatRupees(number);
}

function Insights() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const response =
        await ivyApi.getAnalyticsSummary();

      setAnalytics(response);
    } catch (err) {
      console.error(
        "Unable to load analytics:",
        err
      );

      setError(
        err?.message ||
          "Unable to load market insights."
      );
    } finally {
      setLoading(false);
    }
  }

  const localityData = useMemo(() => {
    if (!Array.isArray(analytics?.by_locality)) {
      return [];
    }

    return [...analytics.by_locality]
      .filter((item) => item)
      .sort(
        (a, b) =>
          Number(b.count || 0) -
          Number(a.count || 0)
      );
  }, [analytics]);

  const bhkData = useMemo(() => {
    if (!Array.isArray(analytics?.by_bhk)) {
      return [];
    }

    return [...analytics.by_bhk]
      .filter((item) => item)
      .sort(
        (a, b) =>
          Number(a.bedroom || 0) -
          Number(b.bedroom || 0)
      );
  }, [analytics]);

  const discoveries = useMemo(() => {
    if (!analytics) {
      return [];
    }

    const results = [];

    const topLocality = localityData[0];

    if (topLocality) {
      results.push({
        icon: MapPin,
        title: "Most active locality",
        text: `${topLocality.locality} has ${formatIndianNumber(
          topLocality.count
        )} listings, making it the largest visible market in this dataset.`,
      });
    }

    if (localityData.length > 0) {
      const expensiveLocality =
        [...localityData]
          .filter(
            (item) =>
              Number.isFinite(
                Number(item.median_price)
              )
          )
          .sort(
            (a, b) =>
              Number(b.median_price) -
              Number(a.median_price)
          )[0];

      if (expensiveLocality) {
        results.push({
          icon: TrendingUp,
          title: "Highest median price",
          text: `${expensiveLocality.locality} has the highest median listing price at ${formatCompactPrice(
            expensiveLocality.median_price
          )}.`,
        });
      }
    }

    if (bhkData.length > 0) {
      const dominantBhk =
        [...bhkData].sort(
          (a, b) =>
            Number(b.count || 0) -
            Number(a.count || 0)
        )[0];

      if (dominantBhk) {
        results.push({
          icon: Home,
          title: "Most common configuration",
          text: `${dominantBhk.bedroom} BHK homes are the most represented configuration with ${formatIndianNumber(
            dominantBhk.count
          )} listings.`,
        });
      }
    }

    if (
      analytics.median_price &&
      analytics.median_price_per_sqft
    ) {
      results.push({
        icon: BarChart3,
        title: "Market benchmark",
        text: `Across the city, the median property price is ${formatCompactPrice(
          analytics.median_price
        )}, while the median price per square foot is ${formatRupees(
          analytics.median_price_per_sqft
        )}.`,
      });
    }

    return results;
  }, [analytics, localityData, bhkData]);

  const maxLocalityCount = Math.max(
    ...localityData.map(
      (item) => Number(item.count) || 0
    ),
    1
  );

  const maxBhkCount = Math.max(
    ...bhkData.map(
      (item) => Number(item.count) || 0
    ),
    1
  );

  return (
    <PageLayout>
      <main className="insights-page">
        <section className="insights-header">
          <div>
            <span className="eyebrow">
              MARKET INTELLIGENCE
            </span>

            <h1>Property insights</h1>

            <p>
              A snapshot of the current housing market,
              powered by Ivy Homes analytics.
            </p>
          </div>

          {analytics?.city && (
            <div className="city-pill">
              <MapPin size={16} />
              {analytics.city}
            </div>
          )}
        </section>

        {loading && (
          <div className="insights-loading">
            <BarChart3 size={24} />
            <span>
              Loading market insights...
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="insights-error">
            <AlertCircle size={20} />

            <div>
              <strong>
                Unable to load insights
              </strong>

              <p>{error}</p>

              <button
                type="button"
                onClick={loadAnalytics}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && analytics && (
          <>
            <section className="metric-grid">
              <article className="metric-card">
                <div className="metric-icon">
                  <Building2 size={20} />
                </div>

                <div>
                  <span>
                    Total listings
                  </span>

                  <strong>
                    {formatIndianNumber(
                      analytics.total_listings
                    )}
                  </strong>

                  <small>
                    Current city inventory
                  </small>
                </div>
              </article>

              <article className="metric-card">
                <div className="metric-icon">
                  <IndianRupee size={20} />
                </div>

                <div>
                  <span>
                    Median price
                  </span>

                  <strong>
                    {formatCompactPrice(
                      analytics.median_price
                    )}
                  </strong>

                  <small>
                    Across available listings
                  </small>
                </div>
              </article>

              <article className="metric-card">
                <div className="metric-icon">
                  <BarChart3 size={20} />
                </div>

                <div>
                  <span>
                    Median price / sq.ft.
                  </span>

                  <strong>
                    {formatRupees(
                      analytics.median_price_per_sqft
                    )}
                  </strong>

                  <small>
                    City-wide benchmark
                  </small>
                </div>
              </article>

              <article className="metric-card">
                <div className="metric-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <span>
                    Top locality
                  </span>

                  <strong className="text-value">
                    {localityData[0]?.locality ||
                      "—"}
                  </strong>

                  <small>
                    By listing volume
                  </small>
                </div>
              </article>
            </section>

            <section className="insights-grid">
              <article className="insights-card locality-card">
                <div className="card-heading">
                  <div>
                    <h2>Locality overview</h2>
                    <p>
                      Listing volume and median prices
                    </p>
                  </div>

                  <MapPin size={20} />
                </div>

                {localityData.length === 0 ? (
                  <div className="empty-state">
                    No locality data available.
                  </div>
                ) : (
                  <div className="locality-list">
                    {localityData
                      .slice(0, 8)
                      .map((item) => {
                        const count =
                          Number(item.count) || 0;

                        const width =
                          (count /
                            maxLocalityCount) *
                          100;

                        return (
                          <div
                            className="locality-row"
                            key={item.locality}
                          >
                            <div className="locality-info">
                              <div>
                                <strong>
                                  {item.locality}
                                </strong>

                                <span>
                                  {formatIndianNumber(
                                    count
                                  )}{" "}
                                  listings
                                </span>
                              </div>

                              <strong>
                                {formatCompactPrice(
                                  item.median_price
                                )}
                              </strong>
                            </div>

                            <div className="bar-track">
                              <div
                                className="bar-fill"
                                style={{
                                  width: `${width}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </article>

              <article className="insights-card bhk-card">
                <div className="card-heading">
                  <div>
                    <h2>BHK distribution</h2>
                    <p>
                      Inventory by bedroom count
                    </p>
                  </div>

                  <Home size={20} />
                </div>

                {bhkData.length === 0 ? (
                  <div className="empty-state">
                    No BHK data available.
                  </div>
                ) : (
                  <div className="bhk-list">
                    {bhkData.map((item) => {
                      const count =
                        Number(item.count) || 0;

                      const width =
                        (count /
                          maxBhkCount) *
                        100;

                      return (
                        <div
                          className="bhk-row"
                          key={item.bedroom}
                        >
                          <div className="bhk-label">
                            <strong>
                              {item.bedroom} BHK
                            </strong>

                            <span>
                              {formatIndianNumber(
                                count
                              )}
                            </span>
                          </div>

                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${width}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            </section>

            <section className="insights-card discoveries-card">
              <div className="card-heading">
                <div>
                  <h2>What stands out</h2>
                  <p>
                    Automatically derived from the
                    analytics summary
                  </p>
                </div>

                <TrendingUp size={20} />
              </div>

              <div className="discovery-grid">
                {discoveries.map(
                  (discovery, index) => {
                    const Icon = discovery.icon;

                    return (
                      <article
                        className="discovery-item"
                        key={index}
                      >
                        <div className="discovery-icon">
                          <Icon size={18} />
                        </div>

                        <div>
                          <strong>
                            {discovery.title}
                          </strong>

                          <p>
                            {discovery.text}
                          </p>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>

            <section className="insights-card methodology-card">
              <div className="methodology-icon">
                <BarChart3 size={20} />
              </div>

              <div>
                <h3>
                  How these insights are calculated
                </h3>

                <p>
                    These insights are calculated from the
                    available live listing dataset. The
                    backend aggregates listing prices,
                    localities, bedroom configurations,
                    and price-per-square-foot values to
                    produce the market summary. This
                    approach was used because the documented
                    analytics endpoint was unavailable in
                    the live API.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </PageLayout>
  );
}

export default Insights;