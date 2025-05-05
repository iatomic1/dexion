"use client";

import * as React from "react";
import { X, GripHorizontal } from "lucide-react";
import Draggable from "react-draggable";

import {
  Dialog,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";

interface DraggableDialogProps {
  trigger: React.ReactNode;
  header: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  storageKey: string;
}

export function DraggableDialog({
  trigger,
  title,
  description,
  children,
  className,
  storageKey,
  header,
}: DraggableDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const nodeRef = React.useRef(null);
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

  const handleDragStop = (e: any, data: { x: number; y: number }) => {
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
              {header}
              {/**/}
              {/* {description && ( */}
              {/*   <DialogDescription className="px-4 pt-2"> */}
              {/*     {description} */}
              {/*   </DialogDescription> */}
              {/* )} */}
              <div className="">{children}</div>
            </div>
          </div>
        </Draggable>
      </div>
    </Dialog>
  );
}
