// src/api/assetApi.ts
import apiClient from "./apiClient";

export interface Asset {
  _id?: string;
  id?: string;
  assetTag: string;
  category: string;
  modelName?: string;
  status?: string;
  owner?: { id?: string; name?: string };
  location?: { site?: string; building?: string; room?: string };
  purchase?: { vendor?: string; poNumber?: string; purchaseDate?: string; cost?: number };
  warranty?: { expiryDate?: string; vendor?: string };
  financials?: { currentBookValue?: number };
  tags?: string[];
  metadata?: { lastSeen?: string };
}

// Purchase Orders
export const getPOs = () => apiClient.get("/api/purchase-orders");

export const getPO = (poNumberOrId: string | number) =>
  apiClient.get(`/api/purchase-orders/${poNumberOrId}`);

// ✅ FIX: Changed endpoint from /procurement/${id} to /api/purchase-orders/${id}
export const getPOById = async (id: string) => {
  const response = await apiClient.get(`/api/purchase-orders/${id}`);
  return response.data || response;
};

export const createPO = (data: Partial<Asset> | Record<string, unknown>) =>
  apiClient.post("/api/purchase-orders", data);

export const receivePO = (poNumber: string | number) =>
  apiClient.post(`/api/purchase-orders/${poNumber}/receive`);

// ✅ FIX: Changed endpoint from /procurement/${id} to /api/purchase-orders/${id}
export const updatePO = async (id: string, data: any) => {
  const response = await apiClient.put(`/api/purchase-orders/${id}`, data); 
  return response.data || response;
};

// Assets
export const getAssets = (params?: Record<string, unknown>) =>
  apiClient.get("/api/assets", { params });

export const getAsset = (id: string) =>
  apiClient.get(`/api/assets/${id}`);

export const createAsset = (data: Asset) =>
  apiClient.post("/api/assets", data);

export const updateAsset = (id: string, data: Partial<Asset>) =>
  apiClient.put(`/api/assets/${id}`, data);

export const getAssetHistory = (assetId: string) => 
  apiClient.get(`/api/audit/asset/${assetId}`);

// Catalog & Allocations
export const getCatalog = () => apiClient.get("/api/product-catalog");

export const getLicenses = () => apiClient.get("/api/licenses");

export const createAllocation = (data: Record<string, unknown>) =>
  apiClient.post("/api/allocations", data);

export async function allocateLicense(assetId: string, payload: Record<string, unknown>) {
  return apiClient.post(`/api/assets/${assetId}/allocate-license`, payload);
}

// Aggregations
export const getSoftwareCompliance = () =>
  apiClient.get("/api/aggregations/software-compliance");

export const getDepreciationLedger = () =>
  apiClient.get("/api/aggregations/depreciation-ledger");

// Asset Actions & Workspace
export const getAssetWorkspace = (assetId: string) =>
  apiClient.get(`/api/assets/${assetId}/workspace`);

export const getAssetAudit = (assetId: string) =>
  apiClient.get(`/api/assets/${assetId}/audit`);

export const revokeAllocation = (allocationId: string) => {
  return apiClient.del(`/api/allocations/${allocationId}`);
};

export const printAssetTag = (assetId: string) =>
  apiClient.get(`/api/assets/${assetId}/print-tag`);

export default apiClient;
