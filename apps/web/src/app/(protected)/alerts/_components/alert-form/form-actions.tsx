"use client";

import { Button } from "@dexion/ui/components/ui/button";
import { DialogFooter } from "@dexion/ui/components/ui/dialog";
import { Spinner } from "@dexion/ui/components/ui/spinner";

interface FormActionsProps {
	isLoading: boolean;
	isEditing: boolean;
	onCancel?: () => void;
}

export function FormActions({
	isLoading,
	isEditing,
	onCancel,
}: FormActionsProps) {
	return (
		<DialogFooter className="flex-row flex gap-2">
			<Button
				type="button"
				variant="outline"
				onClick={() => {
					onCancel && onCancel();
				}}
				className="w-full flex-1 sm:w-auto"
			>
				Cancel
			</Button>
			<Button
				type="submit"
				disabled={isLoading}
				className="w-full flex-1 sm:w-auto"
			>
				{isLoading && <Spinner />}
				{isEditing ? "Update Alert" : "Create Alert"}
			</Button>
		</DialogFooter>
	);
}
