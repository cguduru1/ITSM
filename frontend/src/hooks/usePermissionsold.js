// ./src/hooks/usePermissions.js
import { useEffect, useState } from "react";
import api from "../api/apiClient.js";

/**
 * usePermissions
 * Fetches current user's permissions from backend endpoint /api/me/permissions
 * Returns { permissions: { resource: [actions] }, loading, error }
 */
export default function usePermissions() {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get("/api/me/permissions");
        if (!mounted) return;
        // apiClient directly returns parsed JSON, so handle both res.data and direct res format
        const data = res?.permissions || res?.data || res || {};
        setPermissions(data);
      } catch (err) {
        // fallback: empty permissions (hide tiles)
        setPermissions({});
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);
