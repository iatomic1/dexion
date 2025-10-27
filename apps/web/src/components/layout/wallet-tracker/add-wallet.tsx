import { zodResolver } from "@hookform/resolvers/zod";
import { HTTP_STATUS } from "@repo/shared-constants/constants.ts";
import { Button } from "@repo/ui/components/ui/button";
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "@repo/ui/components/ui/emoji-picker";
import { Field, FieldError, FieldGroup } from "@repo/ui/components/ui/field";
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
import { toast } from "@repo/ui/components/ui/sonner";
import { validateStacksAddress } from "@stacks/transactions";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useServerAction } from "zsa-react";
import { revalidateTagServer } from "~/app/actions/revalidate";
import { trackWalletAction } from "~/app/actions/wallet-tracker-actions";
import { AppDialog } from "~/components/app-dialog";

export default function AddWalletModal({ children }: { children: ReactNode }) {
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
			address: "",
			name: "",
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
					// setTimeout(() => {
					form.reset();
					setSelectedEmoji("🤣");
					setIsDialogOpen(false);
					// }, 500);
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
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-0"
				id="add-wallet"
			>
				<FieldGroup className="grid gap-4 mb-28">
					<Controller
						control={form.control}
						name="address"
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid}>
								<Input
									{...field}
									id="address"
									aria-invalid={fieldState.invalid}
									placeholder="Wallet Address"
									className="placeholder:text-xs"
								/>
								{fieldState.invalid && (
									<FieldError className="text-xs" errors={[fieldState.error]} />
								)}
							</Field>
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
						<Controller
							control={form.control}
							name="name"
							render={({ field, fieldState }) => (
								<Field className="flex-1" data-invalid={fieldState.invalid}>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										id="nickname"
										placeholder="Wallet Name"
										className="placeholder:text-xs"
									/>
									{fieldState.invalid && (
										<FieldError
											className="text-xs"
											errors={[fieldState.error]}
										/>
									)}
								</Field>
							)}
						/>
					</div>
				</FieldGroup>
			</form>
		</>
	);

	return (
		<AppDialog
			dialogTitle="Add Wallet"
			dialogMain={dialogBody}
			contentClassName="!max-w-[290px] rounded-sm"
			dialogFooter={
				<Button
					type="submit"
					className="w-full rounded-full"
					disabled={isPending}
					onClick={form.handleSubmit(onSubmit)}
				>
					{isPending ? "Adding..." : "Add Wallet"}
				</Button>
			}
		>
			{children}
		</AppDialog>
	);
}
