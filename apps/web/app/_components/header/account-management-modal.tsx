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

export function AccountSecurityModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [copiedText, copy] = useCopyToClipboard();

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
                <h3 className="text-white font-medium">iatomic1</h3>
                <div className="w-2 h-2 rounded-full bg-green-500 ml-1" />
              </div>
              <div className="flex items-center text-sm text-zinc-400 mt-1">
                <span>User ID: 2c94...b2ba</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 text-zinc-400"
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
              >
                View Recovery Key
              </Button>
            }
          />

          <SettingsSection
            title="Language"
            description="Change the application language"
            action={
              <Select defaultValue="english">
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
            title="Wallets"
            description="Add or manage your external wallet accounts"
            action={
              <Button
                variant="secondary"
                size="sm"
                className="bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Wallets
              </Button>
            }
          />

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

          {/* <SettingsSection */}
          {/*   title="Yields" */}
          {/*   description="Earn passive income through Yields. Visit the Yields page to start earning" */}
          {/*   action={ */}
          {/*     <Button */}
          {/*       variant="secondary" */}
          {/*       size="sm" */}
          {/*       className="bg-zinc-800 hover:bg-zinc-700 text-white" */}
          {/*     > */}
          {/*       <ExternalLink className="h-4 w-4 mr-2" /> */}
          {/*       Enable Yield */}
          {/*     </Button> */}
          {/*   } */}
          {/* /> */}

          {/* Log Out Section */}
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="text-pink-500 font-medium">Log Out</h3>
              <p className="text-sm text-zinc-400">Log out of your account</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="bg-transparent hover:bg-transparent text-pink-500 hover:text-pink-400 border-none"
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
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
      <div>
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      <div>{action}</div>
    </div>
  );
}
