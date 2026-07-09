"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, UserRound } from "lucide-react";
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
    <div className="w-5xl rounded-2xl bg-white px-[80] pt-10 shadow-2xl">
      <Card className="flex-1 border-0 bg-white shadow-none outline-0">
        <CardHeader className="mb-2 flex items-center justify-center gap-6">
          <Image
            src={"/logos/logo.webp"}
            width={110}
            height={125}
            alt={"Golderapharm"}
          />
          <div>
            <h1 className="text-gold text-[34px]/10 font-normal -tracking-[0.8px]">
              Golderapharm system
            </h1>
            <p className="text-secondary-dark text-base/6 font-normal">
              Sign in to manage your pharmaceutical operations
            </p>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto max-w-[860px] space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="text-[15px]/5 font-normal text-black">
                      Email
                    </FormLabel>
                    <div className="bg-secondary-very-light relative">
                      <UserRound
                        size={24}
                        className="text-secondary-dark absolute inset-y-0 top-1/2 left-3 flex -translate-y-1/2 items-center"
                      />
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            setError("");
                            field.onChange(e);
                          }}
                          id="email"
                          disabled={isPending}
                          className={`text-secondary-dark focus-visible:ring-light-blue h-[50px] pl-10 ${
                            error
                              ? "border-dashboard-red bg-light-red"
                              : "border-secondary-light bg-secondary-very-light"
                          }`}
                          placeholder="example@golderapharm.com"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="absolute right-15 bottom-4" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="relative mx-auto mt-6 max-w-[860px]">
                    <FormLabel className="text-[15px]/5 font-normal text-black">
                      Password
                    </FormLabel>
                    <div className="bg-secondary-very-light relative">
                      <Image
                        src={"/icons/lock-password.svg"}
                        width={20}
                        height={20}
                        className="text-secondary-dark absolute inset-y-0 top-1/2 left-3 flex -translate-y-1/2 items-center"
                        alt={"Golderapharm"}
                      />
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            setError("");
                            field.onChange(e);
                          }}
                          id="password"
                          type={showPassword ? "text" : "password"}
                          disabled={isPending}
                          className={`text-secondary-dark focus-visible:ring-light-blue h-[50px] pr-10 pl-10 ${
                            error
                              ? "border-dashboard-red bg-light-red"
                              : "border-secondary-light bg-secondary-very-light"
                          }`}
                          placeholder="••••••••"
                        />
                      </FormControl>
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-2 flex cursor-pointer items-center text-slate-500 *:size-6"
                      >
                        {showPassword ? <Eye /> : <EyeOff />}
                      </button>
                    </div>
                    <FormMessage className="absolute right-15 bottom-4" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center">
                      <FormControl>
                        <Checkbox
                          id="remember"
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(Boolean(v))}
                          disabled={isPending}
                          className="border-secondary-dark cursor-pointer border"
                        />
                      </FormControl>
                      <Label
                        htmlFor="remember"
                        className="text-secondary-dark mb-0 cursor-pointer text-sm/4"
                      >
                        Remember Me
                      </Label>
                    </FormItem>
                  )}
                />

                <Link
                  href="#"
                  className="text-dashboard-blue text-[12px] underline"
                >
                  Forget Password?
                </Link>
              </div>

              {error && (
                <p className="text-dashboard-red absolute left-1/2 mx-auto -translate-x-1/2 text-center text-lg font-bold">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="hover:outline-dashboard-blue hover:text-dashboard-blue from-dashboard-blue mt-10 h-[50px] w-full cursor-pointer bg-linear-to-b to-[#1E3A8A] text-[23px]/6 font-medium text-white shadow-lg transition-colors duration-200 hover:from-white hover:to-white hover:shadow-none hover:outline-1 hover:outline-solid disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="px-6 pb-6">
          <p className="text-secondary-text w-full text-center text-sm/5">
            Need help?{" "}
            <span className="text-dashboard-blue text-base/5 font-medium">
              Contact IT Support
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
