import { useState, useEffect } from "react";

export default function usePermissions() {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fake = {
      change_request: ["read", "create", "update"],
      role: ["read", "update"],
      asset: ["read"],
      analytics: ["read"]
    };
    setTimeout(() => { setPermissions(fake); setLoading(false); }, 200);
  }, []);

  return { permissions, loading };
}
