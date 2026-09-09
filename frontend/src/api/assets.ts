// src\api\AssetsList.ts

import AssetsList from "@/components/AssetsList";
import apiClient from "../api/apiClient";

// Alias apiClient as api to match your function calls
const api = apiClient;

export interface Asset {
  assetId?: string;
  _id?: string;
  assetTag: string;
  category: string;
  description: string;
  serialNumber?: string;
  modelId?: string;
  modelName?: string;
  status?: string;
  owner?: { id: string; name: string };
  location?: { site?: string; building?: string; room?: string };
  purchase?: { vendor?: string; poNumber?: string; purchaseDate?: string; cost?: number };
  warranty?: { expiryDate?: string; vendor?: string };
  financials?: { currentBookValue?: number };
  tags?: string[];
  metadata?: { lastSeen?: string };
}

export const getAssets = (params?: Record<string, unknown>) => 
  apiClient.get("/api/assets", { params });

export const getAsset = (id: string) => 
  apiClient.get(`/api/assets/${id}`);

export const createAsset = (data: Partial<Asset> | Record<string, unknown>) => {
  return apiClient.post("/api/assets", {
    category: data.category || "Hardware",
    ...data,
  });
};

export const updateAsset = (id: string, payload: Partial<Asset>) => 
  apiClient.put(`/api/assets/${id}`, payload);

// Updated path to match /import/csv in assetRoutes.js
// Omitted manual Content-Type header so the browser/Axios auto-generates the boundary
export const importAssets = (formData: FormData) => 
  apiClient.post("/api/assets/import/csv", formData);

export const transferAsset = (id: string, body: Record<string, unknown>) => 
  apiClient.post(`/api/assets/${id}/actions/transfer`, body);
