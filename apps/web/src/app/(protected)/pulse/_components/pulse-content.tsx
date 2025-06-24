"use client";
import type { TokenMetadata } from "@repo/token-watcher/token.ts";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import Image from "next/image";
import { memo, useMemo } from "react";
import { truncateString } from "~/lib/helpers/strings";
import { getPulse } from "~/lib/queries/token-watcher";
import { Socials } from "../../meme/[ca]/_components/socials";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";

const TABS = ["new pairs", "final stretch", "migrated"] as const;

export default function PulseContent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pulseData"],
    queryFn: getPulse,
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 1,
  });

  const newPairs = useMemo(() => data?.new || [], [data]);
  const trending = useMemo(() => data?.trending || [], [data]);
  const completed = useMemo(() => data?.completed || [], [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row px-4 pt-16 gap-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (isError) {
    return <div className="px-4 pt-16 text-red-500">Failed to load data</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row px-4 pt-16 gap-3 ">
      <Tabs defaultValue="new pairs" className=" w-full">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger value={tab} className="capitalize" key={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="new pairs" className="w-full">
          <Section data={newPairs} />
        </TabsContent>

        <TabsContent value="final stretch" className="w-full">
          <Section data={trending} />
        </TabsContent>

        <TabsContent value="migrated" className="w-full">
          <Section data={completed} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Section = memo(({ data }: { data: TokenMetadata[] }) => {
  return (
    <div className="flex flex-col w-full">
      {data.map((token) => (
        <TokenItem key={token.contract_id} token={token} />
      ))}
    </div>
  );
});
Section.displayName = "Section";

const TokenItem = memo(({ token }: { token: TokenMetadata }) => {
  const truncatedContractId = useMemo(
    () => truncateString(token.contract_id, 4, 4),
    [token.contract_id],
  );

  return (
    <div className="flex-col flex p-3 transition-colors hover:bg-muted/50 !w-full">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <Avatar className="h-[72px] w-[72px] rounded-md">
              <AvatarImage
                src={token.image_url}
                className="object-cover rounded-md"
                // height={78}
                // width={78}
                // alt="token"
                // loading="eager"
                // fetchPriority="high"
              />
              <AvatarFallback>{token.symbol.charAt(0)}</AvatarFallback>
            </Avatar>
            {/* <Image */}
            {/*   src="https://assets.hiro.so/api/mainnet/token-metadata-api/SPGNH14RQWAT05PVG8CEXCM7BGC5PPR01XVGQXPZ.pos-coin-stxcity/1.png" */}
            {/*   className="object-cover rounded-md" */}
            {/*   height={78} */}
            {/*   width={78} */}
            {/*   alt="token" */}
            {/* /> */}
            <div className="flex flex-col gap-1">
              <div className="text-xs font-medium flex gap-2">
                <span className="text-base font-medium">{token.symbol}</span>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 text-muted-foreground hover:text-emerald-500">
                    <span className="truncate max-w-[60px] text-base font-medium">
                      {token.name}
                    </span>
                    <Copy className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>{token.name}</TooltipContent>
                </Tooltip>
              </div>
              <Socials socials={token.socials} />
              <div className="flex gap-3">
                <span className="text-sm">3d</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-medium text-secondary-foreground">
            {truncatedContractId}
          </span>
        </div>
        <div></div>
      </div>
      <div className="flex items-center justify-between"></div>
    </div>
  );
});
TokenItem.displayName = "TokenItem";
