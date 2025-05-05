import { Button } from "@repo/ui/components/ui/button";
import { Copy, Bell, Trash, Pencil } from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/ui/tooltip";
import dayjs from "dayjs";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { revalidateTagServer } from "~/app/_actions/revalidate";
import {
  untrackWalletAction,
  updateWalletPreferences,
} from "~/app/_actions/wallet-tracker-actions";
import useCopyToClipboard from "~/hooks/useCopy";
import useHover from "~/hooks/useHover";
import { HTTP_STATUS, EXPLORER_BASE_URL } from "~/lib/constants";
import { truncateAddress } from "~/lib/helpers/strings";
import { UserWallet } from "~/types/wallets";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// Customize the relative time formatting to be more compact
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "now",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    w: "1w",
    ww: "%dw",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

export const WalletItem = ({
  wallet,
  index,
}: {
  wallet: UserWallet;
  index: number;
}) => {
  const walletItemRef = useRef(null);
  const isWalletItemHover = useHover(walletItemRef);

  const nicknameSectionRef = useRef(null);
  const isNicknameHover = useHover(nicknameSectionRef);

  const [copiedText, copy] = useCopyToClipboard();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(wallet.nickname);
  const [notifications, setNotifications] = useState(wallet.notifications);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isPending: isUntrackPending, execute: executeUntrack } =
    useServerAction(untrackWalletAction, {
      onSuccess: async ({ data: res }) => {
        if (res.status === HTTP_STATUS.NOT_FOUND) {
          toast.error("You can't untrack a wallet you were not tracking");
          return;
        }
        revalidateTagServer("wallets");
        toast.success("Wallet removed successfully");
      },
    });

  const { isPending: isUpdatePending, execute: executeUpdate } =
    useServerAction(updateWalletPreferences, {
      onSuccess: async ({ data: res }) => {
        if (res.status === HTTP_STATUS.NOT_FOUND) {
          toast.error("Wallet not found");
          return;
        }
        revalidateTagServer("wallets");
        toast.success("Wallet updated successfully");
      },
      onError: (error) => {
        toast.error("Failed to update wallet preferences");
        console.error(error);
      },
    });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditSave = async () => {
    if (nickname !== wallet.nickname) {
      await executeUpdate({
        walletAddress: wallet.address,
        nickname: nickname,
        notifications: wallet.notifications,
      });
    }
    setIsEditing(false);
  };

  const toggleNotifications = async () => {
    const newNotificationState = !notifications;
    setNotifications(newNotificationState);
    await executeUpdate({
      walletAddress: wallet.address,
      notifications: newNotificationState,
      nickname: wallet.nickname,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleEditSave();
    } else if (e.key === "Escape") {
      setNickname(wallet.nickname);
      setIsEditing(false);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      isEditing &&
      inputRef.current &&
      !inputRef.current.contains(e.target as Node)
    ) {
      handleEditSave();
    }
  };

  useEffect(() => {
    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, nickname]);

  const formattedTime = dayjs(wallet.createdAt).fromNow(true);

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 transition-colors duration-200 ${
        index % 2 === 0 ? "bg-background" : "bg-muted/30"
      } hover:bg-muted`}
      ref={walletItemRef}
    >
      <div className="flex items-center gap-7">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="text-xs text-muted-foreground w-8 underline cursor-pointer"
                onClick={() => {
                  window.open(
                    `${EXPLORER_BASE_URL}/${wallet.address}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
              >
                {formattedTime}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open in Explorer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="flex items-center gap-4" ref={nicknameSectionRef}>
          <div className="flex items-center gap-1 relative group">
            <span>{wallet.emoji}</span>
            {isEditing ? (
              <Input
                ref={inputRef}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-6 text-sm font-medium w-24 py-0 px-1"
                disabled={isUpdatePending}
              />
            ) : (
              <>
                <span className="text-sm font-medium">{wallet.nickname}</span>
                {isNicknameHover && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0 absolute -right-6 opacity-0 scale-90 transform transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100"
                    onClick={() => setIsEditing(true)}
                    disabled={isUpdatePending}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="p-0 text-xs items-center text-muted-foreground flex gap-1"
            onClick={() => {
              copy(wallet.address);
              toast.success("Address copied to clipboard");
            }}
          >
            <p>{truncateAddress(wallet.address, 10, 4)}</p>
            <Copy className="h-3 w-3" strokeWidth={1} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={`h-6 relative ${isWalletItemHover ? "w-auto min-w-[24px] px-1" : "w-6"} transition-all duration-200`}
          onClick={toggleNotifications}
          disabled={isUpdatePending}
        >
          <Bell
            className={`h-3 w-3 ${notifications ? "text-pink-500" : "text-muted-foreground"}`}
          />
          {isWalletItemHover && !wallet.notifications && (
            <span className="ml-1 text-xs animate-fadeIn">Alerts</span>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={async () => {
            await executeUntrack({ walletAddress: wallet.address });
          }}
          disabled={isUntrackPending || isUpdatePending}
        >
          <Trash className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};
