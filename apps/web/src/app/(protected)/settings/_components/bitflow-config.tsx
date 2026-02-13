"use client";

import { Button } from "@dexion/ui/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@dexion/ui/components/ui/dialog";
import { Input } from "@dexion/ui/components/ui/input";
import { Label } from "@dexion/ui/components/ui/label";
import { AlertCircle, Copy } from "lucide-react";
import { useState } from "react";

interface BitflowConfig {
	linked: boolean;
	stacksAddress?: string;
	linkedAt?: Date;
}

export function BitflowConfigSection({
	initialConfig,
}: {
	initialConfig: BitflowConfig;
}) {
	const [config, setConfig] = useState(initialConfig);
	const [showLinkInput, setShowLinkInput] = useState(false);
	const [stacksAddress, setStacksAddress] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [copiedText, setCopiedText] = useState("");
	const [validationError, setValidationError] = useState("");
	const [memoExpiry] = useState(new Date(Date.now() + 5 * 60 * 1000));
	const [showPositions, setShowPositions] = useState(false); // Add showPositions state

	const mockDepositAddress = "SP3K6PDTQ7Z3P3ZZX8N3V9Q7K2J8P3K6PDTQ7Z3P3";
	const mockMemo = `transfer-${Math.random().toString(36).substring(7).toUpperCase()}`;

	const handleLinkClick = () => {
		setShowLinkInput(true);
	};

	const validateStacksAddress = (address: string): boolean => {
		if (!address.trim()) {
			setValidationError("Stacks address is required");
			return false;
		}
		setValidationError("");
		return true;
	};

	const handleValidateAndLink = () => {
		if (validateStacksAddress(stacksAddress)) {
			setShowModal(true);
		}
	};

	const handleConfirmLink = () => {
		setConfig({
			linked: true,
			stacksAddress,
			linkedAt: new Date(),
		});
		setShowModal(false);
		setStacksAddress("");
		setShowLinkInput(false);
		setShowPositions(true); // Show positions after successful link
	};

	const copy = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedText(text);
		setTimeout(() => setCopiedText(""), 2000);
	};

	const formatExpiry = (date: Date) => {
		const minutes = Math.ceil((date.getTime() - Date.now()) / 60000);
		return `${minutes} minutes`;
	};

	return (
		<>
			{!config.linked ? (
				<div className="p-6">
					{!showLinkInput ? (
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<h3 className="text-base font-medium mb-1">
									Link Bitflow Account
								</h3>
								<p className="text-sm text-muted-foreground">
									Connect your Stacks address to receive price alerts on Bitflow
								</p>
							</div>
							<Button
								variant="secondary"
								size="sm"
								onClick={handleLinkClick}
								className="ml-6"
							>
								Link Account
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							<div>
								<Label
									htmlFor="stacks-address"
									className="text-sm font-medium mb-2 block"
								>
									Stacks Address
								</Label>
								<Input
									id="stacks-address"
									placeholder="SP... or SM..."
									value={stacksAddress}
									onChange={(e) => {
										setStacksAddress(e.target.value);
										setValidationError("");
									}}
									className="bg-muted border-border"
								/>
								{validationError && (
									<p className="text-xs text-red-500 mt-2">{validationError}</p>
								)}
								<p className="text-xs text-muted-foreground mt-2">
									Enter your Stacks wallet address (starts with SP or SM)
								</p>
							</div>
							<div className="flex gap-2">
								<Button
									size="sm"
									onClick={handleValidateAndLink}
									variant="default"
								>
									Validate & Link
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setShowLinkInput(false);
										setStacksAddress("");
										setValidationError("");
									}}
								>
									Cancel
								</Button>
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<div className="flex items-center gap-2 mb-2">
								<h3 className="text-base font-medium">Bitflow Connected</h3>
								<div className="w-2 h-2 rounded-full bg-green-500" />
							</div>
							<p className="text-sm text-muted-foreground mb-2">
								Address: {config.stacksAddress}
							</p>
							<p className="text-xs text-muted-foreground">
								Linked {formatRelativeTime(config.linkedAt || new Date())}
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setConfig({
									linked: false,
									stacksAddress: undefined,
									linkedAt: undefined,
								});
								setShowPositions(false); // Hide positions when unlinking
							}}
						>
							Unlink
						</Button>
					</div>
				</div>
			)}

			{/* Transfer Instructions Modal */}
			<Dialog open={showModal} onOpenChange={setShowModal}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Complete Your Bitflow Verification</DialogTitle>
						<DialogDescription>
							Transfer 0.001 STX to verify your account. This is a one-time
							setup.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="bg-muted rounded-lg p-4 space-y-3">
							<div>
								<p className="text-xs font-medium text-muted-foreground mb-1 uppercase">
									Deposit To
								</p>
								<div className="flex items-center gap-2">
									<code className="text-xs font-mono break-all flex-1">
										{mockDepositAddress}
									</code>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 flex-shrink-0"
										onClick={() => copy(mockDepositAddress)}
									>
										<Copy className="h-3 w-3" />
									</Button>
									{copiedText === mockDepositAddress && (
										<span className="text-xs text-green-500">Copied!</span>
									)}
								</div>
							</div>

							<div>
								<p className="text-xs font-medium text-muted-foreground mb-1 uppercase">
									Memo (required)
								</p>
								<div className="flex items-center gap-2">
									<code className="text-xs font-mono flex-1">{mockMemo}</code>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 flex-shrink-0"
										onClick={() => copy(mockMemo)}
									>
										<Copy className="h-3 w-3" />
									</Button>
									{copiedText === mockMemo && (
										<span className="text-xs text-green-500">Copied!</span>
									)}
								</div>
							</div>

							<div>
								<p className="text-xs font-medium text-muted-foreground mb-1 uppercase">
									Amount
								</p>
								<p className="text-sm font-mono">0.001 STX</p>
							</div>
						</div>

						<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex gap-2">
							<AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
							<div className="text-xs text-red-700">
								<p className="font-medium mb-1">
									Memo expires in {formatExpiry(memoExpiry)}
								</p>
								<p>
									After expiration, you'll need to generate a new memo to
									continue.
								</p>
							</div>
						</div>

						<div className="flex gap-2">
							<Button onClick={handleConfirmLink} className="flex-1">
								Done
							</Button>
							<Button
								variant="outline"
								onClick={() => setShowModal(false)}
								className="flex-1"
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/*{showPositions && config.linked && config.stacksAddress && (
        <BitflowPositions
          stacksAddress={config.stacksAddress}
          onCreateAlerts={(positions) => {
            console.log("[v0] Creating alerts for positions:", positions)
            setShowPositions(false)
          }}
        />
      )}*/}
		</>
	);
}

function formatRelativeTime(date: Date) {
	const diff = Date.now() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(minutes / 60);

	if (minutes < 60) return `${minutes} minutes ago`;
	if (hours < 24) return `${hours} hours ago`;
	return `${Math.floor(hours / 24)} days ago`;
}
