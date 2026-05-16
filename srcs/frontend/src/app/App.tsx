import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { PresenceProvider } from "./contexts/PresenceContext";
import { Toast } from "./components/Toast";

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
