"use client";
import { HTTP_STATUS } from "@dexion/shared";
import { Button } from "@dexion/ui/components/ui/button";
import {
	EmojiPicker,
	EmojiPickerContent,
	EmojiPickerFooter,
	EmojiPickerSearch,
} from "@dexion/ui/components/ui/emoji-picker";
import { Field, FieldError, FieldGroup } from "@dexion/ui/components/ui/field";
import { Input } from "@dexion/ui/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@dexion/ui/components/ui/popover";
import { toast } from "@dexion/ui/components/ui/sonner";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { validateStacksAddress } from "@stacks/transactions";
import { useAction } from "next-safe-action/hooks";
import { type ReactNode, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { revalidateTagServer } from "~/app/actions/revalidate";
import { trackWalletAction } from "~/app/actions/wallet-tracker-actions";
import { AppDialog } from "~/components/app-dialog";

// Define the schema outside the component
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
	name: z.string().min(1, { message: "Wallet name is required" }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function AddWalletModal({ children }: { children: ReactNode }) {
	const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
	const [selectedEmoji, setSelectedEmoji] = useState("🤣");
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { execute, status } = useAction(trackWalletAction, {
		onSuccess: (data) => {
			if (data.data?.status === HTTP_STATUS.CREATED) {
				toast.success("Wallet tracked successfully");
				form.reset();
				setSelectedEmoji("🤣");
				setIsDialogOpen(false);
				revalidateTagServer("wallets");
			} else {
				toast.error(data.data?.message || "Failed to track wallet");
			}
		},
		onError: ({ error: { serverError } }) => {
			if (serverError) {
				toast.error(serverError.errorMessage);
			} else {
				toast.error("Failed to track wallet");
			}
		},
	});

	const isPending = status === "executing";

	const form = useForm<FormSchema>({
		resolver: standardSchemaResolver(formSchema),
		defaultValues: {
			address: "",
			name: "",
		},
	});

	const onSubmit = (values: FormSchema) => {
		execute({
			walletAddress: values.address,
			nickname: values.name,
			emoji: selectedEmoji,
		});
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
