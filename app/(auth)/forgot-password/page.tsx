// ============================================
// app/(auth)/forgot-password/page.tsx
// ============================================
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Hotel, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api/client";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await apiClient.post("/auth/forgot-password", data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Hotel className="h-6 w-6" strokeWidth={2} />
          <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a reset link
          </p>
        </div>

        {success ? (
          <Alert>
            <AlertDescription>
              If an account exists with that email, you'll receive a password reset link shortly.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@rokadio.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="button" 
              className="w-full" 
              disabled={loading}
              onClick={handleSubmit(onSubmit)}
            >
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </div>
        )}

        <Link 
          href="/login" 
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to login
        </Link>
      </div>
    </div>
  );
}