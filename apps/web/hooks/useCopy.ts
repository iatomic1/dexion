import { useCallback, useState } from "react";
import { toast } from "sonner";

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;

/**
 * A hook that allows copying text to clipboard.
 * @param {boolean} trackCopiedText - Whether to track the copied text in state (default: false)
 * @returns The copy function only (if trackCopiedText is false) or [copiedText, copy] (if trackCopiedText is true)
 */
export default function useCopyToClipboard(trackCopiedText = false) {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = useCallback(
    async (text) => {
      if (!navigator?.clipboard) {
        toast.error("Clipboard not supported");
        console.warn("Clipboard not supported");
        return false;
      }

      // Try to save to clipboard then save it in the state if worked
      try {
        await navigator.clipboard.writeText(text);
        if (trackCopiedText) {
          setCopiedText(text);
        }
        return true;
      } catch (error) {
        console.warn("Copy failed", error);
        if (trackCopiedText) {
          setCopiedText(null);
        }
        return false;
      }
    },
    [trackCopiedText],
  );

  return trackCopiedText ? ([copiedText, copy] as const) : copy;
}
