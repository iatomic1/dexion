"use client";
import { Button } from "@dexion/ui/components/ui/button";
import Link from "next/link";

export default function AuthController() {
	return (
		<div className="flex gap-4">
			<Button asChild size="lg">
				<Link href="/signup">Sign Up</Link>
			</Button>
			<Button variant="outline" size="lg" asChild>
				<Link href="/login">Login</Link>
			</Button>
		</div>
	);
}
