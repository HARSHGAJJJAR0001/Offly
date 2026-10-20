import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";

// ── Clear expired token on every app load ─────────────────────────────────────
const token = sessionStorage.getItem("token");
if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (Date.now() >= payload.exp * 1000) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }
  } catch {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }
}

// ── React Query client config ─────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,  // data stays fresh for 2 minutes
      gcTime: 1000 * 60 * 10, // cache kept for 10 minutes (v5: gcTime)
      retry: 1,              // retry once on failure
      refetchOnWindowFocus: false,      // don't refetch when tab regains focus
      refetchOnMount: true,           // refetch when component mounts
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      {/* DevTools only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}