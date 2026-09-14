import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { ivyApi } from "../api/ivyApi";
import { useAuth } from "./AuthContext";

const SavedListingsContext = createContext(null);

export function SavedListingsProvider({ children }) {
  const { user } = useAuth();

  const [savedIds, setSavedIds] = useState(
    new Set()
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }

    loadSavedListings();
  }, [user]);

  async function loadSavedListings() {
    try {
      setLoading(true);

      const response =
        await ivyApi.getSavedListings();

      const results =
        Array.isArray(response?.results)
          ? response.results
          : Array.isArray(response)
            ? response
            : [];

      const ids = results
        .map((item) =>
          String(
            item.listing_id ??
              item.id
          )
        )
        .filter(Boolean);

      setSavedIds(new Set(ids));
    } catch (error) {
      console.error(
        "Unable to load saved listings:",
        error
      );

      setSavedIds(new Set());
    } finally {
      setLoading(false);
    }
  }

  function isSaved(listingId) {
    return savedIds.has(
      String(listingId)
    );
  }

  async function toggleSaved(listingId) {
    const id = String(listingId);

    if (savedIds.has(id)) {
      await ivyApi.removeSavedListing(id);

      setSavedIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });

      return false;
    }

    await ivyApi.saveListing(id);

    setSavedIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });

    return true;
  }

  return (
    <SavedListingsContext.Provider
      value={{
        savedIds,
        loading,
        isSaved,
        toggleSaved,
        reloadSavedListings:
          loadSavedListings,
      }}
    >
      {children}
    </SavedListingsContext.Provider>
  );
}

export function useSavedListings() {
  const context = useContext(
    SavedListingsContext
  );

  if (!context) {
    throw new Error(
      "useSavedListings must be used inside SavedListingsProvider"
    );
  }

  return context;
}