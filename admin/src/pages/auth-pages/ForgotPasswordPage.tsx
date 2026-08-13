import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle, MailCheck } from "lucide-react";

import { forgotPassword } from "@/config/api/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ApiErrorResponse {
  message: string;
}

function ForgotPasswordPage(props: React.ComponentProps<typeof Card>) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setSent(true);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Something went wrong", {
        description: error.response?.data?.message ?? "Please try again.",
      });
    },
  });

  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email) {
      forgotPasswordMutation.mutate({ email });
    }
  }

  if (sent) {
    return (
      <Card {...props} className="border-0 max-w-md shadow-none mx-auto py-[60px] lg:py-1">
        <CardContent className="lg:px-6 px-0 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <MailCheck className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold mb-2">Check your email</CardTitle>
          <p className="text-sm text-[#535353] mb-6">
            If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. The link
            expires in 1 hour.
          </p>
          <button
            type="button"
            className="text-blue-600 hover:underline font-semibold text-sm"
            onClick={() => navigate("/auth/login")}
          >
            Go back to login
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card {...props} className="border-0 max-w-md shadow-none mx-auto py-[60px] lg:py-1">
      <CardHeader className="lg:px-6 px-0">
        <CardTitle className="text-2xl font-bold text-center">Forgot password?</CardTitle>
      </CardHeader>

      <CardContent className="lg:px-6 px-0">
        <form onSubmit={onSubmitHandler}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FieldDescription className="text-xs text-[#535353]">
                Enter the email address on your admin account and we'll send you a link to reset your password.
              </FieldDescription>
            </Field>

            <Button
              type="submit"
              variant="theme"
              className="w-full"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
              {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center text-sm mt-4">
              <span className="text-[#535353]">Remembered your password? </span>
              <button
                type="button"
                className="text-blue-600 hover:underline font-semibold"
                onClick={() => navigate("/auth/login")}
              >
                Back to login
              </button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export default ForgotPasswordPage;
