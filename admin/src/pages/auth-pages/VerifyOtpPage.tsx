import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { LoaderCircle } from "lucide-react"

import { verifyOtp } from "@/config/api/auth.api"
import { useAuthStore } from "@/config/store/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface ApiErrorResponse {
  message: string
}

function OtpPage(props: React.ComponentProps<typeof Card>) {
  const [otp, setOtp] = useState("")

  const navigate = useNavigate()

  // pendingEmail is set by the login step — plain string | null, never a
  // nested destructure off a possibly-null object.
  const email = useAuthStore((state) => state.pendingEmail)
  const login = useAuthStore((state) => state.login)

  const otpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (data) => {
      login(data.user, data.token)
      navigate("/dashboard/home")
      toast.success("Login successful", { description: "Welcome back!" })
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Verification failed", {
        description: error.response?.data?.message ?? "Invalid verification code.",
      })
    },
  })

  function onSubmitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email) {
      toast.error("Session expired", { description: "Please login again." })
      navigate("/auth/login")
      return
    }

    if (otp.length === 6) {
      otpMutation.mutate({ email, otp })
    } else {
      toast.error("Invalid code", { description: "Please enter the complete 6-digit code." })
    }
  }

  return (
    <Card {...props} className="border-0 max-w-md shadow-none mx-auto py-[60px] lg:py-1">
      <CardHeader className="lg:px-6 px-0">
        <CardTitle className="text-2xl font-bold text-center">
          Enter verification code
        </CardTitle>
      </CardHeader>

      <CardContent className="lg:px-6 px-0">
        <form onSubmit={onSubmitHandler}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="otp" className="text-sm font-semibold text-[#374151]">
                Verification code
              </FieldLabel>

              <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                <InputOTPGroup className="gap-2.5 w-full">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="bg-[#E5E7EB] flex-1 p-6 rounded-md border"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <FieldDescription className="text-xs text-[#535353]">
                Enter the 6-digit code from your authenticator app{email ? ` for ${email}` : ""}.
              </FieldDescription>
            </Field>

            <Button
              type="submit"
              variant="theme"
              className="w-full"
              disabled={otpMutation.isPending}
            >
              {otpMutation.isPending && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
              {otpMutation.isPending ? "Verifying..." : "Verify & Continue"}
            </Button>

            <div className="text-center text-sm mt-4">
              <span className="text-[#535353]">Need help? </span>
              <button
                type="button"
                className="text-blue-600 hover:underline font-semibold"
                onClick={() => navigate("/auth/login")}
              >
                Go back to login
              </button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

export default OtpPage
