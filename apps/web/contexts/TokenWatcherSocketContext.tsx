"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getSocket } from "~/lib/token-socket";

type TxPayload = {
  type: string;
  contract: string;
  txId: string;
  tokenMetadata?: any;
};

const TokenSocketContext = createContext<null | TxPayload>(null);

export const useTokenSocket = () => useContext(TokenSocketContext);

export const TokenSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tx, setTx] = useState<TxPayload | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const match = pathname?.match(/\/meme\/(.+)/);
    const ca = match?.[1];

    if (!ca) return;

    const socket = getSocket();

    socket.emit("subscribe", ca);
    socket.on("tx", (data: TxPayload) => {
      if (data.contract === ca) setTx(data);
    });

    return () => {
      socket.emit("unsubscribe", ca);
      socket.off("tx");
    };
  }, [pathname]);

  return (
    <TokenSocketContext.Provider value={tx}>
      {children}
    </TokenSocketContext.Provider>
  );
};
