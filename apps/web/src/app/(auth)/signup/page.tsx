import { redirect } from "next/navigation";

export default function SignUpPage() {
	redirect("/?authView=signup");
}
