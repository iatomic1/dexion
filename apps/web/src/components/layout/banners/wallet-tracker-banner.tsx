"use client";
import {
	Banner,
	BannerAction,
	BannerClose,
	BannerIcon,
	BannerTitle,
} from "@dexion/ui/components/ui/banner";
import { CircleAlert } from "lucide-react";
import { usePathname } from "next/navigation";
export default function WalletTrackerBanner() {
	const pathname = usePathname();
	console.log(pathname);
	if (pathname !== "/trackers") {
		return <></>;
	}

	return (
		<>
			<Banner className="bg-chart-4 block sm:hidden">
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-1 sm:gap-0 sm:flex-row">
						<div className="flex items-center gap-1">
							<BannerIcon icon={CircleAlert} className="w-fit" />
							<BannerTitle>This feature is still in dev</BannerTitle>
						</div>
						<span className="text-sm">
							Some features may not work as expected
						</span>
					</div>
					<BannerClose />
				</div>
			</Banner>
			<Banner className="bg-chart-4 sm:flex hidden">
				<BannerIcon icon={CircleAlert} className="w-fit" />
				<BannerTitle>This feature is still in dev</BannerTitle>
				<span className="text-sm">Some features may not work as expected</span>
				<BannerClose />
			</Banner>
		</>
	);
}
