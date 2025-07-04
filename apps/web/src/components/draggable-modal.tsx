"use client";
import * as React from "react";
import Draggable, { DraggableEvent, DraggableData } from "react-draggable";
import { Dialog, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { cn } from "@repo/ui/lib/utils";

interface DraggableDialogProps {
  trigger: React.ReactNode;
  header:
    | React.ReactNode
    | ((props: { setOpen: (open: boolean) => void }) => React.ReactNode);
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  storageKey: string;
}

export function DraggableDialog({
  trigger,
  children,
  className,
  storageKey,
  header,
}: DraggableDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = React.useState({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  });

  // Load position from localStorage on mount
  React.useEffect(() => {
    try {
      const savedPosition = localStorage.getItem(storageKey);
      if (savedPosition) {
        const parsedPosition = JSON.parse(savedPosition);
        setPosition(parsedPosition);
      } else {
        // Default position in the center of the screen
        setPosition({
          x: window.innerWidth / 2 - 200, // assuming dialog width ~400px
          y: window.innerHeight / 2 - 150, // assuming dialog height ~300px
        });
      }
    } catch (error) {
      console.error("Failed to load dialog position:", error);
    }
  }, [storageKey]);

  // Calculate bounds to prevent dragging outside viewport
  React.useEffect(() => {
    const updateBounds = () => {
      if (dialogRef.current) {
        const dialogRect = dialogRef.current.getBoundingClientRect();
        setBounds({
          left: 0,
          top: 0,
          right: window.innerWidth - dialogRect.width,
          bottom: window.innerHeight - dialogRect.height,
        });
      }
    };

    if (open) {
      // Set bounds after dialog is fully rendered
      setTimeout(updateBounds, 0);
      window.addEventListener("resize", updateBounds);
    }

    return () => {
      window.removeEventListener("resize", updateBounds);
    };
  }, [open]);

  // Fix: Use proper type for the drag event and data
  const handleDragStop = (_: DraggableEvent, data: DraggableData) => {
    setPosition({ x: data.x, y: data.y });
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ x: data.x, y: data.y }),
      );
    } catch (error) {
      console.error("Failed to save dialog position:", error);
    }
  };

  // Render header based on whether it's a function or ReactNode
  const renderHeader = () => {
    if (typeof header === "function") {
      return header({ setOpen });
    }
    return header;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <div
        className={open ? "fixed inset-0 z-50" : "hidden"}
        style={{ pointerEvents: "none" }}
      >
        <Draggable
          nodeRef={nodeRef}
          handle=".drag-handle"
          bounds={bounds}
          position={position}
          onStop={handleDragStop}
          defaultPosition={position}
        >
          <div
            ref={nodeRef}
            className="pointer-events-auto !p-0"
            style={{ position: "absolute", zIndex: 50 }}
          >
            <div
              ref={dialogRef}
              className={cn(
                "bg-background border-border relative rounded-lg border-2 shadow-lg !p-0",
                "select-none",
                className,
              )}
            >
              {renderHeader()}
              <div className="">{children}</div>
            </div>
          </div>
        </Draggable>
      </div>
    </Dialog>
  );
}
