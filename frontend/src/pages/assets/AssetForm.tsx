import React, { useEffect, useState } from "react";
import { createAsset, getCatalog, getAsset, updateAsset, type Asset} from "../../api/assetApi";
import { useNavigate, useParams } from "react-router-dom";
import { Asset as BaseAsset } from "../../api/assetApi";

// 1. Extend the Base Asset type outside the component
export interface AssetFormState extends Partial<Asset> {
  assetId?: string;
  modelId?: string;
  description?: string;
}

export interface CatalogItem {
  _id?: string;
  modelId: string;
  modelName: string;
  manufacturer?: string;
  category?: string;
}

export default function AssetForm() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<AssetFormState>({
    assetId: "",
    assetTag: "",
    modelId: "",
    category: "Hardware",
    status: "In-Stock",
    description: ""
  });

  // Fetch Catalog Data
  useEffect(() => {
    let isMounted = true;
    getCatalog()
      .then((res) => {
        if (isMounted) {
          setCatalog(res.data || res);
        }
      })
      .catch((err) => {
        console.error("Failed to load catalog:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Existing Asset for Edit Mode
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setLoading(true);

    getAsset(id)
      .then((res) => {
        if (isMounted) {
          const assetData = res.data?.asset || res.data || res;
          setForm({
            ...assetData,
            category: assetData.category || "Hardware",
            status: assetData.status || "In-Stock",
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError("Failed to load asset details.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedModelId = e.target.value;
    const selectedCatalogItem = catalog.find((c) => c.modelId === selectedModelId);


    setForm((prev) => ({
      ...prev,
      modelId: selectedModelId,
      modelName: selectedCatalogItem?.modelName || prev.modelName,
      category: selectedCatalogItem?.category || prev.category || "Hardware",
    }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const payload: Asset = {
        ...form,
        assetTag: form.assetTag?.trim() || "",
        category: form.category || "Hardware",
        status: form.status || "In-Stock",
      } as Asset;

      if (id) {
        await updateAsset(id, payload);
      } else {
        await createAsset(payload);
      }

      nav("/assets");
    } catch (err: any) {
      console.error("Failed to save asset:", err);
      setError(
        err.response?.data?.error || err.message || "Failed to save asset."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && id && !form.assetTag) {
    return <div className="p-4">Loading asset details...</div>;
  }

  return (
    <form onSubmit={save} className="page max-w-lg p-4 space-y-4">
      <h1 className="text-xl font-bold">{id ? "Edit Asset" : "New Asset"}</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <label className="block">
        <span className="font-medium">Asset Tag *</span>
        <input
          type="text"
          value={form.assetTag || ""}
          onChange={(e) => setForm((prev) => ({ ...prev, assetTag: e.target.value }))}
          required
          disabled={loading}
          className="border p-2 rounded w-full mt-1"
        />
      </label>

      <label className="block">
        <span className="font-medium">Model</span>
        <select
          value={form.modelId || ""}
          onChange={handleModelChange}
          disabled={loading}
          className="border p-2 rounded w-full mt-1"
        >
          <option value="">Select model</option>
          {catalog.map((c) => (
            <option key={c.modelId || c._id} value={c.modelId}>
              {c.manufacturer ? `${c.manufacturer} ` : ""}{c.modelName}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="font-medium">Category *</span>
        <select
          value={form.category || "Hardware"}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          required
          disabled={loading}
          className="border p-2 rounded w-full mt-1"
        >
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Network">Network</option>
          <option value="Mobile">Mobile</option>
        </select>
      </label>

      <label className="block">
        <span className="font-medium">Status</span>
        <select
          value={form.status || "In-Stock"}
          onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
          disabled={loading}
          className="border p-2 rounded w-full mt-1"
        >
          <option value="In-Stock">In-Stock</option>
          <option value="Deployed">Deployed</option>
          <option value="In-Repair">In-Repair</option>
          <option value="Retired">Retired</option>
        </select>
      </label>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => nav("/assets")}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}