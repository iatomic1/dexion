import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
	nav: {
		title: (
			<>
				<Image
					src="/logo.png"
					alt="Company Logo"
					width={24}
					height={24}
					// className="h-auto w-auto"
					priority
				/>
				Dexion
			</>
		),
	},
	// see https://fumadocs.dev/docs/ui/navigation/links
	links: [],
};
