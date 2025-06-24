"use client";

import type React from "react";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  XIcon,
  InfoIcon,
  AlertTriangleIcon,
  TriangleAlert,
  Clipboard,
  LoaderIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

type BaseToastProps = {
  data: { id: string | number };
  title?: ReactNode;
  description?: ReactNode;
  onDismiss: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  defaultMessage: string;
  isLoading?: boolean;
};

// Base toast component that handles all variants
const BaseToast = ({
  data,
  title,
  description,
  onDismiss,
  icon: Icon,
  iconColor,
  defaultMessage,
  isLoading = false,
}: BaseToastProps) => (
  <div className="bg-background rounded-xl border px-4 py-4 shadow-lg z-[99999999999999999999999999999999999999999999999999999]">
    <div className="flex gap-2">
      <p className="grow text-sm">
        <Icon
          className={`me-3 -mt-0.5 inline-flex ${iconColor} ${isLoading ? "animate-spin" : ""}`}
          size={16}
          aria-hidden="true"
        />
        {title || description || defaultMessage}
      </p>
      <Button
        variant="ghost"
        className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
        aria-label="Close notification"
        onClick={() => {
          onDismiss();
        }}
      >
        <XIcon
          size={16}
          className="opacity-60 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </Button>
    </div>
  </div>
);

// Toast variant configurations
const toastVariants = {
  success: {
    icon: CircleCheckIcon,
    iconColor: "text-emerald-500",
    defaultMessage: "Completed successfully!",
  },
  copy: {
    icon: Clipboard,
    iconColor: "text-emerald-500",
    defaultMessage: "Copied successfully",
  },
  error: {
    icon: AlertTriangleIcon,
    iconColor: "text-red-500",
    defaultMessage: "An error occurred!",
  },
  info: {
    icon: InfoIcon,
    iconColor: "text-blue-500",
    defaultMessage: "Just a quick note!",
  },
  warning: {
    icon: TriangleAlert,
    iconColor: "text-amber-500",
    defaultMessage: "Some information is missing!",
  },
  loading: {
    icon: LoaderIcon,
    iconColor: "text-blue-500",
    defaultMessage: "Loading...",
  },
} as const;

// Promise toast options
type PromiseToastOptions<T> = {
  loading?: string;
  success?: string | ((data: T) => string);
  error?: string | ((error: any) => string);
  duration?: number;
};

// Create a custom toast function that overrides the default render
const customToast = Object.assign({}, toast, {
  success: (message: string, options?: any) => {
    const variant = toastVariants.success;
    return toast.custom(
      (data) => (
        <BaseToast
          data={data}
          title={message}
          onDismiss={() => toast.dismiss(data.id)}
          icon={variant.icon}
          iconColor={variant.iconColor}
          defaultMessage={variant.defaultMessage}
        />
      ),
      options,
    );
  },
  error: (message: string, options?: any) => {
    const variant = toastVariants.error;
    return toast.custom(
      (data) => (
        <BaseToast
          data={data}
          title={message}
          onDismiss={() => toast.dismiss(data.id)}
          icon={variant.icon}
          iconColor={variant.iconColor}
          defaultMessage={variant.defaultMessage}
        />
      ),
      options,
    );
  },
  info: (message: string, options?: any) => {
    const variant = toastVariants.info;
    return toast.custom(
      (data) => (
        <BaseToast
          data={data}
          title={message}
          onDismiss={() => toast.dismiss(data.id)}
          icon={variant.icon}
          iconColor={variant.iconColor}
          defaultMessage={variant.defaultMessage}
        />
      ),
      options,
    );
  },
  copy: (message: string, options?: any) => {
    const variant = toastVariants.copy;
    return toast.custom(
      (data) => (
        <BaseToast
          data={data}
          title={message}
          onDismiss={() => toast.dismiss(data.id)}
          icon={variant.icon}
          iconColor={variant.iconColor}
          defaultMessage={variant.defaultMessage}
        />
      ),
      options,
    );
  },
  warning: (message: string, options?: any) => {
    const variant = toastVariants.warning;
    return toast.custom(
      (data) => (
        <BaseToast
          data={data}
          title={message}
          onDismiss={() => toast.dismiss(data.id)}
          icon={variant.icon}
          iconColor={variant.iconColor}
          defaultMessage={variant.defaultMessage}
        />
      ),
      options,
    );
  },
  loading: (message: string, options?: any) => {
    const variant = toastVariants.loading;
    return toast.custom(
      (data) => (
        <BaseToast
          data={data}
          title={message}
          onDismiss={() => toast.dismiss(data.id)}
          icon={variant.icon}
          iconColor={variant.iconColor}
          defaultMessage={variant.defaultMessage}
          isLoading={true}
        />
      ),
      options,
    );
  },
  promise: <T,>(
    promise: Promise<T>,
    options: PromiseToastOptions<T>,
  ): Promise<T> => {
    const {
      loading = "Loading...",
      success: successMessage = "Success!",
      error: errorMessage = "Something went wrong!",
      duration = 4000,
    } = options;

    // Show loading toast
    const loadingVariant = toastVariants.loading;
    const toastId = toast.custom(
      (data) => (
        <BaseToast
          data={data}
          title={loading}
          onDismiss={() => toast.dismiss(data.id)}
          icon={loadingVariant.icon}
          iconColor={loadingVariant.iconColor}
          defaultMessage={loadingVariant.defaultMessage}
          isLoading={true}
        />
      ),
      { duration: Infinity },
    );

    // Handle promise resolution
    promise
      .then((data) => {
        const successVariant = toastVariants.success;
        const message =
          typeof successMessage === "function"
            ? successMessage(data)
            : successMessage;

        toast.custom(
          (toastData) => (
            <BaseToast
              data={toastData}
              title={message}
              onDismiss={() => toast.dismiss(toastData.id)}
              icon={successVariant.icon}
              iconColor={successVariant.iconColor}
              defaultMessage={successVariant.defaultMessage}
            />
          ),
          {
            id: toastId,
            duration,
          },
        );
      })
      .catch((error) => {
        const errorVariant = toastVariants.error;
        const message =
          typeof errorMessage === "function"
            ? errorMessage(error)
            : errorMessage;

        toast.custom(
          (toastData) => (
            <BaseToast
              data={toastData}
              title={message}
              onDismiss={() => toast.dismiss(toastData.id)}
              icon={errorVariant.icon}
              iconColor={errorVariant.iconColor}
              defaultMessage={errorVariant.defaultMessage}
            />
          ),
          {
            id: toastId,
            duration,
          },
        );
      });

    return promise;
  },
});

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          maxWidth: "400px",
          zIndex: 99999999999999999999999999999999999999999999999999999,
          top: "45px",
        },
        className: "w-full max-w-[400px]",
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, customToast as toast };
