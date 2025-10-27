"use client";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";

export default function AuthController() {
	return (
		<div className="flex gap-4">
			<Button asChild>
				<Link href="/signup">Sign Up</Link>
			</Button>
			<Button variant="outline" asChild>
				<Link href="/login">Login</Link>
			</Button>
		</div>
	);
}
