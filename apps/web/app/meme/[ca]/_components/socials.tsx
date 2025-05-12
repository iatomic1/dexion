import { SiDiscord, SiTelegram, SiX } from "@icons-pack/react-simple-icons";
import { TokenMetadata } from "@repo/token-watcher/token.ts";
import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { Globe } from "lucide-react";

export function Socials({ socials }: { socials: TokenMetadata["socials"] }) {
  return (
    <div className="flex items-center gap-3">
      {socials.map((social) => {
        const platform = social.platform;
        return (
          <Tooltip key={social.platform}>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                size={"icon"}
                className="!p-0 !bg-transparent h-4 w-4"
              >
                <a href={social.value}>
                  {platform === "twitter" && (
                    <SiX size={14} title="X icon" className="" />
                  )}
                  {platform === "discord" && (
                    <SiDiscord size={14} title="Discord Icon" />
                  )}
                  {platform === "telegram" && (
                    <SiTelegram size={14} title="Telegram Icon" />
                  )}
                  {platform === "website" && <Globe size={14} />}
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span className="font-semibold">
                {social.platform === "twitter" && "@"} {social.value}
              </span>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
