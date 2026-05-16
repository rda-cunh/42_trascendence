import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Lock, Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";

export function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await register(formData);
      toast.success("Account created! You can now sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="app-page flex items-center justify-center px-4">
      <div className="surface w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <UserPlus className="mx-auto mb-3 h-12 w-12 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="muted-text mt-1">Join the game assets marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="form-control-icon"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-control-icon"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Phone (optional)</label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className="form-control-icon"
              />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="muted-text mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-purple-600 hover:underline dark:text-purple-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
