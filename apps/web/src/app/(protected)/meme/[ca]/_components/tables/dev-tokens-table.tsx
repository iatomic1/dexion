"use client";

import { useEffect, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@repo/ui/lib/utils";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";

import { useDevTokens } from "~/contexts/TokenWatcherSocketContext";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/ui/avatar";
import { formatPrice } from "~/lib/helpers/numbers";
import Link from "next/link";
import { TokenMetadata } from "@repo/tokens/types";

export const tableColumns = (isMobile: boolean): ColumnDef<TokenMetadata>[] => [
  {
    accessorKey: "token",
    header: () => <div className={isMobile ? "w-32" : "w-48"}>Token</div>,
    cell: ({ row: { original: t } }) => {
      return (
        <div className="flex items-center gap-2 text-left">
          <Avatar className="h-8 w-8">
            <AvatarImage src={t.image_url} />
            <AvatarFallback>{t.symbol.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link href={`/meme/${t.contract_id}`} className="hover:underline">
            <span className="text-sm text-muted-foreground">{t.name}</span>
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "migrated",
    header: "Migrated",
    cell: ({ row }) => {
      return <div className="text-xs font-geist-mono xl:text-left">TBD</div>;
    },
  },
  {
    accessorKey: "mc",
    header: "Market Cap",
    cell: ({ row: { original: t } }) => {
      return (
        <div className="flex flex-col text-xs">
          ${formatPrice(t.metrics.marketcap_usd)}
        </div>
      );
    },
  },
  {
    accessorKey: "liquidity",
    header: "Liquidity",
    cell: ({ row: { original: t } }) => {
      return (
        <div className="font-geist-mono text-xs">
          ${formatPrice(t.metrics.liquidity_usd)}
        </div>
      );
    },
  },
  {
    accessorKey: "volume",
    header: "1h Volume",
    cell: ({ row: { original: t } }) => {
      return (
        <div className={cn("text-xs font-geist-mono")}>
          ${formatPrice(t.metrics.volume_1h_usd)}
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

export default function DevTokensTable() {
  const { data, isLoading } = useDevTokens();

  const isMobile = useMediaQuery("(max-width: 768px)");
  useEffect(() => {
    console.log(data, "dev tokens");
  }, [isLoading]);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  const table = useReactTable({
    data,
    columns: tableColumns(isMobile),
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
        <ScrollArea className="h-full w-full">
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
