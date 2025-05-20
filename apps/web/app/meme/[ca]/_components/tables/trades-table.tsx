"use client";

import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@repo/ui/lib/utils";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
  TokenMetadata,
  TokenSwapTransaction,
} from "@repo/token-watcher/token.ts";
import { columns, getColumnWidth } from "./trades-table-columns";
import {
  useTokenPools,
  useTokenTrades,
} from "~/contexts/TokenWatcherSocketContext";
import TradesTableSkeleton from "../skeleton/trades-table-skeleton";
import { useQuery } from "@tanstack/react-query";
import { getFilterTrades } from "~/lib/queries/stxtools";
import { Button } from "@repo/ui/components/ui/button";
import { truncateString } from "~/lib/helpers/strings";

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
  token,
  filterBy,
  setFilterBy,
  trades,
}: {
  trades: TokenSwapTransaction[];
  token: TokenMetadata;
  filterBy: string;
  setFilterBy: any;
}) {
  // const { data: poolsData, isLoading: poolsLoading } = useTokenPools();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const velarPoolId = `VELAR_${token.contract_id}_stx`;

  const { data: filteredTrades, isLoading: isFilterLoading } = useQuery({
    queryKey: ["trades", token?.contract_id, filterBy],
    queryFn: () => getFilterTrades(filterBy, velarPoolId as string),
    enabled: !!token && !!filterBy && !!velarPoolId,
  });

  const displayTrades =
    filterBy && !isFilterLoading && filteredTrades ? filteredTrades : trades;
  const [tableData, setTableData] =
    useState<TokenSwapTransaction[]>(displayTrades); // Update table data when trades prop changes
  useEffect(() => {
    const currentData =
      filterBy && !isFilterLoading && filteredTrades?.data?.length > 0
        ? filteredTrades?.data
        : trades;
    setTableData([...currentData]);
  }, [trades, filteredTrades, isFilterLoading, filterBy]);

  const handleFilterClick = (address: string) => {
    console.log("called in handleFilterClick");
    setFilterBy(address);
  };
  useEffect(() => {
    console.log("filterby changed to", filterBy);
  }, [filterBy]);

  const table = useReactTable({
    data: tableData,
    columns: columns(token, handleFilterClick),
    getCoreRowModel: getCoreRowModel(),
  });
  if (isFilterLoading) {
    return <TradesTableSkeleton />;
  }

  return (
    <div className="flex h-full w-full flex-col border-t">
      {filterBy && filteredTrades?.rowCount > 0 && (
        <div className="flex items-center justify-between pl-4 py-1">
          <span className="text-xs font-geist-mono text-muted-foreground">
            Showing {filteredTrades?.data.length} transactions of maker{" "}
            {truncateString(filterBy, 10, 4)}
          </span>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-xs font-geist-mono text-indigo-500 h-7"
            onClick={() => handleFilterClick("")}
          >
            RESET
          </Button>
        </div>
      )}
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
