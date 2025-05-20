"use client";

import SimilarTokens from "./similar-tokens";
import TokenAudit from "./token-audit";
import PresetTabs from "./preset-tabs";
import TradingStats from "./stats";
import { DexBanner } from "./dex-banner";
import {
  LiquidityPool,
  TokenHolder,
  TokenMetadata,
} from "@repo/token-watcher/token.ts";
import { calculatePercentageHolding } from "~/lib/utils/token";
import { useEffect, useState } from "react";
import Pools from "./pools";

interface TradingPanelProps {
  token: TokenMetadata;
  holders: TokenHolder[];
  pools: LiquidityPool[];
}

export default function TradingPanel({
  token,
  holders,
  pools,
}: TradingPanelProps) {
  // const [tradeAction, setTradeAction] = useState("buy");
  // const [tradeType, setTradeType] = useState("market");
  // const [amount, setAmount] = useState("0.01");
  // const [preset, setPreset] = useState("preset1");
  const [top10Holding, setTop10Holding] = useState<number>(0);

  useEffect(() => {
    const top10Holders = holders.slice(0, 10);

    const top10Balance = top10Holders.reduce(
      (sum, holder) => sum + Number(holder.balance),
      0,
    );

    setTop10Holding(
      calculatePercentageHolding(top10Balance.toString(), token.total_supply),
    );
  }, [holders]);

  return (
    <div className="sm:flex h-full flex-col hidden">
      <div className="flex flex-col p-4">
        {/* <Tabs */}
        {/*   defaultValue="buy" */}
        {/*   value={tradeAction} */}
        {/*   onValueChange={setTradeAction} */}
        {/*   className="w-full" */}
        {/* > */}
        {/*   <TabsList className="grid w-full grid-cols-2"> */}
        {/*     <TabsTrigger value="buy">Buy</TabsTrigger> */}
        {/*     <TabsTrigger value="sell">Sell</TabsTrigger> */}
        {/*   </TabsList> */}
        {/**/}
        {/*   <TabsContent value="buy"> */}
        {/*     <Tabs */}
        {/*       defaultValue="market" */}
        {/*       value={tradeType} */}
        {/*       onValueChange={setTradeType} */}
        {/*       className="w-full" */}
        {/*     > */}
        {/*       <div> */}
        {/*         <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1"> */}
        {/*           <TabsTrigger */}
        {/*             value="market" */}
        {/*             className="data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none" */}
        {/*           > */}
        {/*             Market */}
        {/*           </TabsTrigger> */}
        {/*           <TabsTrigger */}
        {/*             value="limit" */}
        {/*             className="data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none" */}
        {/*           > */}
        {/*             Limit */}
        {/*           </TabsTrigger> */}
        {/*           <TabsTrigger */}
        {/*             value="advanced" */}
        {/*             className="data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none" */}
        {/*           > */}
        {/*             Adv. */}
        {/*           </TabsTrigger> */}
        {/*         </TabsList> */}
        {/*       </div> */}
        {/**/}
        {/*       <TabsContent value="market"> */}
        {/*         <div className="mt-6"> */}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">AMOUNT</span> */}
        {/*             <div className="flex items-center gap-1"> */}
        {/*               <Button variant="ghost" size="icon" className="h-6 w-6"> */}
        {/*                 <svg */}
        {/*                   xmlns="http://www.w3.org/2000/svg" */}
        {/*                   width="24" */}
        {/*                   height="24" */}
        {/*                   viewBox="0 0 24 24" */}
        {/*                   fill="none" */}
        {/*                   stroke="currentColor" */}
        {/*                   strokeWidth="2" */}
        {/*                   strokeLinecap="round" */}
        {/*                   strokeLinejoin="round" */}
        {/*                   className="h-4 w-4" */}
        {/*                 > */}
        {/*                   <path d="M12 3v18" /> */}
        {/*                   <path d="M3 12h18" /> */}
        {/*                 </svg> */}
        {/*               </Button> */}
        {/*               <Button variant="ghost" size="icon" className="h-6 w-6"> */}
        {/*                 <svg */}
        {/*                   xmlns="http://www.w3.org/2000/svg" */}
        {/*                   width="24" */}
        {/*                   height="24" */}
        {/*                   viewBox="0 0 24 24" */}
        {/*                   fill="none" */}
        {/*                   stroke="currentColor" */}
        {/*                   strokeWidth="2" */}
        {/*                   strokeLinecap="round" */}
        {/*                   strokeLinejoin="round" */}
        {/*                   className="h-4 w-4" */}
        {/*                 > */}
        {/*                   <path d="M3 12h18" /> */}
        {/*                 </svg> */}
        {/*               </Button> */}
        {/*             </div> */}
        {/*           </div> */}
        {/**/}
        {/*           <div className="grid grid-cols-4 gap-2"> */}
        {/*             <Input */}
        {/*               // value={amount} */}
        {/*               onChange={(e) => setAmount(e.target.value)} */}
        {/*               className="col-span-1 text-center" */}
        {/*             /> */}
        {/*             <Input value="0.03" className="col-span-1 text-center" /> */}
        {/*             <Input value="0.05" className="col-span-1 text-center" /> */}
        {/*             <Input value="0.08" className="col-span-1 text-center" /> */}
        {/*           </div> */}
        {/**/}
        {/*           <div className="mt-6 grid grid-cols-1 gap-2"> */}
        {/*             <Button className="w-full bg-green-500 text-white hover:bg-green-600"> */}
        {/*               Buy {token.symbol} */}
        {/*             </Button> */}
        {/*           </div> */}
        {/*         </div> */}
        {/*       </TabsContent> */}
        {/**/}
        {/*       <TabsContent value="limit"> */}
        {/*         <div className="mt-6"> */}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">LIMIT PRICE</span> */}
        {/*           </div> */}
        {/*           <Input className="mb-4" placeholder="Enter limit price" /> */}
        {/**/}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">AMOUNT</span> */}
        {/*           </div> */}
        {/*           <div className="grid grid-cols-4 gap-2"> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.01" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.03" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.05" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.08" */}
        {/*             /> */}
        {/*           </div> */}
        {/**/}
        {/*           <div className="mt-6 grid grid-cols-1 gap-2"> */}
        {/*             <Button className="w-full bg-green-500 text-white hover:bg-green-600"> */}
        {/*               Buy {token.symbol} at Limit */}
        {/*             </Button> */}
        {/*           </div> */}
        {/*         </div> */}
        {/*       </TabsContent> */}
        {/**/}
        {/*       <TabsContent value="advanced"> */}
        {/*         <div className="mt-6"> */}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">STOP PRICE</span> */}
        {/*           </div> */}
        {/*           <Input className="mb-4" placeholder="Enter stop price" /> */}
        {/**/}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">LIMIT PRICE</span> */}
        {/*           </div> */}
        {/*           <Input className="mb-4" placeholder="Enter limit price" /> */}
        {/**/}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">AMOUNT</span> */}
        {/*           </div> */}
        {/*           <div className="grid grid-cols-4 gap-2"> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.01" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.03" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.05" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.08" */}
        {/*             /> */}
        {/*           </div> */}
        {/**/}
        {/*           <div className="mt-6 grid grid-cols-1 gap-2"> */}
        {/*             <Button className="w-full bg-green-500 text-white hover:bg-green-600"> */}
        {/*               Buy {token.symbol} Advanced */}
        {/*             </Button> */}
        {/*           </div> */}
        {/*         </div> */}
        {/*       </TabsContent> */}
        {/*     </Tabs> */}
        {/*   </TabsContent> */}
        {/**/}
        {/*   <TabsContent value="sell"> */}
        {/*     <Tabs */}
        {/*       defaultValue="market" */}
        {/*       value={tradeType} */}
        {/*       onValueChange={setTradeType} */}
        {/*       className="w-full" */}
        {/*     > */}
        {/*       <div> */}
        {/*         <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1"> */}
        {/*           <TabsTrigger */}
        {/*             value="market" */}
        {/*             className="data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none" */}
        {/*           > */}
        {/*             Market */}
        {/*           </TabsTrigger> */}
        {/*           <TabsTrigger */}
        {/*             value="limit" */}
        {/*             className="data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none" */}
        {/*           > */}
        {/*             Limit */}
        {/*           </TabsTrigger> */}
        {/*           <TabsTrigger */}
        {/*             value="advanced" */}
        {/*             className="data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none" */}
        {/*           > */}
        {/*             Adv. */}
        {/*           </TabsTrigger> */}
        {/*         </TabsList> */}
        {/*       </div> */}
        {/**/}
        {/*       <TabsContent value="market"> */}
        {/*         <div className="mt-6"> */}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">AMOUNT</span> */}
        {/*             <div className="flex items-center gap-1"> */}
        {/*               <Button variant="ghost" size="icon" className="h-6 w-6"> */}
        {/*                 <svg */}
        {/*                   xmlns="http://www.w3.org/2000/svg" */}
        {/*                   width="24" */}
        {/*                   height="24" */}
        {/*                   viewBox="0 0 24 24" */}
        {/*                   fill="none" */}
        {/*                   stroke="currentColor" */}
        {/*                   strokeWidth="2" */}
        {/*                   strokeLinecap="round" */}
        {/*                   strokeLinejoin="round" */}
        {/*                   className="h-4 w-4" */}
        {/*                 > */}
        {/*                   <path d="M12 3v18" /> */}
        {/*                   <path d="M3 12h18" /> */}
        {/*                 </svg> */}
        {/*               </Button> */}
        {/*               <Button variant="ghost" size="icon" className="h-6 w-6"> */}
        {/*                 <svg */}
        {/*                   xmlns="http://www.w3.org/2000/svg" */}
        {/*                   width="24" */}
        {/*                   height="24" */}
        {/*                   viewBox="0 0 24 24" */}
        {/*                   fill="none" */}
        {/*                   stroke="currentColor" */}
        {/*                   strokeWidth="2" */}
        {/*                   strokeLinecap="round" */}
        {/*                   strokeLinejoin="round" */}
        {/*                   className="h-4 w-4" */}
        {/*                 > */}
        {/*                   <path d="M3 12h18" /> */}
        {/*                 </svg> */}
        {/*               </Button> */}
        {/*             </div> */}
        {/*           </div> */}
        {/**/}
        {/*           <div className="grid grid-cols-4 gap-2"> */}
        {/*             <Input */}
        {/*               value={amount} */}
        {/*               onChange={(e) => setAmount(e.target.value)} */}
        {/*               className="col-span-1 text-center" */}
        {/*             /> */}
        {/*             <Input value="0.03" className="col-span-1 text-center" /> */}
        {/*             <Input value="0.05" className="col-span-1 text-center" /> */}
        {/*             <Input value="0.08" className="col-span-1 text-center" /> */}
        {/*           </div> */}
        {/**/}
        {/*           <div className="mt-6 grid grid-cols-1 gap-2"> */}
        {/*             <Button className="w-full bg-red-500 text-white hover:bg-red-600"> */}
        {/*               Sell {token.symbol} */}
        {/*             </Button> */}
        {/*           </div> */}
        {/*         </div> */}
        {/*       </TabsContent> */}
        {/**/}
        {/*       <TabsContent value="limit"> */}
        {/*         <div className="mt-6"> */}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">LIMIT PRICE</span> */}
        {/*           </div> */}
        {/*           <Input className="mb-4" placeholder="Enter limit price" /> */}
        {/**/}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">AMOUNT</span> */}
        {/*           </div> */}
        {/*           <div className="grid grid-cols-4 gap-2"> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.01" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.03" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.05" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.08" */}
        {/*             /> */}
        {/*           </div> */}
        {/**/}
        {/*           <div className="mt-6 grid grid-cols-1 gap-2"> */}
        {/*             <Button className="w-full bg-red-500 text-white hover:bg-red-600"> */}
        {/*               Sell {token.symbol} at Limit */}
        {/*             </Button> */}
        {/*           </div> */}
        {/*         </div> */}
        {/*       </TabsContent> */}
        {/**/}
        {/*       <TabsContent value="advanced"> */}
        {/*         <div className="mt-6"> */}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">STOP PRICE</span> */}
        {/*           </div> */}
        {/*           <Input className="mb-4" placeholder="Enter stop price" /> */}
        {/**/}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">LIMIT PRICE</span> */}
        {/*           </div> */}
        {/*           <Input className="mb-4" placeholder="Enter limit price" /> */}
        {/**/}
        {/*           <div className="mb-2 flex items-center justify-between"> */}
        {/*             <span className="text-sm">AMOUNT</span> */}
        {/*           </div> */}
        {/*           <div className="grid grid-cols-4 gap-2"> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.01" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.03" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.05" */}
        {/*             /> */}
        {/*             <Input */}
        {/*               className="col-span-1 text-center" */}
        {/*               defaultValue="0.08" */}
        {/*             /> */}
        {/*           </div> */}
        {/**/}
        {/*           <div className="mt-6 grid grid-cols-1 gap-2"> */}
        {/*             <Button className="w-full bg-red-500 text-white hover:bg-red-600"> */}
        {/*               Sell {token.symbol} Advanced */}
        {/*             </Button> */}
        {/*           </div> */}
        {/*         </div> */}
        {/*       </TabsContent> */}
        {/*     </Tabs> */}
        {/*   </TabsContent> */}
        {/* </Tabs> */}
        {/**/}
        <TradingStats />
        <PresetTabs />
        <TokenAudit token={token} top10Holding={top10Holding} />
        <Pools token={token} pools={pools} />
        {/* <SimilarTokens token={token} /> */}
        <DexBanner bannerUrl={token?.header_image_url} />
      </div>
    </div>
  );
}
