"use client";

import { cn } from "@repo/ui/lib/utils";
import { ChevronDown, Crosshair, User } from "lucide-react";

export default function TokenInfo() {
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm">Token Info</span>
        <ChevronDown className="h-4 w-4" />
      </div>

      {/* <div className="grid grid-cols-3 gap-4 text-center text-xs"> */}
      {/*   <div> */}
      {/*     <div className="text-muted-foreground">Supply M/H</div> */}
      {/*     <div className="font-medium text-green-500">0.35%</div> */}
      {/*   </div> */}
      {/*   <div> */}
      {/*     <div className="text-muted-foreground">Own %</div> */}
      {/*     <div className="font-medium">0.0%</div> */}
      {/*   </div> */}
      {/*   <div> */}
      {/*     <div className="text-muted-foreground">Slippage H</div> */}
      {/*     <div className="font-medium text-green-500">0.0%</div> */}
      {/*   </div> */}
      {/* </div> */}

      {/* <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs"> */}
      {/*   <div> */}
      {/*     <div className="text-muted-foreground">Holders</div> */}
      {/*     <div className="font-medium">0.0%</div> */}
      {/*   </div> */}
      {/*   <div> */}
      {/*     <div className="text-muted-foreground">Bubblers</div> */}
      {/*     <div className="font-medium">0.0%</div> */}
      {/*   </div> */}
      {/*   <div> */}
      {/*     <div className="text-muted-foreground">LP Burned</div> */}
      {/*     <div className="font-medium text-green-500">0.100%</div> */}
      {/*   </div> */}
      {/* </div> */}

      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-xs">
        <InfoItem icon={<User />} value="13" label="Holders" />
        <InfoItem icon={<Crosshair />} value="2.21 %" label="Snipers H." />
        <InfoItem icon={<UserIcon isRed />} value="Unrugged" label="Dev Paid" />
      </div>
    </div>
  );
}
interface InfoItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  isRed?: boolean;
}

function InfoItem({ icon, value, label, isRed = false }: InfoItemProps) {
  return (
    <div className="p-4 border-muted border-[1px] rounded-md items-center justify-center gap-2">
      <div className={cn("flex items-center justify-center gap-1")}>
        {icon}
        <span className="text-sm leading-[16px] text-red-700 font-normal">
          {value}
        </span>
      </div>
      <span></span>
    </div>
  );
}
interface UserIconProps {
  isRed?: boolean;
}

function UserIcon({ isRed = false }: UserIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
