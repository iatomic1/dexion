"use client";
import { useEffect, useRef, useState } from "react";

interface TokenRefresherProps {
  refreshInterval?: number; // In minutes
}

export function TokenRefresher({ refreshInterval = 13 }: TokenRefresherProps) {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  const refreshToken = async () => {
    try {
      const response = await fetch("/api/refresh", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setLastRefresh(new Date());
        console.log("Token refreshed successfully");
      } else {
        console.error("Failed to refresh token");
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;
    // Initial token refresh when component mounts
    refreshToken();

    // Set up the interval for refreshing
    const intervalMs = refreshInterval * 60 * 1000; // Convert minutes to milliseconds
    intervalRef.current = setInterval(refreshToken, intervalMs);

    // Clean up the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval]);

  // This component doesn't render anything visible
  return null;
}
