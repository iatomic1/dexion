import { zodResolver } from "@hookform/resolvers/zod";
import { HTTP_STATUS } from "@repo/shared-constants/constants.ts";
import { Button } from "@repo/ui/components/ui/button";
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "@repo/ui/components/ui/emoji-picker";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { Separator } from "@repo/ui/components/ui/separator";
import { toast } from "@repo/ui/components/ui/sonner";
import { validateStacksAddress } from "@stacks/transactions";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useServerAction } from "zsa-react";
import { revalidateTagServer } from "~/app/actions/revalidate";
import { trackWalletAction } from "~/app/actions/wallet-tracker-actions";
import { AppDialog } from "~/components/app-dialog";

export default function AddWalletModal() {
	const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
	const [selectedEmoji, setSelectedEmoji] = useState("🤣");
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { isPending, execute } = useServerAction(trackWalletAction, {
		onSuccess: async ({ data: res }) => res,
	});

	const formSchema = z.object({
		address: z
			.string()
			.min(1, "Wallet address is required")
			.refine(
				(address) => {
					try {
						return validateStacksAddress(address);
					} catch {
						return false;
					}
				},
				{ message: "Invalid Stacks address" },
			),
		name: z.string().min(1, "Wallet name is required"),
	});

	const form = useForm({
		resolver: zodResolver(formSchema),
		defaultValues: {
			address: "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1",
			name: "Atomic",
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		try {
			const trackWalletPromise = execute({
				walletAddress: values.address,
				nickname: values.name,
				emoji: selectedEmoji,
			}).then((response) => {
				if (!response?.[0]) throw new Error("No response received");
				const result = response[0];

				if (result.status === HTTP_STATUS.CREATED) return result;
				throw {
					status: result.status,
					message: result.message || "Failed to track wallet",
				};
			});

			toast.promise(trackWalletPromise, {
				richColors: true,
				loading: "Tracking Wallet...",
				success: () => {
					setTimeout(() => {
						form.reset();
						setSelectedEmoji("🤣");
						setIsDialogOpen(false);
					}, 500);
					revalidateTagServer("wallets");
					return "Wallet tracked successfully";
				},
				error: (err) => {
					if (err.status === HTTP_STATUS.CONFLICT) {
						return "This wallet is already being tracked";
					}
					if (err.status === HTTP_STATUS.UNAUTHORIZED) {
						return "Unauthorized request";
					}
					return err.message || "Failed to track wallet";
				},
			});
		} catch (err) {
			console.error(err);
		}
	};

	const dialogBody = (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
					<div className="grid gap-4 mb-20">
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="Wallet Address"
											className="placeholder:text-xs"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
						<div className="flex gap-3">
							<Popover
								onOpenChange={setIsEmojiPickerOpen}
								open={isEmojiPickerOpen}
							>
								<PopoverTrigger asChild>
									<Button size="icon" variant="secondary">
										{selectedEmoji}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80 p-0">
									<EmojiPicker
										className="h-[342px]"
										onEmojiSelect={({ emoji }) => {
											setIsEmojiPickerOpen(false);
											setSelectedEmoji(emoji);
										}}
									>
										<EmojiPickerSearch />
										<EmojiPickerContent />
										<EmojiPickerFooter />
									</EmojiPicker>
								</PopoverContent>
							</Popover>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormControl>
											<Input
												placeholder="Wallet Name"
												className="placeholder:text-xs"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</form>
			</Form>
		</>
	);

	return (
		<AppDialog
			dialogTitle="Add Wallet"
			dialogMain={dialogBody}
			dialogFooter={
				<Button
					type="submit"
					className="w-full"
					disabled={isPending}
					onClick={form.handleSubmit(onSubmit)}
				>
					{isPending ? "Adding..." : "Add Wallet"}
				</Button>
			}
		>
			<Button onClick={() => setIsDialogOpen(true)}>Add Wallet</Button>
		</AppDialog>
	);
}
