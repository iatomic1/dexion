"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import Link from "next/link";
import { authAction } from "~/app/_actions/auth-actions";
import { saveUserTokens } from "~/lib/auth/auth";
import { HTTP_STATUS } from "~/lib/constants";
import { useServerAction } from "zsa-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "~/app/schema";
import { ApiResponse } from "~/types";
import { AuthSuccess } from "~/types/auth";

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

export function SignUpModal({
  open,
  onOpenChange,
  onSwitchToLogin,
}: SignUpModalProps) {
  const router = useRouter();

  const { isPending, execute } = useServerAction(authAction, {
    onSuccess: async ({ data: res }) => {
      return res;
    },
  });

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      toast.promise(
        // @ts-expect-errorWeird err here
        async () => {
          const result = await execute({
            ...values,
            signUp: true,
          });
          return result[0];
        },
        {
          loading: "Creating account...",
          success: async (res: ApiResponse<AuthSuccess>) => {
            // Handle the response based on status
            if (
              res.status === HTTP_STATUS.OK ||
              res.status === HTTP_STATUS.CREATED
            ) {
              await saveUserTokens({
                accessToken: res?.data.accessToken as string,
                refreshToken: res?.data.refreshToken as string,
                userId: res?.data.userId,
              });

              // Navigate after a small delay to ensure toast is visible
              setTimeout(() => {
                router.push("/portfolio");
                router.refresh();
              }, 500);

              return "Account created successfully";
            } else {
              // Handle error cases but return messages instead of throwing errors
              if (res.status === HTTP_STATUS.CONFLICT) {
                return "User with this email already exists";
                // throw new Error(
                //   `User with this ${res.message?.includes("username") ? "username" : "email"} already exists`,
                // );
              }
              if (res.status === HTTP_STATUS.UNAUTHORIZED) {
                return "Unauthorized request";
              }

              return "Failed to create account";
            }
          },
          error: (err) => {
            // Return the error message
            return err.message || "Failed to create account";
          },
        },
      );
    } catch (error) {
      console.error("Form submission error", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 bg-background border-border">
        <div className="p-6">
          <DialogHeader className="relative mb-5">
            <DialogTitle className="text-xl font-medium text-center">
              Sign Up
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
                        className="rounded-full"
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
                    <FormLabel className="text-xs text-muted-foreground">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="rounded-full"
                        placeholder="Enter password"
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
                {isPending ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          <div className="mt-3 text-center text-sm text-muted-foreground">
            Or
          </div>

          <div className="mt-4 space-y-3">
            <Button
              variant="outline"
              className="w-full bg-muted/50 py-5 text-sm rounded-full"
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
              className="w-full bg-muted/50 py-5 text-sm rounded-full"
              disabled
            >
              Connect with Xverse
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button
              className="text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                onOpenChange(false);
                onSwitchToLogin();
              }}
            >
              Login
            </button>
          </div>

          <div className="mt-4 text-xs text-center text-muted-foreground">
            By creating an account, you agree to Axiom's{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
