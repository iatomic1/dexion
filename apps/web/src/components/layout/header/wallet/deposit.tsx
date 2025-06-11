import { QrcodeCanvas } from "react-qrcode-pretty";
import Image from "next/image";
import { Copy } from "lucide-react";
import { toast } from "@repo/ui/components/ui/sonner";
import useCopyToClipboard from "~/hooks/useCopy";

export default function Deposit({
  stxBalance,
  stxAddress,
}: {
  stxAddress: string;
  stxBalance: string;
}) {
  const copy = useCopyToClipboard();
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-sm py-2 opacity-100 flex items-center gap-3 px-4 w-full border rounded-lg">
          <Image
            src={"/icons/stx.svg"}
            height={16}
            width={16}
            alt="Stx logo"
            className="object-cover"
          />
          <span> Stacks</span>
        </div>

        <div className="text-xs py-2 opacity-100 flex items-center gap-3 px-4 w-full border rounded-lg justify-between">
          <span className="text-secondary-foreground">Balance:</span>
          <span className="text-muted-foreground">{stxBalance} STX</span>
        </div>
      </div>
      <div
        className="flex relative gap-1 border rounded-xl p-1 hover:bg-popover transition-colors duration-150"
        onClick={() => {
          copy(stxAddress as string);
          toast.copy("STX address copied to clipboard");
        }}
      >
        <QrcodeCanvas
          value={stxAddress}
          variant={{
            eyes: "circle",
            body: "fluid",
          }}
          color={{
            eyes: "#000000",
            body: "#000000",
          }}
          colorEffect={{
            eyes: "none",
            body: "none",
          }}
          padding={5}
          // margin={5}
          bgColor="#ffffff"
          bgRounded
          image={"/icons/stx.svg"}
          size={137}
          divider
        />
        <button className="bottom-3 right-3 absolute">
          <Copy size={16} />
        </button>
        <div className="flex flex-col gap-2 text-xs py-4 px-4 select-none">
          <span className="text-muted-foreground opacity-90">
            Deposit Address
          </span>
          <span className="text-muted-foreground text-wrap break-all">
            {stxAddress}
          </span>
        </div>
      </div>
    </div>
  );
}
