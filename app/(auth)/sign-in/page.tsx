"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/lib/services/auth.service";
import { Hotel, Eye, EyeOff, Loader2 } from "lucide-react";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const user = authService.getUser();
        console.log("User already authenticated, redirecting...");
        
        if (user?.onboardingCompleted === false) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }
      }
      setChecking(false);
    };

    checkAuth();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInForm) => {
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", data.identifier);
      
      const response = await authService.login({
        identifier: data.identifier,
        password: data.password,
      });

      console.log("Login response:", response);

      if (response?.data?.user) {
        const user = response.data.user;
        
        // Check onboarding status
        if (user.onboardingCompleted === false) {
          console.log("Redirecting to onboarding...");
          router.replace("/onboarding");
        } else {
          console.log("Redirecting to dashboard...");
          router.replace("/dashboard");
        }
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Hotel className="h-6 w-6 text-primary" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to Rokadio</h1>
          <p className="text-sm text-muted-foreground">Hotel Management Platform</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Username</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="admin@rokadio.com"
              disabled={loading}
              {...register("identifier")}
            />
            {errors.identifier && (
              <p className="text-sm font-medium text-destructive">
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={loading}
                {...register("password")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Eye className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm font-medium text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={loading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>
            <a
              href="/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Protected by AES-256-GCM encryption
          </p>
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}