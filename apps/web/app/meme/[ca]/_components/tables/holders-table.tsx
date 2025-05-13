"use client";

import { useEffect, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@repo/ui/lib/utils";
import type {
  TokenHolder,
  TokenMetadata,
  TokenSwapTransaction,
} from "@repo/token-watcher/token.ts";
import { formatPrice } from "~/lib/helpers/numbers";
import { truncateString } from "~/lib/helpers/strings";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { calculateTokenValue } from "./trades-table";
import { validateContractAddress } from "~/lib/helpers/validateContractAddress";
import { Progress } from "@repo/ui/components/ui/progress";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/ui/tooltip";
import { Worm, ExternalLink, Vault } from "lucide-react";
import { EXPLORER_BASE_URL, POOLS_ADDRESSES } from "~/lib/constants";
import openInNewPage from "~/lib/helpers/openInNewPage";
import { CryptoHoverCard } from "../trade-details";

function calculatePnl(
  row: TokenHolder,
  token: TokenMetadata,
): { value: number; formatted: string } {
  const valueUsd = calculateTokenValue(row.balance as string, token);

  // If no sells have occurred, calculate PnL as current value minus total spent
  if (row.total_buys && row.total_sells === "0") {
    const pnlValue = valueUsd - Number(row.total_spent_usd);
    return {
      value: pnlValue,
      formatted: formatPrice(pnlValue),
    };
  }

  // Otherwise, use the calculated total PnL
  const pnlValue = Number(row.total_pnl_usd);
  return {
    value: pnlValue,
    formatted: formatPrice(pnlValue),
  };
}

// Define columns for both desktop and mobile
export const tableColumns = (
  token: TokenMetadata,
  isMobile: boolean,
): ColumnDef<TokenHolder>[] => [
  {
    accessorKey: "indexAndWallet",
    header: () => <div className={isMobile ? "w-32" : "w-48"}>Wallet</div>,
    cell: ({ row }) => {
      const address = row.original.wallet.address;
      const isCa = validateContractAddress(address);
      const bns = row.original.wallet.bns;
      const data = row.original;
      const ft = {
        balance: data.balance,
        credits: data.credits,
        debits: data.debits,
        total_buys: data.total_buys,
        total_sells: data.total_sells,
        total_spent_usd: data.total_spent_usd,
        total_received_usd: data.total_received_usd,
        total_pnl_usd: data.total_pnl_usd,
        created_at: "2024-11-23T11:15:08.000Z",
      };
      return (
        <div className="flex items-center gap-2 text-left">
          {/* Index */}
          <div className="w-6 text-xs font-geist-mono text-muted-foreground">
            {row.index + 1}
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger>
                {(!data?.total_buys || data?.total_buys === "0") && (
                  <Worm className="h-3 w-3" />
                )}
              </TooltipTrigger>
              <TooltipContent>Insider</TooltipContent>
            </Tooltip>

            {/* Wallet address */}
            <CryptoHoverCard
              address={address}
              bns={bns}
              ft={ft as TokenSwapTransaction["wallet"]["fungible_tokens"][0]}
              decimals={token.decimals}
              valueUsd={calculateTokenValue(ft?.balance as string, token)}
              percentageHolding={
                ft ? (Number(ft.balance) / Number(token.total_supply)) * 100 : 0
              }
              txId={address}
            >
              <div className="text-xs font-geist-mono hover:underline">
                {bns
                  ? bns.length >= (isMobile ? 15 : 20)
                    ? truncateString(bns, isMobile ? 8 : 10, isMobile ? 4 : 6)
                    : bns
                  : truncateString(
                      address,
                      isCa ? (isMobile ? 5 : 7) : isMobile ? 8 : 10,
                      isCa ? (isMobile ? 4 : 6) : isMobile ? 4 : 6,
                    )}
              </div>
            </CryptoHoverCard>

            {/* External link */}
            <Tooltip>
              <TooltipTrigger
                onClick={() => {
                  openInNewPage(`${EXPLORER_BASE_URL}address/${address}`);
                }}
              >
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Open in Exp.</TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "STX Balance",
    cell: ({ row }) => {
      return (
        <div className="text-xs font-geist-mono text-right xl:text-left">
          1.23k
        </div>
      );
    },
  },
  {
    accessorKey: "bought",
    header: "Bought",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="text-xs font-geist-mono text-emerald-500">
            ${formatPrice(Number(row.original.total_spent_usd))}
          </span>
          <div className="text-[11px] text-muted-foreground">
            <span>
              {formatPrice(Number(row.original.credits) / 10 ** token.decimals)}{" "}
              /{" "}
            </span>
            <span>{row.original.total_buys}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "sold",
    header: "Sold",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="text-xs font-geist-mono text-destructive">
            ${formatPrice(Number(row.original.total_received_usd))}
          </span>
          <div className="text-[11px] text-muted-foreground">
            {formatPrice(Number(row.original.debits) / 10 ** token.decimals)} /{" "}
            <span>{row.original.total_sells}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "pnl",
    header: "PnL",
    cell: ({ row }) => {
      const pnl = calculatePnl(row.original, token);

      // Determine color based on PnL value
      const colorClass =
        pnl.value > 0
          ? "text-emerald-600"
          : pnl.value < 0
            ? "text-destructive"
            : "text-muted-foreground";

      return (
        <div className={cn("text-xs font-geist-mono", colorClass)}>
          ${pnl.formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "remaining",
    header: "Remaining",
    cell: ({ row }) => {
      const data = row.original;

      const percentageHolding = data.balance
        ? (Number(data.balance) / Number(token.total_supply)) * 100
        : 0;

      return (
        <div className="text-xs font-geist-mono text-right flex flex-col gap-1">
          <div className="flex items-center gap-1 justify-end">
            <span>
              ${formatPrice(calculateTokenValue(row.original.balance, token))}
            </span>
            <Badge
              variant={"secondary"}
              className="rounded-sm text-[10px] font-light"
            >
              {formatPrice(percentageHolding)}%
            </Badge>
          </div>
          <Progress
            value={percentageHolding}
            className="h-1 max-w-20 self-end"
          />
        </div>
      );
    },
  },
];

// Custom hook for media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export default function HoldersTable({
  holders,
  token,
}: {
  holders: TokenHolder[];
  token: TokenMetadata;
}) {
  const [tableData, setTableData] = useState<TokenHolder[]>(holders);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setTableData([...holders]);
  }, [JSON.stringify(holders)]);

  const table = useReactTable({
    data: tableData,
    columns: tableColumns(token, isMobile),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex h-full w-full flex-col border-t">
      {/* Header */}
      <div
        className={cn(
          "w-full border-b grid",
          isMobile ? "min-w-[800px]" : "",
          "grid-cols-6",
        )}
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="contents">
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className={cn(
                  "py-3 px-4 text-xs font-medium text-muted-foreground",
                  header.id === "remaining" && "text-right",
                )}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full" orientation="both">
          <div className={cn(isMobile ? "min-w-[800px]" : "")}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <div
                  key={row.id}
                  className={cn(
                    "grid w-full grid-cols-6 border-b items-center",
                    index % 2 === 0 ? "bg-muted/50" : "",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id} className="py-3 px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="flex h-24 w-full items-center justify-center">
                <span className="text-sm text-muted-foreground">
                  No results.
                </span>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
