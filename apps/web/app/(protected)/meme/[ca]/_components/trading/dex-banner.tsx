import { Button } from "@repo/ui/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

export function DexBanner({ bannerUrl }: { bannerUrl: string | null }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible className="mt-2" open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button className="w-fit" variant={"ghost"} size={"sm"}>
          <span className="text-sm">Dex banner</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-2 pt-2">
        {bannerUrl && (
          <Image
            src={bannerUrl}
            alt="Dex Banner"
            className="w-full max-h-30 object-contain"
            width={1200}
            height={80}
            layout="responsive"
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
