// src/services/auth.js
export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (e) {
    // ignore network errors
  }
}
