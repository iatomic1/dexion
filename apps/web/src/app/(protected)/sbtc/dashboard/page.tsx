import { withAuth } from "~/lib/auth/with-auth";
import type { Session } from "~/types/auth";
import DashboardContent from "./_components/dashboard-content";

async function DashboardPage(props: { session: Session }) {
	const session = props.session;
	return (
		<>
			<DashboardContent session={session} />
		</>
	);
}

export default withAuth(DashboardPage);
