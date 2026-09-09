// ./src/lib/changeApi.js
import api from "../api/apiClient";


export async function getChanges() {
  return api.get("/api/changes");
}

export async function getChange(id) {
  return api.get(`/api/changes/${id}`);
}

export async function createChange(payload) {
  return api.post("/api/changes", payload);
}

export async function updateChange(id, payload) {
  return api.put(`/api/changes/${id}`, payload);
}

export async function deleteChange(id) {
  return api.delete(`/api/changes/${id}`);
}
