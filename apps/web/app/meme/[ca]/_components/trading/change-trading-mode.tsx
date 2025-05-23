import { Button } from "@repo/ui/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@repo/ui/components/ui/drawer";
import { ChevronDown } from "lucide-react";

export default function ChangeTradingMode({
  selected,
  // setSelected,
}: {
  selected: string;
  // setSelected: any;
}) {
  const modes = ["instant", "market", "limit"];
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant={"ghost"} size={"sm"} className="items-center">
          <span className="capitalize text-sm font-medium">{selected}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="px-4 py-4 pb-24 flex flex-col gap-4 w-full">
          {modes.map((mode) => (
            <Button
              className="capitalize justify-start"
              variant={mode === selected ? "secondary" : "ghost"}
              size={"lg"}
            >
              {mode}
            </Button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
