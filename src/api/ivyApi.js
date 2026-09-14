const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export const ivyApi = {
  /* =========================
     AUTH
  ========================= */

  login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    });
  },

  logout() {
    return request("/auth/logout", {
      method: "POST",
    });
  },

  getCurrentUser() {
    return request("/auth/me");
  },

  /* =========================
     LISTINGS
  ========================= */

  getListings(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          query.set(key, value);
        }
      }
    );

    const queryString = query.toString();

    return request(
      `/listings${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  getListing(id) {
    return request(
      `/listings/${encodeURIComponent(id)}`
    );
  },

  /* =========================
     RENTALS
  ========================= */

  getRentals(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          query.set(key, value);
        }
      }
    );

    const queryString = query.toString();

    return request(
      `/rentals${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  /* =========================
     PROJECTS
  ========================= */

  getProjects(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          query.set(key, value);
        }
      }
    );

    const queryString = query.toString();

    return request(
      `/projects${
        queryString ? `?${queryString}` : ""
      }`
    );
  },

  getProject(id) {
    return request(
      `/projects/${encodeURIComponent(id)}`
    );
  },

  /* =========================
     ANALYTICS
  ========================= */

  getAnalyticsSummary() {
    return request("/analytics/summary");
  },

  /* =========================
     SAVED LISTINGS
  ========================= */

  getSavedListings() {
    return request("/saved-listings");
  },

  saveListing(listingId) {
    return request("/saved-listings", {
      method: "POST",

      body: JSON.stringify({
        listing_id: listingId,
      }),
    });
  },

  removeSavedListing(listingId) {
    return request(
      `/saved-listings/${encodeURIComponent(
        listingId
      )}`,
      {
        method: "DELETE",
      }
    );
  },
};