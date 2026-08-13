import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { resetPassword } from "@/config/api/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ApiErrorResponse {
  message: string;
}

function ResetPasswordPage(props: React.ComponentProps<typeof Card>) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset", { description: "You can now log in with your new password." });
      navigate("/auth/login");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Couldn't reset password", {
        description: error.response?.data?.message ?? "This link may be invalid or expired.",
      });
    },
  });

  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password too short", { description: "Use at least 8 characters." });
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match", { description: "Please re-enter your new password." });
      return;
    }

    resetPasswordMutation.mutate({ token, password });
  }

  if (!token) {
    return (
      <Card {...props} className="border-0 max-w-md shadow-none mx-auto py-[60px] lg:py-1">
        <CardContent className="lg:px-6 px-0 text-center">
          <CardTitle className="text-xl font-bold mb-2">Invalid reset link</CardTitle>
          <p className="text-sm text-[#535353] mb-6">
            This password reset link is missing its token. Request a new one from the login page.
          </p>
          <Link to="/auth/forgot-password" className="text-blue-600 hover:underline font-semibold text-sm">
            Request a new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...props} className="border-0 max-w-md shadow-none mx-auto py-[60px] lg:py-1">
      <CardHeader className="lg:px-6 px-0">
        <CardTitle className="text-2xl font-bold text-center">Set a new password</CardTitle>
      </CardHeader>

      <CardContent className="lg:px-6 px-0">
        <form onSubmit={onSubmitHandler}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldDescription className="text-xs text-[#535353]">At least 8 characters.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>

            <Button
              type="submit"
              variant="theme"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default ResetPasswordPage;
