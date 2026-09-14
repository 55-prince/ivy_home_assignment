import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Insights from "./pages/Insights";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Saved from "./pages/saved";
import Rentals from "./pages/Rentals";
import Projects from "./pages/Projects";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Public routes */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />


      {/* Protected routes */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/listings"
          element={<Listings />}
        />

        <Route
          path="/listings/:id"
          element={<ListingDetail />}
        />

        <Route
          path="/saved"
          element={<Saved />}
        />

        <Route
          path="/rentals"
          element={<Rentals />}
        />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route path="/insights" element={<Insights />} />

      </Route>


      {/* Unknown route */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;