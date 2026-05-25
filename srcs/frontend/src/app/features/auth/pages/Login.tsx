import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { useAuth } from "@/app/core/contexts/AuthContext";
import { Mail, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-page flex items-center justify-center px-4">
      <div className="surface w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <LogIn className="mx-auto mb-3 h-12 w-12 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="muted-text mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="form-control-icon"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-control-icon"
              />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          <span>OR</span>
          <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/api/auth/42/";
          }}
          className="btn-secondary w-full py-3"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-black font-bold text-white dark:bg-white dark:text-black">
            42
          </span>
          Sign in with 42
        </button>

        <p className="muted-text mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-purple-600 hover:underline dark:text-purple-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
