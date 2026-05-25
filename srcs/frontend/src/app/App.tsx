import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "@/app/core/contexts/AuthContext";
import { CartProvider } from "@/app/core/contexts/CartContext";
import { PresenceProvider } from "@/app/core/contexts/PresenceContext";
import { ThemeProvider } from "@/app/core/contexts/ThemeContext";
import { Toast } from "@/app/shared/components/Toast";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PresenceProvider>
          <CartProvider>
            <RouterProvider router={router} />
            <Toast />
          </CartProvider>
        </PresenceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
