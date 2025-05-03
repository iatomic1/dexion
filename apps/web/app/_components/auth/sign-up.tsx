"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { X } from "lucide-react";

export default function SignUpModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Sign Up</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-0 bg-background border-border">
        <div className="p-6">
          <DialogHeader className="relative mb-5">
            <DialogTitle className="text-xl font-medium text-center">
              Sign Up
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-xs mb-1.5 text-muted-foreground">Email</p>
              <Input placeholder="Enter email" className="bg-muted/50" />
            </div>

            <div>
              <Input
                placeholder="Invite code (optional)"
                className="bg-muted/50"
              />
            </div>

            <Button className="w-full text-sm font-medium py-5">Sign Up</Button>

            <div className="text-center text-sm text-muted-foreground">
              Or Sign Up
            </div>

            <Button
              variant="outline"
              className="w-full bg-muted/50 py-5 text-sm"
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
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5 mr-2"
                fill="none"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  fill="#AB9FF2"
                />
                <path
                  d="M8.77805 15.7547C8.77805 15.8173 8.72461 15.8707 8.66204 15.8707H7.10546C7.04288 15.8707 6.98944 15.8173 6.98944 15.7547V8.24533C6.98944 8.18275 7.04288 8.12931 7.10546 8.12931H8.66204C8.72461 8.12931 8.77805 8.18275 8.77805 8.24533V15.7547Z"
                  fill="white"
                />
                <path
                  d="M17.0106 15.7547C17.0106 15.8173 16.9571 15.8707 16.8946 15.8707H15.338C15.2754 15.8707 15.222 15.8173 15.222 15.7547V8.24533C15.222 8.18275 15.2754 8.12931 15.338 8.12931H16.8946C16.9571 8.12931 17.0106 8.18275 17.0106 8.24533V15.7547Z"
                  fill="white"
                />
                <path
                  d="M12.8943 15.7547C12.8943 15.8173 12.8409 15.8707 12.7783 15.8707H11.2217C11.1591 15.8707 11.1057 15.8173 11.1057 15.7547V8.24533C11.1057 8.18275 11.1591 8.12931 11.2217 8.12931H12.7783C12.8409 8.12931 12.8943 8.18275 12.8943 8.24533V15.7547Z"
                  fill="white"
                />
              </svg>
              Connect with Phantom
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="#" className="text-primary hover:underline">
              Login
            </Link>
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
