"use client";
import { useIsMobile } from "@dexion/ui/hooks/use-is-mobile";
import { toast as sonnerToast } from "sonner";
import WebappAlertTriggered from "~/app/(protected)/alerts/_components/alert-triggered-toaster";
import { useOnWebappAlertTriggered } from "~/hooks/useOnWebappAlertTriggered";
import { TriggeredAlertPayload } from "~/types/socket";

export function AlertsNotificationFeed() {
	const isMobile = useIsMobile();
	useOnWebappAlertTriggered((notif: TriggeredAlertPayload) => {
		console.log("Received webapp alert", notif);
		sonnerToast.custom(
			(toastId) => <WebappAlertTriggered notif={notif} toastId={toastId} />,
			{
				id: `alert-${notif.token.symbol}-${Date.now()}`,
				position: isMobile ? "top-center" : "bottom-right",
				duration: 5000,
				toasterId: "alerts",
			},
		);
	});
	return <></>;
}
