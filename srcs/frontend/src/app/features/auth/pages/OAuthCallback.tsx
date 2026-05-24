import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { User } from "@/app/core/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OAuthCallbackProps {
  status: "success" | "error";
}

export function OAuthCallback({ status }: OAuthCallbackProps) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    if (status === "error") {
      const reason = params.get("error") ?? "OAuth authentication failed";
      toast.error(`42 sign-in failed: ${reason}`);
      navigate("/login", { replace: true });
      return;
    }

    const access = params.get("access");
    const userParam = params.get("user");

    if (!access) {
      toast.error("Missing access token from 42 callback");
      navigate("/login", { replace: true });
      return;
    }

    let oauthUser: User | undefined;
    if (userParam) {
      try {
        const raw = JSON.parse(userParam);
        oauthUser = {
          id: String(raw.id ?? raw.user_id ?? ""),
          email: raw.email,
          name: raw.name,
          phone: raw.phone,
          role: raw.role,
          status: raw.status?.toLowerCase?.(),
        };
      } catch {
        // Ignore malformed user payload — fall back to token-derived user.
      }
    }

    loginWithOAuth(access, oauthUser)
      .then(() => {
        toast.success("Signed in with 42");
        navigate("/", { replace: true });
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "OAuth sign-in failed");
        navigate("/login", { replace: true });
      });
  }, [status, params, loginWithOAuth, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3 text-gray-700 dark:text-gray-300">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm">Finalizing 42 sign-in…</p>
      </div>
    </div>
  );
}
