import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import React, { useState } from "react";
import { authClient } from "~/lib/auth-client";

export default function SetInviteCode({
  children,
}: {
  children: React.ReactNode;
}) {
  const [referralCode, setReferralCode] = useState("dexion");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updatePromise = new Promise((resolve, reject) => {
      authClient.updateUser(
        { inviteCode: referralCode },
        {
          onSuccess(ctx) {
            resolve(ctx);
          },
          onError(ctx) {
            reject(ctx.error);
          },
        },
      );
    });

    toast.promise(updatePromise, {
      loading: "Setting referral code...",
      success: () => {
        // Close dialog and reset loading state after success
        setTimeout(() => {
          setIsDialogOpen(false);
          setIsLoading(false);
        }, 500);
        return "Referral code set successfully!";
      },
      error: (error) => {
        setIsLoading(false);
        return error.message || "Failed to set referral code";
      },
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm px-0" showCloseIcon>
        <DialogHeader>
          <DialogTitle className=" text-base text-center">
            Set Referral Code
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="pt-3 px-4">
          <div className="flex flex-col gap-1">
            <Label
              className="text-xs text-muted-foreground"
              htmlFor="referralCode"
            >
              Referral Code
            </Label>
            <Input
              className="rounded-full text-xs placeholder:text-xs"
              placeholder="Enter referral code"
              id="referralCode"
              onChange={(e) => setReferralCode(e.target.value)}
              required
              value={referralCode}
            />
          </div>
          <Button
            className="rounded-full w-full mt-4 font-bold text-sm"
            size={"lg"}
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Setting..." : "Set"}
          </Button>
        </form>
        <Separator />
        <DialogFooter className="px-7">
          <span className="text-xs text-center opacity-80">
            Set your referral code and earn 30%+ from the people you refer! Your
            referral code will also be your username
          </span>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
