"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { EXPLORER_BASE_URL } from "@repo/shared-constants/constants.ts";
import { SignerError, SigningError } from "@repo/signer";
import { Button } from "@repo/ui/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@repo/ui/components/ui/field";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { toast } from "@repo/ui/components/ui/sonner";
import { Spinner } from "@repo/ui/components/ui/spinner";
import { ValidationError } from "@stacks/common";
import { validateStacksAddress } from "@stacks/transactions";
import { getNameInfo } from "bns-v2-sdk";
import { ArrowDown, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useServerAction } from "zsa-react";
import { AppDialog } from "~/components/app-dialog";
import { useTokenTransfer } from "~/hooks/useTokenTransfer";
import openInNewPage from "~/lib/helpers/openInNewPage";
import { truncateString } from "~/lib/helpers/strings";
import { transferStx } from "~/lib/signer/actions";
import type { CryptoAsset } from "~/types/xverse";

const withdrawSchema = z.object({
	amount: z
		.number()
		.positive("Amount must be positive")
		.max(1000000, "Amount too large"),
	address: z
		.string()
		.min(1, "Address is required")
		.refine(
			(address) => {
				// Basic validation for Stacks addresses (starts with SP or SM) or BNS names
				return (
					address.startsWith("SP") ||
					address.startsWith("SM") ||
					address.includes(".btc") ||
					address.includes(".stx")
				);
			},
			{
				message: "Please enter a valid Stacks address or BNS name",
			},
		),
});

type WithdrawFormData = z.infer<typeof withdrawSchema>;

interface WithdrawProps {
	children: ReactNode;
	stxBalance: number;
	stxPrice: CryptoAsset;
	onWithdraw?: (data: WithdrawFormData) => void;
}

export default function Withdraw({
	children,
	stxBalance,
	stxPrice,
	onWithdraw,
}: WithdrawProps) {
	const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
	const [isValidatingAddress, setIsValidatingAddress] = useState(false);
	const [addressError, setAddressError] = useState<string | null>(null);
	// const { handleTokenTransfer, isPending } = useTokenTransfer();

	const { isPending, execute, data, error, isError } =
		useServerAction(transferStx);

	const handleTokenTransfer = async (amount: number, recipient: string) => {
		const transferPromise = execute({
			amount,
			recipient,
		});

		return toast.promise(transferPromise, {
			loading: "Signing and broadcasting transaction...",
			success: (result) => {
				const txRes = result[0];
				console.log(txRes);
				if (txRes?.success) {
					return `Transaction successful! TX ID: ${txRes.txid?.slice(0, 8)}...`;
				}
			},
			error: (error) => {
				console.error("Transaction failed:", error);

				if (error instanceof ValidationError) {
					return `Invalid input: ${error.message}`;
				}
				if (error instanceof SigningError) {
					return `Signing failed: ${error.message}`;
				}
				if (error instanceof SignerError) {
					switch (error.code) {
						case "SIGNER_INIT_ERROR":
							return "Failed to initialize signer. Please check your wallet connection.";
						case "BROADCAST_ERROR":
							return "Failed to broadcast transaction. Please try again.";
						case "TURNKEY_ERROR":
							return "Wallet provider error. Please check your connection.";
						default:
							return `Transaction failed: ${error.message}`;
					}
				}
				return `Transaction failed: ${error instanceof Error ? error.message : String(error)}`;
			},
		});
	};
	const form = useForm<WithdrawFormData>({
		resolver: zodResolver(withdrawSchema),
		defaultValues: {
			amount: 0.0001,
			address: "",
		},
	});

	const watchedAmount = form.watch("amount");
	const watchedAddress = form.watch("address");
	const usdValue = watchedAmount * (stxPrice?.current_price || 0);

	// Validate address whenever it changes
	useEffect(() => {
		const validateAddress = async () => {
			if (!watchedAddress.trim()) {
				setResolvedAddress(null);
				setAddressError(null);
				return;
			}

			setIsValidatingAddress(true);
			setAddressError(null);

			try {
				// First, check if it's a valid Stacks address
				const isValidAddress = validateStacksAddress(watchedAddress);

				if (isValidAddress) {
					setResolvedAddress(watchedAddress);
					setIsValidatingAddress(false);
					return;
				}

				// If not a valid address, try to resolve as BNS
				if (
					watchedAddress.includes(".btc") ||
					watchedAddress.includes(".stx")
				) {
					try {
						const nameInfo = await getNameInfo({
							fullyQualifiedName: watchedAddress,
							network: "mainnet",
						});

						if (nameInfo && nameInfo.owner) {
							setResolvedAddress(nameInfo.owner);
						} else {
							setAddressError("BNS name could not be resolved");
							setResolvedAddress(null);
						}
					} catch (error) {
						setAddressError("Invalid BNS name");
						setResolvedAddress(null);
					}
				} else {
					setAddressError("Please enter a valid Stacks address or BNS name");
					setResolvedAddress(null);
				}
			} catch (error) {
				setAddressError("Invalid address format");
				setResolvedAddress(null);
			}

			setIsValidatingAddress(false);
		};

		const debounceTimer = setTimeout(validateAddress, 500);
		return () => clearTimeout(debounceTimer);
	}, [watchedAddress]);

	const handleMaxClick = () => {
		form.setValue("amount", stxBalance);
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// const value = Number.parseFloat(e.target.value) || 0;
		// Cap the amount at stxBalance
		// const cappedValue = Math.min(value, stxBalance);
		form.setValue("amount", Number(e.target.value));
	};

	const handleSubmit = async (data: WithdrawFormData) => {
		if (resolvedAddress && !addressError) {
			handleTokenTransfer(data.amount, resolvedAddress);
			// console.log(resolvedAddress, data);
			// onWithdraw?.({
			//   ...data,
			//   address: resolvedAddress, // Use resolved address for submission
			// });
		}
	};

	const isFormValid =
		form.formState.isValid &&
		watchedAmount > 0 &&
		resolvedAddress &&
		!addressError;

	return (
		<AppDialog
			dialogMain={
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					id="withdraw-form"
					className="flex flex-col gap-3 pb-4"
				>
					<FieldGroup>
						<div className="grid grid-cols-2 gap-3">
							<div className="text-sm py-2 opacity-100 flex items-center gap-3 px-4 w-full border rounded-lg">
								<Image
									src={"/icons/stx.svg"}
									height={16}
									width={16}
									alt="Stx logo"
									className="object-cover"
								/>
								<span>Stacks</span>
							</div>
							<div className="text-xs py-2 opacity-100 flex items-center gap-3 px-4 w-full border rounded-lg justify-between">
								<span className="text-secondary-foreground">Balance:</span>
								<span className="text-muted-foreground">
									{stxBalance.toFixed(2)} STX
								</span>
							</div>
						</div>

						<Controller
							control={form.control}
							name="amount"
							render={({ field, fieldState }) => (
								<Field
									className="flex flex-col gap-2 border p-2 rounded-md"
									data-invalid={fieldState.invalid}
								>
									<div className="flex items-center justify-between">
										<FieldLabel className="text-sm text-muted-foreground">
											Withdraw Amount
										</FieldLabel>
										<button
											type="button"
											onClick={handleMaxClick}
											className="text-primary text-sm hover:underline"
										>
											Max
										</button>
									</div>
									<div className="flex justify-between items-center pr-2">
										<Input
											type="number"
											{...field}
											// step="0.000001"
											min="0"
											// max={stxBalance}
											className="border-none p-0 text-lg font-medium !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
											placeholder="0.0"
											onChange={handleAmountChange}
											aria-invalid={fieldState.invalid}
											autoComplete="off"
											id="amount"
											value={field.value || ""}
										/>
										<div className="flex gap-1 items-end">
											<Image
												src={"/icons/stx.svg"}
												height={24}
												width={24}
												alt="Stx logo"
												className="object-cover"
											/>
											<span className="font-medium">STX</span>
										</div>
									</div>
									<div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
										{!stxPrice ? (
											<Skeleton className="h-2 w-3" />
										) : (
											<span>≈ ${usdValue.toFixed(2)}</span>
										)}
										<span>gas fee</span>
									</div>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>

						<div className="self-center my-3 flex items-center justify-center">
							<ArrowDown className="h-7 w-7 text-muted-foreground" />
						</div>

						<Controller
							control={form.control}
							name="address"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<div className="relative">
										<Input
											{...field}
											className="peer ps-16 placeholder:text-xs text-secondary-foreground text-xs"
											placeholder="Address of destination wallet or bns"
											aria-invalid={fieldState.invalid}
											id="address"
										/>
										<span className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-xs peer-disabled:opacity-50">
											Address:
										</span>
									</div>

									{/* Address validation feedback */}
									{isValidatingAddress && (
										<div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
											<div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Validating address...
										</div>
									)}

									{addressError && (
										<div className="text-xs text-destructive mt-1">
											{addressError}
										</div>
									)}

									{resolvedAddress && resolvedAddress !== watchedAddress && (
										<div className="text-xs text-muted-foreground mt-1 flex items-center">
											<span className="font-medium">Resolved to:</span>{" "}
											{truncateString(resolvedAddress, 10, 5)}
											<button
												type="button"
												onClick={() => {
													openInNewPage(
														`${EXPLORER_BASE_URL}address/${resolvedAddress}`,
													);
												}}
											>
												<ExternalLink className="h-3 text-primary" />
											</button>
										</div>
									)}

									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}

									<FieldDescription className="text-xs">
										Enter a Stacks address (SP...) or BNS name (.btc, .stx)
									</FieldDescription>
								</Field>
							)}
						/>
					</FieldGroup>
				</form>
			}
			dialogTitle={"Withdraw"}
			contentClassName="max-sm:min-w-[451px] max-sm:top-3 max-sm:translate-y-0 "
			dialogFooter={
				<Button
					onClick={form.handleSubmit(handleSubmit)}
					disabled={!isFormValid || isPending}
					className="w-full rounded-full gap-2"
				>
					{isPending && <Spinner />}
					{watchedAmount > 0
						? `Withdraw ${watchedAmount.toFixed(6)} STX`
						: "Withdraw All STX"}
				</Button>
			}
		>
			{children}
		</AppDialog>
	);
}
