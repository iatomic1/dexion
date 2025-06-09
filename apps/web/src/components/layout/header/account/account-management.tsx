import { Button } from "@repo/ui/components/ui/button";
import { LogOut, User } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { AccountSecurityModal } from "./account-management-modal";

import { toast } from "@repo/ui/components/ui/sonner";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccountPopover() {
  const router = useRouter();
  const [open, setIsOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-primary"
        >
          <User className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-60 p-2"
        side="bottom"
        align="end"
        sideOffset={20}
      >
        <AccountSecurityModal>
          <Button
            className="w-full justify-start gap-3 bg-transparent "
            variant={"ghost"}
            // onClick={() => {
            //   setIsOpen(false);
            // }}
          >
            <User className="h-4 w-4" />
            Account and Security
          </Button>
        </AccountSecurityModal>
        <Button
          className="w-full justify-start gap-3 bg-transparent !text-destructive"
          variant={"ghost"}
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  router.push("/");
                  toast.success("Logged out");
                },
              },
            });
          }}
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </Button>
      </PopoverContent>
    </Popover>
  );
}
