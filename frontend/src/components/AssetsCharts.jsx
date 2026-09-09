import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api/api"; // Adjust to your API client path

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#64748b"];

export default function AssetCharts({ filter = "" }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAssetsData() {
      try {
        setLoading(true);
        const res = await api.get("/api/assets", { params: { pageSize: 1000 } });
        const rawData = res.data?.data || res.data || [];
        setAssets(Array.isArray(rawData) ? rawData : []);
      } catch (err) {
        console.error("Failed to fetch assets for charts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssetsData();
  }, []);

  // Filter assets based on search query prop
  const filteredAssets = useMemo(() => {
  // Safely guard against null, undefined, or non-string values
  const query = typeof filter === "string" ? filter.trim().toLowerCase() : "";
  if (!query) return assets;

  return assets.filter(
    (a) =>
      a.assetTag?.toLowerCase().includes(query) ||
      a.category?.toLowerCase().includes(query) ||
      a.owner?.toLowerCase().includes(query)
  );
}, [assets, filter]);

  // Aggregate Category counts
  // Ensure COLORS exists at the top of your component file
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  const categoryData = useMemo(() => {
  if (!filteredAssets || !Array.isArray(filteredAssets)) return [];

  const counts = {};

  filteredAssets.forEach((item) => {
    // 1. Safely extract category string even if populated as an object
    let catName = "Uncategorized";

    if (typeof item.category === "string" && item.category.trim() !== "") {
      catName = item.category.trim();
    } else if (item.category && typeof item.category === "object") {
      catName = item.category.name || item.category.label || "Uncategorized";
    } else if (item.modelId && typeof item.modelId === "object") {
      // Fallback: check nested model category if category isn't on root
      catName = item.modelId.category || "Uncategorized";
    }

    counts[catName] = (counts[catName] || 0) + 1;
  });

  const formatted = Object.keys(counts).map((key) => ({
    name: key,
    value: counts[key]
  }));

  console.log("Filtered Assets:", filteredAssets);
  console.log("Calculated Category Data:", formatted);

  return formatted;
}, [filteredAssets]);

  // Aggregate Status counts
  const statusData = useMemo(() => {
    const counts = {}; // Removed TypeScript type annotation here
    filteredAssets.forEach((item) => {
      const status = item.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.keys(counts).map((key) => ({ name: key, count: counts[key] }));
  }, [filteredAssets]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading asset charts...</div>;
  }

  return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Assets by Category Pie Chart */}
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Assets by Category</h3>
      {categoryData.length === 0 ? (
        <p className="text-sm text-slate-400">No category data available.</p>
      ) : (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>

    {/* Assets by Status Bar Chart */}
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Assets by Status</h3>
      {statusData.length === 0 ? (
        <p className="text-sm text-slate-400">No status data available.</p>
      ) : (
        /* ✅ FIX: Added explicit height container here as well */
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis allowDecimals={false} stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  </div>
);
}