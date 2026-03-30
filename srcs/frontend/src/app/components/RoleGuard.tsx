import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router";

export function RoleGuard({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
