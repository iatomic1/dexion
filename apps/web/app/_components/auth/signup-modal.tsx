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
import { toast } from "sonner";
import { useState } from "react";
import { SiGoogle } from "@icons-pack/react-simple-icons";
import { signUpSchema } from "~/app/schema";
import { authClient } from "~/lib/auth-client";

interface SignUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
  onOtpTrigger: (email: string) => void;
}

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpModal({
  open,
  onOpenChange,
  onSwitchToLogin,
  onOtpTrigger,
}: SignUpModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      // const { error } = await authClient.signUp.email({
      //   email: values.email,
      //   password: values.password,
      //   name: "John Doe",
      // });

      await authClient.signUp.email(
        {
          name: "John Doe",
          email: values.email,
          password: values.password,
        },
        {
          onRequest: (ctx) => {
            setIsLoading(true);
          },
          onSuccess: (ctx) => {
            toast.success("OTP sent to your email");
            onOpenChange(false); // close signup modal
            onOtpTrigger(values.email); // open OTP modal with email context

            // toast.success("Authenticated");
            // setIsLoading(false);
          },
          onError: async (ctx) => {
            const errCode = ctx.error.code;
            if (errCode === "EMAIL_NOT_VERIFIED") {
              const { data, error } =
                await authClient.emailOtp.sendVerificationOtp({
                  email: values.email,
                  type: "email-verification",
                });

              if (error) {
                console.error(error);
              }
              console.log(data);
              if (data?.success) {
                toast.success("OTP sent to email");
              }

              onOpenChange(false);
              onOtpTrigger(values.email);
            }
            console.log(ctx);
            toast.error(ctx.error.message);
          },
        },
      );

      // if (error) {
      //   toast.error(error.message);
      //   return;
      // }
    } catch (err) {
      toast.error("Unexpected error");
      console.error(err);
    } finally {
      setIsLoading(false);
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
                        placeholder="Enter password (used after OTP)"
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
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
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
              <SiGoogle size={12} title="Google Icon" />
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
