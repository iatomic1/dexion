import { create } from "zustand";
import { TriggeredAlertPayload } from "~/types/socket";

type AlertSheetStore = {
	open: boolean;
	notif: TriggeredAlertPayload | null;
	openSheet: (notif: TriggeredAlertPayload) => void;
	closeSheet: () => void;
};
export const useAlertSheetStore = create<AlertSheetStore>((set) => ({
	open: false,
	notif: null,
	openSheet: (notif) => set({ open: true, notif }),
	closeSheet: () => set({ open: false }),
}));
