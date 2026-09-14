import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import Saved from "./pages/saved";

function App() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

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
            element={
              <div>
                Rentals coming next...
              </div>
            }
          />

          <Route
            path="/projects"
            element={
              <div>
                Projects coming next...
              </div>
            }
          />

          <Route
            path="/insights"
            element={
              <div>
                Insights coming next...
              </div>
            }
          />
        </Route>
    </Routes>
  );
}

export default App;