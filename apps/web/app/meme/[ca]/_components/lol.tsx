<HoverCard>
  <HoverCardTrigger>
    <div className="text-xs font-geist-mono hover:underline">
      {bns ? bns : truncateString(trader, 8, 5)}
    </div>
  </HoverCardTrigger>
  <HoverCardContent className="p-2 flex flex-col gap-2 w-sm" side="top">
    <div className="flex items-center justify-between">
      <Button
        variant={"ghost"}
        size={"sm"}
        className="text-xs"
        onClick={() => {
          copy(address);
          toast.info("Address copied to clipboard");
        }}
      >
        {bns ? bns : truncateString(trader, 8, 5)}{" "}
        <Copy className="h-2 w-2 ml-1" />{" "}
      </Button>
      <Button variant={"ghost"} size={"sm"} className="text-xs">
        USD
      </Button>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <InfoItem
        icon={<Crosshair className="h-5 w-5" />}
        label={`${ft?.total_buys} Buys`}
        value={`$${formatPrice(Number(ft?.total_spent_usd))}`}
      />
      <InfoItem
        icon={<Crosshair className="h-5 w-5" />}
        label={`${ft?.total_sells} Sells`}
        value={`$${formatPrice(Number(ft?.total_received_usd))}`}
      />{" "}
      <InfoItem
        icon={<Crosshair className="h-5 w-5" />}
        label={"PnL"}
        value={`$${formatPrice(Number(ft?.total_pnl_usd))}`}
      />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <InfoItem
        icon={<Crosshair className="h-5 w-5" />}
        value="2.21 %"
        label="Snipers H."
      />{" "}
      <InfoItem
        icon={<Crosshair className="h-5 w-5" />}
        value="2.21 %"
        label="Snipers H."
      />
    </div>
    <Separator />
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant={"ghost"}
            size={"icon"}
            className="hover:text-indigo-500 transition-colors duration-150 ease-in-out h-7 w-7"
          >
            <Scan className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Scan {truncateString(address, 5, 2)}</TooltipContent>
      </Tooltip>
    </div>
  </HoverCardContent>
</HoverCard>;
