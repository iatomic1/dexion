"use client";
import type React from "react";
import { Copy, ExternalLink, Info } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { toast } from "sonner";
import useCopyToClipboard from "~/hooks/useCopy";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@repo/ui/components/ui/credenza";
import { cn } from "@repo/ui/lib/utils";

import { truncateString } from "~/lib/helpers/strings";
import { useRouter } from "next/navigation";
import { authClient } from "~/lib/auth-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import Enable2FADialog from "../auth/twofa/enable-2fa-dialog";
import { useState } from "react";
import Disable2FADialog from "../auth/twofa/disable-2fa-dialog";

export function AccountSecurityModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const copy = useCopyToClipboard();
  const { data: session } = authClient.useSession();
  const { data: userSessions, isLoading } = useSuspenseQuery({
    queryKey: ["sessions", session?.user.id],
    queryFn: () =>
      authClient.listSessions({
        query: { userId: session?.user.id },
      }),
    // placeholderData: keepPreviousData,
  });

  const router = useRouter();

  if (!session) {
    return <div>Loading</div>;
  }

  return (
    <Credenza>
      <CredenzaTrigger asChild>{children}</CredenzaTrigger>
      <CredenzaContent className="sm:max-w-2xl bg-zinc-900 border-zinc-800 text-white p-0 overflow-hidden">
        <CredenzaHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between">
          <CredenzaTitle className="text-white">
            Account and Security
          </CredenzaTitle>
        </CredenzaHeader>

        <div className="flex flex-col">
          {/* User Profile Section */}
          <div className="p-4 flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-700 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <h3 className="text-white font-medium">{session?.user.name}</h3>
                <div className="w-2 h-2 rounded-full bg-green-500 ml-1" />
              </div>
              <div className="flex items-center text-sm text-zinc-400 mt-1">
                <span>
                  User ID: {truncateString(session?.user.id as string)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 text-zinc-400"
                  onClick={() => {
                    copy(session?.user.id as string);
                    toast.info("UserID copied to clipboard");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="text-zinc-400">Rewards Level</div>
                <div className="flex items-center text-zinc-300">
                  <span className="border-b border-dotted border-zinc-600">
                    Bronze
                  </span>
                  <Info className="h-3 w-3 ml-1 text-zinc-400" />
                </div>
                <div className="text-zinc-400">Last Login</div>
                <div className="text-zinc-300">5d</div>
                <div className="flex items-center text-zinc-300">
                  <span>@iatomic1</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1 text-zinc-400"
                    onClick={() => {
                      copy("iatomic1");
                      toast.info("Referral link copied to clipboard");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <SettingsSection
            title="Recovery Key"
            description="Access your seed phrase to export your accounts. DO NOT SHARE!"
            action={
              <Button
                variant="secondary"
                size="sm"
                className="bg-zinc-800 hover:bg-zinc-700 text-white"
                disabled
              >
                View Recovery Key
              </Button>
            }
          />

          <SettingsSection
            title="Language"
            description="Change the application language"
            action={
              <Select defaultValue="english" disabled>
                <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🇺🇸</span>
                    <SelectValue placeholder="Select language" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="english">🇺🇸 English</SelectItem>
                  <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="french">🇫🇷 French</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <SettingsSection
            title="Manage 2FA"
            description="Manage your auth"
            // className="bg-"
            action={
              session?.user.twoFactorEnabled ? (
                <Disable2FADialog
                  trigger={
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-zinc-800 hover:bg-zinc-700 text-white"
                    >
                      Disable 2FA
                    </Button>
                  }
                />
              ) : (
                <Enable2FADialog
                  userEmail={session.user.email}
                  isOpen={dialogOpen}
                  onOpenChange={setDialogOpen}
                  authClient={authClient}
                  trigger={
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-zinc-800 hover:bg-zinc-700 text-white"
                      onClick={() => {}}
                    >
                      Enable 2FA
                    </Button>
                  }
                />
              )
              // <Switch
              //   id="two-factor"
              //   onCheckedChange={(c) => {
              //     console.log(c);
              //   }}
              // />
            }
          />
          {/* <Collapsible defaultOpen={true}> */}
          {/*   <CollapsibleTrigger asChild> */}
          {/*     <SettingsSection */}
          {/*       title="Auth" */}
          {/*       description="Manage your auth" */}
          {/*       // className="bg-" */}
          {/*       action={ */}
          {/*         <Button */}
          {/*           variant="secondary" */}
          {/*           size="sm" */}
          {/*           disabled */}
          {/*           className="bg-zinc-800 hover:bg-zinc-700 text-white" */}
          {/*         > */}
          {/*           <ExternalLink className="h-4 w-4 mr-2" /> */}
          {/*           Manage Sessions */}
          {/*         </Button> */}
          {/*       } */}
          {/*     /> */}
          {/*   </CollapsibleTrigger> */}
          {/*   <CollapsibleContent className=" pb-4"> */}
          {/*     <SettingsSection */}
          {/*       title="Sessions" */}
          {/*       description="Manage your sessions" */}
          {/*       className="!px-4" */}
          {/*       action={ */}
          {/*         <Button */}
          {/*           variant="secondary" */}
          {/*           size="sm" */}
          {/*           disabled */}
          {/*           className="bg-zinc-800 hover:bg-zinc-700 text-white" */}
          {/*         > */}
          {/*           <ExternalLink className="h-4 w-4 mr-2" /> */}
          {/*           Manage Sessions */}
          {/*         </Button> */}
          {/*       } */}
          {/*     /> */}
          {/*   </CollapsibleContent> */}
          {/* </Collapsible> */}
          <SettingsSection
            title="Rewards"
            description="Earn free SOL. Visit the rewards page to get started"
            action={
              <Button
                variant="secondary"
                size="sm"
                className="bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Earn Rewards
              </Button>
            }
          />

          <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-pink-500 font-medium">Log Out</h3>
              <p className="text-sm text-zinc-400">Log out of your account</p>
            </div>
            <Button
              variant="destructive"
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
              size="sm"
            >
              Log Out
            </Button>
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}

function SettingsSection({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-4 border-t border-zinc-800 flex items-center justify-between",
        className,
      )}
    >
      <div>
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      <div>{action}</div>
    </div>
  );
}
