import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    const finishLogin = async () => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;

      const accessToken = searchParams.get("access") || searchParams.get("access_token");
      const rawUser = searchParams.get("user");

      if (!accessToken) {
        setError("OAuth response did not include an access token.");
        return;
      }

      let userData: unknown;
      if (rawUser) {
        try {
          userData = JSON.parse(rawUser);
        } catch {
          userData = undefined;
        }
      }

      try {
        await completeOAuthLogin(accessToken, userData);
        toast.success("Signed in with 42");
        navigate("/", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not complete OAuth login.");
      }
    };

    finishLogin();
  }, [completeOAuthLogin, navigate, searchParams]);

  return <OAuthStatus state="success" message={error ?? "Completing 42 sign in..."} />;
}

export function OAuthError() {
  const [searchParams] = useSearchParams();
  const error = useMemo(() => {
    const value = searchParams.get("error");
    return value ? value.replace(/_/g, " ") : "42 sign in was cancelled or failed.";
  }, [searchParams]);

  return <OAuthStatus state="error" message={error} />;
}

function OAuthStatus({ state, message }: { state: "success" | "error"; message: string }) {
  const isError = state === "error";

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 transition-colors dark:bg-gray-950">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {isError ? (
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        ) : (
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-purple-600" />
        )}
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          {isError ? "Sign In Failed" : "Signing You In"}
        </h1>
        <p className="mb-6 text-gray-600 capitalize dark:text-gray-400">{message}</p>
        {isError && (
          <Link
            to="/login"
            className="inline-flex rounded-lg bg-purple-600 px-5 py-3 font-medium text-white transition-colors hover:bg-purple-700"
          >
            Back to Login
          </Link>
        )}
      </div>
    </div>
  );
}
