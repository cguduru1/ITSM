
//src/api/apiclient.js
// 1. Fallback to localhost:4000 or read from Vite environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000";

async function request(path, opts = {}) {
  // Extract custom option to control auto-redirect behavior
  const { skipAuthRedirect = false, ...fetchOpts } = opts;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  // 1. Identify pure public auth routes (Excludes /auth/me)
  const isPublicAuthRoute =
    normalizedPath.includes("/login") ||
    normalizedPath.includes("/register") ||
    normalizedPath.includes("/verify-otp") ||
    normalizedPath.includes("/refresh");

  const isFormData = fetchOpts.body instanceof FormData;

  // 2. Define defaultHeaders BEFORE configuring authentication or options
  const defaultHeaders = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

 // 3. Retrieve and sanitize token across all key aliases
  const rawToken =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access");

    const cleanToken =
    rawToken && rawToken !== "null" && rawToken !== "undefined"
      ? rawToken.replace(/^"|"$/g, "").trim()
      : null;

  // Attach token to all non-public routes (including /auth/me)
  if (!isPublicAuthRoute && cleanToken) {
    defaultHeaders["Authorization"] = `Bearer ${cleanToken}`;
  } 

  // 4. Build fetch options & auto-stringify JSON bodies
  const init = {
    ...fetchOpts,
    headers: {
      ...defaultHeaders,
      ...(fetchOpts.headers || {}),
    },
  };

  if (init.body && !isFormData && typeof init.body !== "string") {
    init.body = JSON.stringify(init.body);
  }

  // 5. Execute Request
  const res = await fetch(url, init);

  // 6. Handle non-2xx HTTP responses
  if (!res.ok) {
    if (res.status === 401 && !isPublicAuthRoute && !skipAuthRedirect) {
      console.error("401 Unauthorized encountered. Clearing session tokens...");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("access");
      localStorage.removeItem("user");

      // Auto-redirect to login to break deadlocks
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";  
    }
  }

    // Extract error message safely from backend response
    let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    const text = await res.text().catch(() => "");

    try {
      if (text) {
      const parsed = JSON.parse(text);
      errorMessage = parsed.error || parsed.message || errorMessage;
    } 
    } catch (parseError) {
      if (text) errorMessage = text;
    }

    const err = new Error(errorMessage);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  // 7. Parse response
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

const apiClient = {
  get: (path, opts) => request(path, { method: "GET", ...opts }),
  post: (path, body, opts) => request(path, { method: "POST", body, ...opts }),
  put: (path, body, opts) => request(path, { method: "PUT", body, ...opts }),
  del: (path, opts) => request(path, { method: "DELETE", ...opts }),
};

export default apiClient;
