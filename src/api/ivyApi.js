const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "/api";


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


/* ========================================
   Query Builder
======================================== */

function buildQuery(params = {}) {
  const query =
    new URLSearchParams();


  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.set(
          key,
          String(value)
        );
      }
    }
  );


  const queryString =
    query.toString();


  return queryString
    ? `?${queryString}`
    : "";
}


export const ivyApi = {

  /* ========================================
     AUTH
  ======================================== */

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
    return request(
      "/auth/logout",
      {
        method: "POST",
      }
    );
  },


  getCurrentUser() {
    return request("/auth/me");
  },


  /* ========================================
     LISTINGS
  ======================================== */

  // getListings({
  //   page = 1,
  //   limit = 20,
  //   locality = "",
  //   bedrooms = "",
  //   furnishing = "",
  //   minPrice = "",
  //   maxPrice = "",
  // } = {}) {

  //   const query =
  //     buildQuery({
  //       page,
  //       limit,
  //       locality,
  //       bedrooms,
  //       furnishing,

  //       // Translate frontend names
  //       // to backend query names.
  //       min_price: minPrice,
  //       max_price: maxPrice,
  //     });


  //   return request(
  //     `/listings${query}`
  //   );
  // },

  getListings({
  page = 1,
  limit = 20,
  locality = "",
  bedrooms = "",
  furnishing = "",
  min_price = "",
  max_price = "",
} = {}) {
  const query = buildQuery({
    page,
    limit,
    locality,
    bedrooms,
    furnishing,
    min_price,
    max_price,
  });

  return request(
    `/listings${query}`
  );
},


  getListing(id) {
    return request(
      `/listings/${encodeURIComponent(id)}`
    );
  },


  /* ========================================
     RENTALS
  ======================================== */

  // getRentals({
  //   page = 1,
  //   limit = 20,
  //   locality = "",
  //   bedrooms = "",
  //   furnishing = "",
  //   minPrice = "",
  //   maxPrice = "",
  // } = {}) {

  //   const query =
  //     buildQuery({
  //       page,
  //       limit,
  //       locality,
  //       bedrooms,
  //       furnishing,
  //       min_price: minPrice,
  //       max_price: maxPrice,
  //     });


  //   return request(
  //     `/rentals${query}`
  //   );
  // },
getRentals({
  page = 1,
  limit = 20,
  locality = "",
  bedrooms = "",
  min_price = "",
  max_price = "",
  furnishing = "",
} = {}) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (locality !== "") {
    params.set("locality", locality);
  }

  if (bedrooms !== "") {
    params.set("bedrooms", String(bedrooms));
  }

  if (furnishing !== "") {
    params.set("furnishing", furnishing);
  }

  if (min_price !== "") {
    params.set("min_price", String(min_price));
  }

  if (max_price !== "") {
    params.set("max_price", String(max_price));
  }

  const url = `/rentals?${params.toString()}`;

  console.log("Rental API request:", url);

  return request(url);
},

  /* ========================================
     PROJECTS
  ======================================== */

  getProjects({
    page = 1,
    limit = 20,
    locality = "",
    bedrooms = "",
    furnishing = "",
    minPrice = "",
    maxPrice = "",
  } = {}) {

    const query =
      buildQuery({
        page,
        limit,
        locality,
        bedrooms,
        furnishing,
        min_price: minPrice,
        max_price: maxPrice,
      });


    return request(
      `/projects${query}`
    );
  },


  getProject(id) {
    return request(
      `/projects/${encodeURIComponent(id)}`
    );
  },


  /* ========================================
     ANALYTICS
  ======================================== */

  getAnalyticsSummary() {
    return request(
      "/analytics/summary"
    );
  },


  /* ========================================
     SAVED LISTINGS
  ======================================== */

  getSavedListings() {
    return request(
      "/saved-listings"
    );
  },


  saveListing(listingId) {
    return request(
      "/saved-listings",
      {
        method: "POST",

        body: JSON.stringify({
          listing_id: listingId,
        }),
      }
    );
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