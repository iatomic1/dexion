"use client";

import type React from "react";

import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

interface InputPasswordProps extends React.ComponentProps<"input"> {
  label?: string;
  showLabel?: boolean;
}

export default function InputPassword({
  className,
  label = "Password",
  showLabel = true,
  placeholder = "Enter password",
  ...props
}: InputPasswordProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <div className="space-y-2">
      {showLabel && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          {...props}
          id={id}
          className={cn("pe-9", className)}
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
        />
        <button
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={toggleVisibility}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls={id}
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
