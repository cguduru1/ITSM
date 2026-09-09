import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

if (import.meta.env.DEV) {
  import("./mocks/ws-simulator").then((m) => m.startWsSimulator());
}

useEffect(() => {
  const handler = (e: any) => {
    console.log("WS event", e.detail);
    // refetch queries or update cache
  };
  window.addEventListener("ws:asset:updated", handler as EventListener);
  return () => window.removeEventListener("ws:asset:updated", handler as EventListener);
}, []);
