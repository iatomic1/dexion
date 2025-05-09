"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { saveUserTokens } from "~/lib/auth/auth";
import { HTTP_STATUS } from "~/lib/constants";
import { useServerAction } from "zsa-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginSchema } from "~/app/schema";
import { z } from "zod";
import { authAction } from "~/app/_actions/auth-actions";
import { ApiResponse } from "~/types";
import { AuthSuccess } from "~/types/auth";

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp: () => void;
}

export function LoginModal({
  open,
  onOpenChange,
  onSwitchToSignUp,
}: LoginModalProps) {
  const router = useRouter();
  const { isPending, execute } = useServerAction(authAction, {
    onSuccess: async ({ data: res }) => {
      console.log(res);
      if (res.status === HTTP_STATUS.OK || res.status === HTTP_STATUS.CREATED) {
        await saveUserTokens({
          accessToken: res?.data.accessToken as string,
          refreshToken: res?.data.refreshToken as string,
          userId: res?.data.userId,
        });
        router.push("/portfolio");
        router.refresh();
        return res; // Return the response for the toast.promise to use
      } else {
        if (res.status === HTTP_STATUS.CONFLICT)
          throw new Error(
            `User with this ${res.message.includes("username") ? "username" : "email"} Already Exists`,
          );
        if (res.status === HTTP_STATUS.UNAUTHORIZED)
          throw new Error("Invalid email or password");
        throw new Error("Authentication failed");
      }
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      console.log(values);

      toast.promise(
        // @ts-expect-errorWeird err here
        async () => {
          const result = await execute({
            ...values,
            signUp: false,
          });
          return result[0];
        },
        {
          loading: "Authenticating ",
          success: async (res: ApiResponse<AuthSuccess>) => {
            // Handle the response based on status
            if (res.status === HTTP_STATUS.OK) {
              await saveUserTokens({
                accessToken: res?.data.accessToken as string,
                refreshToken: res?.data.refreshToken as string,
                userId: res?.data.userId,
              });

              setTimeout(() => {
                router.push("/portfolio");
                router.refresh();
              }, 500);

              return "Authenticated";
            } else {
              if (res.status === HTTP_STATUS.UNAUTHORIZED) {
                return "Invalid username or password";
              }

              return "Authentication failed";
            }
          },
          error: (err) => {
            // Return the error message
            return err.message || "Authentication failed";
          },
        },
      );
    } catch (error) {
      console.error("Form submission error", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-background border-border">
        <div className="p-6">
          <DialogHeader className="relative mb-5">
            <DialogTitle className="text-xl font-medium text-center">
              Login
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email"
                        className="bg-muted/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs text-muted-foreground">
                        Password
                      </FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        className="bg-muted/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full text-sm font-medium py-5"
                disabled={isPending}
              >
                {isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Or
          </div>

          <div className="mt-4 space-y-4">
            <Button
              variant="outline"
              className="w-full bg-muted/50 py-5 text-sm"
              disabled
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 mr-2"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full bg-muted/50 py-5 text-sm"
              disabled
            >
              Connect with Xverse
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <button
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                onOpenChange(false);
                onSwitchToSignUp();
              }}
            >
              Sign Up
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
