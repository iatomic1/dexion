"use client";
import { SessionsCard } from "@daveyplate/better-auth-ui";

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
import { toast } from "@repo/ui/components/ui/sonner";
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
import { useState } from "react";
import AvatarUpload from "./avatar-upload";
import { formatRelativeTime } from "~/lib/helpers/dayjs";
import Disable2FADialog from "~/components/auth/twofa/disable-2fa-dialog";
import Enable2FADialog from "~/components/auth/twofa/enable-2fa-dialog";
import SetInviteCode from "./set-invite-code";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

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
            {session ? (
              <>
                <AvatarUpload
                  currentAvatarUrl={session?.user.image}
                  onUploadSuccess={async (url, fileId) => {
                    await authClient.updateUser({
                      image: url,
                    });
                    toast.success("Profile updated");
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="text-white font-medium">
                      {session?.user.inviteCode
                        ? session?.user.inviteCode
                        : session?.user.email}
                    </h3>
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
                    <div className="text-zinc-300">
                      {formatRelativeTime(session?.session.createdAt)}
                    </div>
                    {session?.user.inviteCode ? (
                      <div className="flex items-center text-zinc-300">
                        <span>@{session?.user.inviteCode}</span>
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
                    ) : (
                      <SetInviteCode>
                        <button>Set Referral Code</button>
                      </SetInviteCode>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Skeleton className="w-12 h-12 rounded-full bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32 bg-zinc-700" />
                    <Skeleton className="w-2 h-2 rounded-full bg-zinc-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24 bg-zinc-700" />
                    <Skeleton className="h-4 w-4 bg-zinc-700" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20 bg-zinc-700" />
                    <Skeleton className="h-4 w-16 bg-zinc-700" />
                    <Skeleton className="h-4 w-18 bg-zinc-700" />
                    <Skeleton className="h-4 w-24 bg-zinc-700" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings Sections */}
          {session ? (
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
          ) : (
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-24 bg-zinc-700" />
                <Skeleton className="h-4 w-48 bg-zinc-700" />
              </div>
              <Skeleton className="h-8 w-32 bg-zinc-700" />
            </div>
          )}

          {session ? (
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
          ) : (
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-20 bg-zinc-700" />
                <Skeleton className="h-4 w-40 bg-zinc-700" />
              </div>
              <Skeleton className="h-8 w-44 bg-zinc-700" />
            </div>
          )}
          {session ? (
            <SettingsSection
              title="Manage 2FA"
              description="Manage your auth"
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
              }
            />
          ) : (
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-24 bg-zinc-700" />
                <Skeleton className="h-4 w-32 bg-zinc-700" />
              </div>
              <Skeleton className="h-8 w-24 bg-zinc-700" />
            </div>
          )}

          {session ? (
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
          ) : (
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-16 bg-zinc-700" />
                <Skeleton className="h-4 w-56 bg-zinc-700" />
              </div>
              <Skeleton className="h-8 w-28 bg-zinc-700" />
            </div>
          )}
          {session ? (
            <>
              <SessionsCard
                classNames={{
                  base: "rounded-none pt-3 pb-0 border-0 border-t border-t-[1px] px-0",
                  cell: "justify-between [&>*:nth-child(2)]:mr-auto",
                }}
              />
              <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-pink-500 font-medium">Log Out</h3>
                  <p className="text-sm text-zinc-400">
                    Log out of your account
                  </p>
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
            </>
          ) : (
            <>
              <div className="p-4 border-t border-zinc-800 space-y-3">
                <Skeleton className="h-5 w-32 bg-zinc-700" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full bg-zinc-700" />
                  <Skeleton className="h-12 w-full bg-zinc-700" />
                </div>
              </div>
              <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-16 bg-zinc-700" />
                  <Skeleton className="h-4 w-40 bg-zinc-700" />
                </div>
                <Skeleton className="h-8 w-20 bg-zinc-700" />
              </div>
            </>
          )}
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
