// // ./src/hooks/useTileOrder.js
// import { useEffect, useState, useCallback, useRef } from 'react';
// import apiClient from "../api/apiClient";


// /**
//  * useTileOrder
//  * - loads per-user tile order from /api/me/tile-order
//  * - provides saveTileOrder(tileOrder) to persist
//  * - falls back to localStorage if backend unavailable
//  */
// export default function useTileOrder(defaultOrder = []) {
//   const [tileOrder, setTileOrder] = useState(defaultOrder);
//   const [loading, setLoading] = useState(true);
//   const storageKey = 'cm_tile_order';

//   // Keep a stable ref of defaultOrder to prevent useEffect re-runs
//   const defaultOrderRef = useRef(defaultOrder);

//   // Keep ref up to date if defaultOrder changes externally
//   useEffect(() => {
//     defaultOrderRef.current = defaultOrder;
//   }, [defaultOrder]);

//   useEffect(() => {
//     let mounted = true;

//     async function load() {
//       const fallbackOrder = () => {
//         const local = localStorage.getItem(storageKey);
//         if (local) {
//           try {
//             return JSON.parse(local);
//           } catch {
//             return defaultOrderRef.current;
//           }
//         }
//         return defaultOrderRef.current;
//       };

//       try {
//         // 🔴 Pass skipAuthRedirect so a 401 on this non-critical call doesn't kick you to /login
//         const res = await apiClient.get('/api/me/tile-order', { skipAuthRedirect: true });
//         if (!mounted) return;

//         const data = res?.data || res;
//         const order = data?.tileOrder;

//         if (Array.isArray(order) && order.length) {
//           setTileOrder(order);
//         } else {
//           setTileOrder(fallbackOrder());
//         }
//       } catch (err) {
//         if (!mounted) return;
//         // Fallback gracefully on 401 Unauthorized or network error
//         setTileOrder(fallbackOrder());
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     load();

//     return () => { 
//       mounted = false; 
//     };
//   }, []); // Fires ONCE on mount

//   const saveTileOrder = useCallback(async (order) => {
//     setTileOrder(order);
//     try {
//       localStorage.setItem(storageKey, JSON.stringify(order));
//       await apiClient.put('/api/me/tile-order', { tileOrder: order }, { skipAuthRedirect: true });
//     } catch (err) {
//       console.warn('Failed to persist tile order to server', err?.message);
//     }
//   }, []);

//   return { tileOrder, setTileOrder, saveTileOrder, loading };
// }

import { useEffect, useState } from "react";
import api from "../api/apiClient.js";

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
        
        const data = res?.permissions || res?.data || res || {};
        setPermissions(data);
      } catch (err) {
        setPermissions({});
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
