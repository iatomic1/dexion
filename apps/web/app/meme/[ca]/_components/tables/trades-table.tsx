"use client";

import { useEffect, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { cn } from "@repo/ui/lib/utils";
import type {
  TokenMetadata,
  TokenSwapTransaction,
} from "@repo/token-watcher/token.ts";
import { formatPrice } from "~/lib/helpers/numbers";
import { formatRelativeTime } from "~/lib/helpers/dayjs";
import { truncateString } from "~/lib/helpers/strings";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/ui/tooltip";
import { ExternalLink, Worm } from "lucide-react";
import useCopyToClipboard from "~/hooks/useCopy";
import { CryptoHoverCard } from "../trade-details";
import openInNewPage from "~/lib/helpers/openInNewPage";
import { EXPLORER_BASE_URL } from "~/lib/constants";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

const calculateMarketCap = (token: TokenMetadata, price: number) => {
  return (Number(token.circulating_supply) / 10 ** token.decimals) * price;
};

export const calculateTokenValue = (balance: string, token: TokenMetadata) => {
  if (balance === "") return 0;

  const tokenBal = Number(balance);
  return (tokenBal / 10 ** token.decimals) * token.metrics.price_usd;
};
const determineTransactionType = (
  trade: TokenSwapTransaction,
  token: TokenMetadata,
) => {
  return trade.token_x.contract_id === token.contract_id ? "Sell" : "Buy";
};

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
      // if (wallet.bns === "ozai.btc") {
      //   console.log(row.original);
      // }
      return (
        <div className="flex items-center gap-2 text-right self-end  justify-end">
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
        </div>
      );
    },
    accessorFn: (row) => row.wallet.bns || row.wallet.address,
  },
];

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
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "text-xs text-muted-foreground",
                      header.column.id === "amount" ||
                        header.column.id === "totalUsd"
                        ? "text-right"
                        : header.id === "trader"
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
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
      </Table>

      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <Table>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={cn(index % 2 === 0 ? "bg-muted/50" : "")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
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
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns(token).length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
