"use client";

import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@repo/ui/lib/utils";
import { ScrollArea, ScrollBar } from "@repo/ui/components/ui/scroll-area";
import type {
  TokenMetadata,
  TokenSwapTransaction,
} from "@repo/token-watcher/token.ts";
import { columns, getColumnWidth } from "./trades-table-columns";

import TradesTableSkeleton from "../skeleton/trades-table-skeleton";
import { useQuery } from "@tanstack/react-query";
import { getFilterTrades } from "~/lib/queries/stxtools";
import { Button } from "@repo/ui/components/ui/button";
import { truncateString } from "~/lib/helpers/strings";
import { useTokenTrades } from "~/contexts/TokenWatcherSocketContext";

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
  onFilterChange,
  initialFilterValue = "",
}: {
  token: TokenMetadata;
  onFilterChange: (filterValue: string) => void;
  initialFilterValue?: string;
}) {
  const { data: trades, isLoading: isTradesLoading } = useTokenTrades();
  const [filterBy, setFilterBy] = useState(initialFilterValue);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const velarPoolId = `VELAR_${token?.contract_id}_stx`;

  const { data: filteredTrades, isLoading: isFilterLoading } = useQuery({
    queryKey: ["trades", token?.contract_id, filterBy],
    queryFn: () => getFilterTrades(filterBy, velarPoolId as string),
    enabled: !!token && !!filterBy && !!velarPoolId,
  });

  const displayTrades =
    filterBy && !isFilterLoading && filteredTrades ? filteredTrades : trades;
  const [tableData, setTableData] =
    useState<TokenSwapTransaction[]>(displayTrades);

  useEffect(() => {
    const currentData =
      filterBy && !isFilterLoading && filteredTrades?.data?.length > 0
        ? filteredTrades?.data
        : trades;
    setTableData([...currentData]);
  }, [trades, filteredTrades, isFilterLoading, filterBy]);

  // Set initial filter value when it changes from parent
  useEffect(() => {
    if (initialFilterValue !== filterBy) {
      setFilterBy(initialFilterValue);
    }
  }, [initialFilterValue]);

  const handleFilterClick = (address: string) => {
    setFilterBy(address);
    onFilterChange(address); // Propagate filter change to parent
  };

  // Get visible columns based on screen size
  const getVisibleColumns = () => {
    const allColumns = columns(token, handleFilterClick);
    // If mobile, filter out 'type' and 'amount' columns
    return isMobile
      ? allColumns.filter(
          (col) => col.accessorKey !== "type" && col.accessorKey !== "amount",
        )
      : allColumns;
  };

  const table = useReactTable({
    data: tableData,
    columns: getVisibleColumns(),
    getCoreRowModel: getCoreRowModel(),
  });

  if (isFilterLoading || isTradesLoading || !token) {
    return <TradesTableSkeleton />;
  }

  // Calculate the number of columns to display (4 for mobile, 6 for desktop)
  const gridColumnsClass = isMobile ? "grid-cols-4" : "grid-cols-6";

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
      <div className={cn("w-full border-b grid", gridColumnsClass)}>
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="contents">
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className={cn(
                  "py-3 px-4 text-xs font-medium text-muted-foreground",
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
        <ScrollArea className="h-full w-full">
          <div className="w-full">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <div
                  key={row.id}
                  className={cn(
                    "grid w-full border-b items-center",
                    gridColumnsClass,
                    index % 2 === 0 ? "bg-muted/50" : "",
                  )}
                  style={{ minWidth: isMobile ? "auto" : "auto" }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <div
                      key={cell.id}
                      className={cn(
                        "py-3 px-4 truncate",
                        cell.column.id === "totalUsd"
                          ? "text-right"
                          : cell.column.id === "trader"
                            ? "text-right"
                            : "text-left",
                      )}
                      style={{
                        width: isMobile
                          ? "auto"
                          : getColumnWidth(cell.column.id),
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
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
