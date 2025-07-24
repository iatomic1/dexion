import { SiGoogle } from "@icons-pack/react-simple-icons";
import { Button } from "@repo/ui/components/ui/button";
import { toast } from "@repo/ui/components/ui/sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "~/lib/auth";
import { authClient } from "~/lib/auth-client";

export default function ContinueWithGoogle() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleSignInWithGoogle = async () => {
		try {
			await authClient.signIn.social(
				{
					provider: "google",
					requestSignUp: true,
				},
				{
					onRequest: (_ctx) => {
						setIsLoading(true);
					},
					onResponse(_context) {
						setIsLoading(false);
					},
					onSuccess: (ctx) => {
						router.push("/portfolio");
						toast.success("Authenticated");
					},
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
				},
			);
		} catch (err) {
			toast.error("An error occurred during authentication. Please try again.");
		}
	};
	return (
		<Button
			variant="outline"
			className="w-full bg-muted/50 py-5 text-sm rounded-full"
			disabled={isLoading}
			onClick={handleSignInWithGoogle}
		>
			<SiGoogle size={12} title="Google Icon" />
			Continue with Google
		</Button>
	);
}
