"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { toast } from "@repo/ui/components/ui/sonner";
import { Copy, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCopyToClipboard from "~/hooks/useCopy";
import { authClient } from "~/lib/auth-client";
import { truncateString } from "~/lib/helpers/strings";
import type { Session } from "~/types/auth";

export function AccountDropdown({ session }: { session: Session }) {
	const router = useRouter();
	const copy = useCopyToClipboard();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full text-primary"
				>
					<User className="h-5 w-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-64"
				side="bottom"
				align="end"
				sideOffset={8}
			>
				<DropdownMenuGroup>
					<DropdownMenuItem>{session?.user?.email}</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							copy(session?.user?.id || "");
							toast.copy("UserID copied to clipboard");
						}}
					>
						{truncateString(session?.user?.id, 6, 4)}
						<DropdownMenuShortcut>
							<Copy className="h-4 w-4" strokeWidth={1.25} />
						</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
					Account
				</DropdownMenuLabel>
				<DropdownMenuItem asChild>
					<Link href="/settings" className="cursor-pointer">
						<Settings className="h-4 w-4" />
						Settings
					</Link>
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuLabel className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
					Actions
				</DropdownMenuLabel>
				<DropdownMenuItem
					variant="destructive"
					className="cursor-pointer"
					onClick={async () => {
						const signOutPromise = new Promise((resolve, reject) => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										resolve(true);
									},
									onError: (error) => {
										reject(error);
									},
								},
							});
						});

						toast.promise(signOutPromise, {
							loading: "Logging out...",
							success: () => {
								router.push("/");
								return "Logged out successfully";
							},
							error: (error) => {
								return error?.message || "Failed to log out";
							},
						});
					}}
				>
					<LogOut className="h-4 w-4" />
					Log Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
