"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// Import the token clearing function
import { useAuth } from "@/contexts/AuthContext";
import { NoteworthyLogo } from "@/components/NoteworthyLogo";
import { clearAuthTokens } from "@/lib/apiClient";

function LoginForm() {
  const { login, isLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [_email, _setEmail] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
      return;
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    // Clear any existing tokens when the login page loads (only if user is not logged in)
    if (!isLoading && !user) {
      clearAuthTokens();
    }
  }, [isLoading, user]);

  useEffect(() => {
    // Check for success message from registration
    const message = searchParams.get("message");
    if (message === "registration-success") {
      setSuccessMessage("Registration successful! Please sign in.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setApiError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.details) {
          // Handle detailed validation errors (though Zod on client-side should catch most)
          const errorMessages = Object.values(result.details).flat().join(" ");
          setApiError(
            errorMessages || result.error || "Login failed. Please try again.",
          );
        } else {
          setApiError(result.error || "Login failed. Please try again.");
        }
      } else {
        // Login successful
        // Token storage will be handled in Task-UM-002.9
        // The refresh token is set as an HttpOnly cookie by the server.
        // The access token should be stored in memory.
        if (result.accessToken && result.user) {
          // Use AuthContext login method to set both token and user data
          login(result.accessToken, result.user);
          console.log("Login successful, user:", result.user);
        }
        // Redirect will be handled in Task-UM-002.10
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login submission error:", error);
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/2 rounded-full blur-3xl animate-bounce-subtle"></div>
        </div>

        <div className="relative z-10">
          <Card className="bg-card/80 backdrop-blur-sm border shadow-xl animate-scale-in">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto bg-primary/10 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">
                  Checking Authentication
                </h2>
                <p className="text-muted-foreground">Please wait...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user is logged in, don't render the login form (redirect will happen)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/2 rounded-full blur-3xl animate-bounce-subtle"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-card/80 backdrop-blur-sm border shadow-xl animate-scale-in">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="flex justify-center items-center">
              <div className="relative animate-bounce-subtle">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-xl">
                  <NoteworthyLogo size={36} className="text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-foreground tracking-tight">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your Noteworthy account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {successMessage && (
              <div
                className="p-4 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-lg text-sm animate-slide-in-bottom"
                data-testid="success-message"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {apiError && (
              <div
                className="p-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm animate-slide-in-bottom"
                data-testid="error-message"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div
                className="space-y-2 animate-slide-in-left"
                style={{ animationDelay: "100ms" }}
              >
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  data-testid="email-input"
                  {...register("email")}
                  className={`smooth-hover ${
                    errors.email
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p
                    className="text-xs text-destructive mt-1 animate-slide-in-bottom"
                    data-testid="email-error"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div
                className="space-y-2 animate-slide-in-right"
                style={{ animationDelay: "200ms" }}
              >
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    data-testid="password-input"
                    {...register("password")}
                    className={`smooth-hover pr-10 ${
                      errors.password
                        ? "border-destructive focus:ring-destructive"
                        : ""
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    className="text-xs text-destructive mt-1 animate-slide-in-bottom"
                    data-testid="password-error"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div
                className="pt-2 animate-fade-in-scale"
                style={{ animationDelay: "300ms" }}
              >
                <Button
                  type="submit"
                  disabled={loading}
                  data-testid="login-button"
                  className="w-full group"
                  variant="default"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div
              className="relative animate-slide-in-bottom"
              style={{ animationDelay: "400ms" }}
            >
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div
              className="animate-slide-in-bottom"
              style={{ animationDelay: "500ms" }}
            >
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full group smooth-hover"
              >
                <a
                  href="/register"
                  data-testid="register-link"
                  className="flex items-center justify-center"
                >
                  <UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Create Account
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional features or links */}
        <div
          className="mt-8 text-center animate-slide-in-bottom"
          style={{ animationDelay: "600ms" }}
        >
          <p className="text-sm text-muted-foreground">
            Secure, private, and always under your control
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/2 rounded-full blur-3xl animate-bounce-subtle"></div>
      </div>

      <div className="relative z-10">
        <Card className="glass-effect border-slate-700/50 shadow-2xl animate-fade-in-scale">
          <CardContent className="p-8 text-center space-y-4">
            <div className="loading-shimmer w-16 h-16 rounded-full mx-auto"></div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-200">
                Loading Login Page
              </h2>
              <p className="text-slate-400">Please wait...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginForm />
    </Suspense>
  );
}
