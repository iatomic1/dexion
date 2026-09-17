"use client";
import { Button } from "@dexion/ui/components/ui/button";
import { MonoLabel } from "@dexion/ui/components/ui/instrument";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@dexion/ui/components/ui/sheet";
import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OutlineButton, SolidButton } from "~/components/button";
import { formatPrice, formatTokenPrice } from "~/lib/helpers/numbers";
import { useAlertSheetStore } from "~/lib/store/alert-sheet-store";
import { TriggeredAlertPayload } from "~/types/socket";

function TokenAvatar({ name }: { name: string }) {
	return (
		<div className="h-7 w-7 text-[10px] text-dx-green border-dx-line-strong border flex items-center justify-center">
			{name.slice(0, 2)}
		</div>
	);
}

function AlertConditionLabel({ notif }: { notif: TriggeredAlertPayload }) {
	return (
		<MonoLabel className="text-[13px] uppercase text-dx-ink tracking-[.1em]">
			{`${notif.alert.metric} ${notif.alert.operator} ${
				notif.alert.metric !== "holders" && "$"
			}${notif.alert.value}`}
		</MonoLabel>
	);
}

function CurrentValue({ notif }: { notif: TriggeredAlertPayload }) {
	if (notif.alert.metric === "price")
		return <>{formatTokenPrice(notif.token.currentValue)}</>;
	if (notif.alert.metric === "holders") return <>{notif.token.currentValue}</>;
	return <>${formatPrice(notif.token.currentValue)}</>;
}

export function AlertHeader({
	as: Wrapper = "div",
	titleAs: TitleWrapper,
	className = "",
	toastId,
}: {
	as?: React.ElementType;
	titleAs?: React.ElementType;
	className?: string;
	toastId?: string | number;
}) {
	const label = (
		<MonoLabel className="tracking-[.14em] text-dx-green">
			Alert triggered
		</MonoLabel>
	);
	return (
		<Wrapper
			className={`px-3.5 py-3 flex items-center justify-between uppercase border-dx-line border-b ${className}`}
		>
			<div className="flex items-center gap-1">
				<span className="size-1.5 flex-none rounded-sm bg-dx-green" />
				{TitleWrapper ? (
					<TitleWrapper className="!p-0">{label}</TitleWrapper>
				) : (
					label
				)}
			</div>
			<div className="flex items-center gap-1">
				<MonoLabel className="tracking-[.14em]">NOW</MonoLabel>
				<Button
					size={"icon"}
					variant={"ghost"}
					onClick={() => {
						toast.dismiss(toastId);
					}}
				>
					<X />
				</Button>
			</div>
		</Wrapper>
	);
}

export function AlertBody({ notif }: { notif: TriggeredAlertPayload }) {
	return (
		<div className="px-3.5 py-3 flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1">
					<TokenAvatar name={notif.token.name} />
					<span className="uppercase font-semibold text-dx-ink text-[15px]">
						{notif.token.name}
					</span>
					<MonoLabel className="text-[9px] uppercase text-dx-faint">
						{notif.token.symbol}
					</MonoLabel>
				</div>
				<div className="text-[9px] p-1 text-dx-faint border-dx-line-strong border flex items-center justify-center">
					WEB APP
				</div>
			</div>

			<div className="py-1 border-dx-green border-l-2 pl-2">
				<AlertConditionLabel notif={notif} />
			</div>

			<div className="px-2 border-dx-line border grid grid-cols-2">
				<div className="flex flex-col border-dx-line border-r py-2">
					<MonoLabel className="uppercase">Current value</MonoLabel>
					<MonoLabel className="text-[15px] text-dx-green">
						<CurrentValue notif={notif} />
					</MonoLabel>
				</div>
				<div className="flex flex-col py-2 pl-2">
					<MonoLabel className="uppercase">Repeatable</MonoLabel>
					<MonoLabel className="text-[15px] text-dx-green uppercase">
						{notif.alert.repeatable ? "yes" : "no"}
					</MonoLabel>
				</div>
			</div>
		</div>
	);
}

export default function WebappAlertTriggered({
	notif,
	toastId,
}: {
	notif: TriggeredAlertPayload;
	toastId: string | number;
}) {
	const { openSheet, open } = useAlertSheetStore();

	useEffect(() => {
		console.log("open or now", open);
	}, [open]);
	return (
		<>
			<div className="bg-[#0E100F] border-l-dx-green border-b-dx-green border-2 border-t-dx-line border-r-dx-line-strong min-w-[380px] hidden md:block">
				<AlertHeader toastId={toastId} />
				<AlertBody notif={notif} />
				<div className="grid">
					<Link className="w-full grid" href={"/alerts"}>
						<SolidButton className="w-full">View alert</SolidButton>
					</Link>
				</div>
			</div>

			<div
				onClick={(e) => {
					e.preventDefault();
					toast.dismiss(toastId);
					console.log("getting here");
					openSheet(notif);
				}}
				className="md:hidden w-full py-2 border-l-dx-green border-2 flex items-center justify-between px-2"
			>
				<div className="flex items-center gap-2">
					<TokenAvatar name={notif.token.name} />
					<div className="flex flex-col">
						<MonoLabel className="tracking-[.14em] text-dx-green">
							Alert triggered
						</MonoLabel>
						<MonoLabel className="text-[13px] uppercase text-dx-ink tracking-[.1em]">
							{`${notif.token.name} ${notif.alert.operator} ${
								notif.alert.metric !== "holders" && "$"
							}${notif.alert.value}`}
						</MonoLabel>
					</div>
				</div>
				<ChevronDown />
			</div>
		</>
	);
}
