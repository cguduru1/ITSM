import { useState, useEffect } from "react";

export default function useTileOrder(defaultIds) {
  const key = "change_tile_order_v1";
  const [tileOrder, setTileOrder] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultIds;
    } catch {
      return defaultIds;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(tileOrder)); } catch {}
  }, [tileOrder]);

  const saveTileOrder = (newOrder) => setTileOrder(newOrder);

  return { tileOrder, saveTileOrder };
}
