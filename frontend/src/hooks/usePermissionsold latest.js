import { useEffect, useState } from "react";
import apiClient from "../api/apiClient.js";

export default function usePermissions() {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await apiClient.get("/api/me/permissions", { skipAuthRedirect: true });
        if (!mounted) return;

        // Extract permissions object from potential nested response wrappers
        let perms = res?.permissions || res?.data?.permissions || res?.data || res || {};

        // Fallback default permissions if backend returns empty or unauthenticated state
        if (!perms || Object.keys(perms).length === 0) {
          perms = {
            change_request: ["read", "create", "update", "delete"],
            asset: ["read", "create"],
            role: ["read", "update"]
          };
        }

        setPermissions(perms);
      } catch (err) {
        if (!mounted) return;
        console.warn("Could not load permissions, applying default unlocked state:", err);
        
        // Unlocks all tiles on fetch failure
        setPermissions({
          change_request: ["read", "create", "update", "delete"],
          asset: ["read", "create"],
          role: ["read", "update"]
        });
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { permissions, loading, error };
}