"use client";

import { useEffect, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@repo/ui/lib/utils";
import { formatPrice } from "~/lib/helpers/numbers";
import { truncateString } from "~/lib/helpers/strings";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/ui/tooltip";
import { Worm, ExternalLink, Funnel } from "lucide-react";
import { EXPLORER_BASE_URL } from "~/lib/constants";
import openInNewPage from "~/lib/helpers/openInNewPage";
import { CryptoHoverCard } from "../trade-details";
import {
  calculateMarketCap,
  calculateTokenValue,
  determineTransactionType,
} from "~/lib/utils/token";
import {
  TokenMetadata,
  TokenSwapTransaction,
} from "@repo/token-watcher/token.ts";
import { formatRelativeTime } from "~/lib/helpers/dayjs";

// Helper function to define consistent column widths
function getColumnWidth(columnId: string): string {
  switch (columnId) {
    case "timestamp":
      return "120px";
    case "type":
      return "100px";
    case "mc":
      return "120px";
    case "amount":
      return "120px";
    case "totalUsd":
      return "120px";
    case "trader":
      return "200px";
    default:
      return "auto";
  }
}

// Define the columns
export const columns = (
  token: TokenMetadata,
): ColumnDef<TokenSwapTransaction>[] => [
  {
    accessorKey: "timestamp",
    header: "Age / Time",
    cell: ({ row }) => (
      <div className="text-xs font-geist-mono">{row.getValue("timestamp")}</div>
    ),
    accessorFn: (row) => {
      return formatRelativeTime(
        new Date(row.burn_block_time * 1000).toISOString(),
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <div
          className={`text-xs font-geist-mono ${type === "Buy" ? "text-green-500" : "text-destructive"}`}
        >
          {type}
        </div>
      );
    },
    accessorFn: (row) => determineTransactionType(row, token),
  },
  {
    accessorKey: "mc",
    header: "MC",
    cell: ({ row }) => {
      const mc = Number.parseFloat(row.getValue("mc"));
      return <div className="text-xs font-geist-mono">{formatPrice(mc)}</div>;
    },
    accessorFn: (row) => calculateMarketCap(token, row.price_usd),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"));
      return (
        <div className="text-xs font-geist-mono text-right">
          {formatPrice(amount)}
        </div>
      );
    },
    accessorFn: (row) => {
      const type = determineTransactionType(row, token);
      // Choose the appropriate token amount based on buy/sell
      if (type === "Buy") {
        return (
          Number.parseFloat(
            row.token_y.contract_id === token.contract_id
              ? row.token_y_amount
              : row.token_x_amount,
          ) /
          10 ** token.decimals
        );
      } else {
        return (
          Number.parseFloat(
            row.token_x.contract_id === token.contract_id
              ? row.token_x_amount
              : row.token_y_amount,
          ) /
          10 ** token.decimals
        );
      }
    },
  },
  {
    accessorKey: "totalUsd",
    header: "Total USD",
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("totalUsd"));

      return (
        <div
          className={`text-xs font-geist-mono text-right ${
            determineTransactionType(row.original, token) === "Buy"
              ? "text-green-500"
              : "text-destructive"
          }`}
        >
          ${formatPrice(amount)}
        </div>
      );
    },
    accessorFn: (row) => row.volume_usd,
  },
  {
    accessorKey: "trader",
    header: "Trader",
    cell: ({ row }) => {
      const wallet = row.original.wallet;
      const ft = wallet.fungible_tokens[0];
      const bns = wallet.bns;
      const address = wallet.address;

      return (
        <div className="flex items-center gap-2 text-right self-end justify-end">
          <Tooltip>
            <TooltipTrigger>
              {(!ft?.total_buys || ft?.total_buys === "0") && (
                <Worm className="h-3 w-3" />
              )}
            </TooltipTrigger>
            <TooltipContent>Insider</TooltipContent>
          </Tooltip>
          <CryptoHoverCard
            address={address}
            bns={bns}
            ft={ft as TokenSwapTransaction["wallet"]["fungible_tokens"][0]}
            decimals={token.decimals}
            valueUsd={calculateTokenValue(ft?.balance as string, token)}
            percentageHolding={
              ft ? (Number(ft.balance) / Number(token.total_supply)) * 100 : 0
            }
            txId={row.original.tx_id}
          >
            <div className="text-xs font-geist-mono hover:underline">
              {bns ? bns : truncateString(address, 8, 5)}
            </div>
          </CryptoHoverCard>
          <Tooltip>
            <TooltipTrigger
              onClick={() => {
                openInNewPage(`${EXPLORER_BASE_URL}txid/${row.original.tx_id}`);
              }}
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>Open in Exp.</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger onClick={() => {}}>
              <Funnel className="h-3 w-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>Filter by address</TooltipContent>
          </Tooltip>
        </div>
      );
    },
    accessorFn: (row) => row.wallet.bns || row.wallet.address,
  },
];

// Custom hook for media queries (borrowed from HoldersTable)
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

export default function TradesTable({
  trades,
  token,
}: {
  trades: TokenSwapTransaction[];
  token: TokenMetadata;
}) {
  console.log("TradesTable rendering with trades:", trades.length);
  // Create state for table data to ensure re-renders when props change
  const [tableData, setTableData] = useState<TokenSwapTransaction[]>(trades);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Update table data when trades prop changes
  useEffect(() => {
    console.log("Trades updated, refreshing table data:", trades.length);
    setTableData([...trades]);
  }, [JSON.stringify(trades)]);

  const table = useReactTable({
    data: tableData,
    columns: columns(token),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex h-full w-full flex-col border-t">
      {/* Header */}
      <div
        className={cn(
          "w-full border-b grid",
          isMobile ? "min-w-[800px]" : "",
          "grid-cols-6", // Assuming 6 columns as per the columns definition
        )}
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="contents">
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className={cn(
                  "py-3 px-4 text-xs font-medium text-muted-foreground",
                  header.column.id === "amount" ||
                    header.column.id === "totalUsd"
                    ? "text-right"
                    : header.column.id === "trader"
                      ? "text-right"
                      : "text-left",
                )}
                style={{
                  width: getColumnWidth(header.column.id),
                }}
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
                    <div
                      key={cell.id}
                      className={cn(
                        "py-3 px-4",
                        cell.column.id === "amount" ||
                          cell.column.id === "totalUsd"
                          ? "text-right"
                          : "text-left",
                      )}
                      style={{
                        width: getColumnWidth(cell.column.id),
                      }}
                    >
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
