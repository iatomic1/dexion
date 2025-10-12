"use client";

import { Button } from "@repo/ui/components/ui/button";
import { toast } from "@repo/ui/components/ui/sonner";
import { useEffect } from "react";

export default function GamePage() {
	return (
		<div>
			<Button
				onClick={() => {
					toast.info("kampai");
				}}
			>
				Kampai
			</Button>
			<iframe
				src="/game/index.html"
				sandbox="allow-scripts allow-same-origin"
				className="w-full h-screen border-0"
				title="Game"
			/>
		</div>
	);
}
