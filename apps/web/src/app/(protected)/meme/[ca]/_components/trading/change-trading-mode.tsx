import { Button } from "@repo/ui/components/ui/button";
import { Drawer, DrawerContent } from "@repo/ui/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

export default function ChangeTradingMode({
	selected,
	children,
	// setSelected,
}: {
	selected: string;
	children: React.ReactNode;
	// setSelected: any;
}) {
	const modes = ["market", "instant", "limit"];
	const tabsTriggerClass = `hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary
data-[state=active]:hover:bg-accent relative after:absolute
after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5
data-[state=active]:bg-transparent data-[state=active]:shadow-none !bg-transparent !border-none cursor-pointer`;
	return (
		<>
			<Tabs className="hidden sm:flex" defaultValue="market">
				<TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 w-full">
					{modes.map((mode) => (
						<TabsTrigger
							asChild
							value={mode}
							className={tabsTriggerClass}
							key={mode}
						>
							<span className="capitalize text-sm font-medium">{mode}</span>
						</TabsTrigger>
					))}
				</TabsList>
				{children}
			</Tabs>
			<Drawer>
				<DrawerContent>
					<div className="">
						{modes.map((mode) => (
							<Button
								className="capitalize justify-start"
								variant={mode === selected ? "secondary" : "ghost"}
								size={"lg"}
								key={mode}
							>
								{mode}
							</Button>
						))}
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}
