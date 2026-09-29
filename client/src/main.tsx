import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";
import App from "./App";
import "./styles/global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 4_000,
      retry: 1,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 0
    }
  }
});

const contenedor = document.getElementById("root");

if (!contenedor) {
  throw new Error(
    "No se encontró el elemento raíz de React."
  );
}

createRoot(contenedor).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);