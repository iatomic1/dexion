"use client";
import { EXPLORER_BASE_URL, HTTP_STATUS } from "@dexion/shared";
import { Button } from "@dexion/ui/components/ui/button";
import { Input } from "@dexion/ui/components/ui/input";
import { toast } from "@dexion/ui/components/ui/sonner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@dexion/ui/components/ui/tooltip";
import { Bell, Copy, Pencil, Trash } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useRef, useState } from "react";
import { revalidateTagServer } from "~/app/actions/revalidate";
import {
	untrackWalletAction,
	updateWalletPreferences,
} from "~/app/actions/wallet-tracker-actions";
import useCopyToClipboard from "~/hooks/useCopy";
import useHover from "~/hooks/useHover";
import { formatRelativeTime } from "~/lib/helpers/dayjs";
import openInNewPage from "~/lib/helpers/openInNewPage";
import { truncateString } from "~/lib/helpers/strings";
import type { UserWallet } from "~/types/wallets";

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

	const copy = useCopyToClipboard();
	const [isEditing, setIsEditing] = useState(false);
	const [nickname, setNickname] = useState(wallet.nickname);
	const [notifications, setNotifications] = useState(wallet.notifications);
	const inputRef = useRef<HTMLInputElement>(null);

	const { execute: executeUntrack, status: untrackStatus } = useAction(
		untrackWalletAction,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.OK) {
					toast.success("Wallet removed successfully");
					revalidateTagServer("wallets");
				} else {
					toast.error(data.data?.message || "Failed to untrack wallet");
				}
			},

			onError: ({ error: { serverError } }) => {
				toast.error(serverError?.errorMessage || "Failed to untrack wallet");
			},
		},
	);

	const { execute: executeUpdate, status: updateStatus } = useAction(
		updateWalletPreferences,
		{
			onSuccess: (data) => {
				if (data.data?.status === HTTP_STATUS.OK) {
					toast.success("Wallet updated successfully");
					revalidateTagServer("wallets");
				} else {
					toast.error(data.data?.message || "Failed to update wallet");
				}
			},
			onError: ({ error: { serverError } }) => {
				toast.error(serverError?.errorMessage || "Failed to update wallet");
			},
		},
	);

	const isUntrackPending = untrackStatus === "executing";
	const isUpdatePending = updateStatus === "executing";

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing]);

	const handleEditSave = async () => {
		if (nickname !== wallet.nickname) {
			executeUpdate({
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
		executeUpdate({
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

	// Use our new formatter utility instead of direct dayjs call
	const formattedTime = formatRelativeTime(wallet.createdAt);

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
								className="text-xs text-muted-foreground w-8 underline underline-offset-4 cursor-pointer"
								onClick={() => {
									openInNewPage(
										`${EXPLORER_BASE_URL}address/${wallet.address}`,
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
						<span className="text-sm">{wallet.emoji}</span>
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
								<span className="text-xs font-medium">{wallet.nickname}</span>
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
						size="xs"
						className="p-0 text-xs  items-center text-muted-foreground flex gap-1"
						onClick={() => {
							copy(wallet.address);
							toast.success("Address copied to clipboard");
						}}
					>
						<p>{truncateString(wallet.address, 10, 4)}</p>
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
						executeUntrack({ walletAddress: wallet.address });
					}}
					disabled={isUntrackPending || isUpdatePending}
				>
					<Trash className="h-3 w-3 text-muted-foreground" />
				</Button>
			</div>
		</div>
	);
};
