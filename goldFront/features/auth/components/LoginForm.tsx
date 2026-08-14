"use client";

import { useState, useTransition } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loginAction } from "../api";
import { LoginFormValues, loginSchema } from "../lib/schemas";

interface LoginFormProps {
  redirectTo?: string;
  onSuccess?: () => void;
}

export function LoginForm({ redirectTo, onSuccess }: LoginFormProps = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setError("");
    startTransition(async () => {
      try {
        const result = await loginAction({
          email: values.email,
          password: values.password,
        });

        if (result.success && result.redirectPath) {
          // Call success callback if provided
          onSuccess?.();

          // Redirect to role-based route or custom redirect
          router.push(redirectTo || result.redirectPath);
          router.refresh();
        } else if (result.error) {
          setError(
            result.error.message == "Invalid email or password"
              ? "Invalid email or password"
              : "An unexpected error occurred",
          );
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  }

  return (
    <div className="auth-form-panel w-full max-w-[430px]">
      <div className="text-center">
        <h1
          className="auth-stagger text-[26px] font-semibold text-[#F7F9FC] sm:text-[28px]"
          style={{ "--auth-delay": "60ms" } as CSSProperties}
        >
          Welcome back
        </h1>
        <p
          className="auth-stagger mx-auto mt-2 max-w-[330px] text-[15px] leading-6 text-[#AAB4C3]"
          style={{ "--auth-delay": "110ms" } as CSSProperties}
        >
          Sign in to access your pharmaceutical operations dashboard.
        </p>
      </div>

      <div className="mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => {
                const hasFieldError = fieldState.invalid || Boolean(error);

                return (
                  <FormItem
                    className="auth-stagger"
                    style={{ "--auth-delay": "180ms" } as CSSProperties}
                  >
                    <FormLabel
                      htmlFor="email"
                      className="text-xs font-semibold text-[#DCE3EC]"
                    >
                      Email
                    </FormLabel>
                    <div className="group relative">
                      <UserRound
                        size={17}
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#8591A3] transition-colors duration-200 group-focus-within:text-[#D0A000]"
                      />
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          autoComplete="email"
                          onChange={(e) => {
                            setError("");
                            field.onChange(e);
                          }}
                          disabled={isPending}
                          className={cn(
                            "h-12 rounded-[9px] border border-white/[0.06] bg-[#272F3D] pl-11 text-[14px] font-medium text-[#F7F9FC] shadow-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-[#778294] hover:border-white/15 focus-visible:border-[#D0A000] focus-visible:bg-[#293241] focus-visible:ring-2 focus-visible:ring-[#D0A000]/20",
                            hasFieldError
                              ? "border-[#D9534F] bg-[#332A34] focus-visible:border-[#D9534F] focus-visible:ring-[#D9534F]/20"
                              : "",
                          )}
                          placeholder="example@golderapharm.com"
                          aria-invalid={hasFieldError}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs font-medium text-[#FCA5A5]" />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => {
                const hasFieldError = fieldState.invalid || Boolean(error);

                return (
                  <FormItem
                    className="auth-stagger"
                    style={{ "--auth-delay": "240ms" } as CSSProperties}
                  >
                    <FormLabel
                      htmlFor="password"
                      className="text-xs font-semibold text-[#DCE3EC]"
                    >
                      Password
                    </FormLabel>
                    <div className="group relative">
                      <LockKeyhole
                        size={17}
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#8591A3] transition-colors duration-200 group-focus-within:text-[#D0A000]"
                      />
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          onChange={(e) => {
                            setError("");
                            field.onChange(e);
                          }}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          disabled={isPending}
                          className={cn(
                            "h-12 rounded-[9px] border border-white/[0.06] bg-[#272F3D] pr-12 pl-11 text-[14px] font-medium text-[#F7F9FC] shadow-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-[#778294] hover:border-white/15 focus-visible:border-[#D0A000] focus-visible:bg-[#293241] focus-visible:ring-2 focus-visible:ring-[#D0A000]/20",
                            hasFieldError
                              ? "border-[#D9534F] bg-[#332A34] focus-visible:border-[#D9534F] focus-visible:ring-[#D9534F]/20"
                              : "",
                          )}
                          placeholder="Enter your password"
                          aria-invalid={hasFieldError}
                        />
                      </FormControl>
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((v) => !v)}
                        disabled={isPending}
                        className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-[#8C97A7] transition-colors duration-150 *:size-5 hover:bg-white/[0.04] hover:text-[#D0A000] focus-visible:ring-2 focus-visible:ring-[#D0A000]/35 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {showPassword ? <Eye /> : <EyeOff />}
                      </button>
                    </div>
                    <FormMessage className="text-xs font-medium text-[#FCA5A5]" />
                  </FormItem>
                );
              }}
            />

            <div
              className="auth-stagger flex flex-wrap items-center justify-between gap-3 pt-1"
              style={{ "--auth-delay": "300ms" } as CSSProperties}
            >
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        id="remember"
                        checked={field.value}
                        onCheckedChange={(v) => field.onChange(Boolean(v))}
                        disabled={isPending}
                        className="size-4 cursor-pointer rounded-[4px] border-white/15 bg-[#272F3D] text-[#101827] focus-visible:ring-2 focus-visible:ring-[#D0A000]/30 data-[state=checked]:border-[#D0A000] data-[state=checked]:bg-[#D0A000] data-[state=checked]:text-[#101827]"
                      />
                    </FormControl>
                    <Label
                      htmlFor="remember"
                      className="mb-0 cursor-pointer text-[13px] font-medium text-[#C8D0DC]"
                    >
                      Remember Me
                    </Label>
                  </FormItem>
                )}
              />

              <Link
                href="#"
                className="auth-link rounded-md text-[13px] font-medium text-[#D0A000] transition-colors hover:text-[#E0B119] focus-visible:ring-2 focus-visible:ring-[#D0A000]/35 focus-visible:outline-none"
              >
                Forgot Password
              </Link>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="auth-error rounded-[9px] border border-[#D9534F]/35 bg-[#D9534F]/10 px-4 py-3 text-center text-sm font-medium text-[#FCA5A5]"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className="auth-stagger h-[50px] w-full cursor-pointer rounded-[9px] bg-linear-to-br from-[#D8AC17] to-[#C99500] text-[14px] font-semibold text-[#101827] shadow-[0_10px_20px_rgba(201,149,0,0.18)] transition-all duration-200 hover:-translate-y-px hover:from-[#E0B119] hover:to-[#D0A000] hover:shadow-[0_14px_26px_rgba(201,149,0,0.22)] focus-visible:ring-4 focus-visible:ring-[#D0A000]/25 active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ "--auth-delay": "360ms" } as CSSProperties}
            >
              {isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </div>

      <div className="mt-8">
        <p
          className="auth-stagger w-full text-center text-[13px] font-medium text-[#AAB4C3]"
          style={{ "--auth-delay": "420ms" } as CSSProperties}
        >
          Need help?{" "}
          <span className="auth-link font-semibold text-[#F7F9FC]">
            Contact IT Support
          </span>
        </p>
      </div>
    </div>
  );
}
