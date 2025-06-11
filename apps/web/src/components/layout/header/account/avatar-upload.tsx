"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, User } from "lucide-react";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { DialogTitle } from "@repo/ui/components/ui/dialog";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
} from "@repo/ui/components/ui/credenza";

interface AvatarUploadProps {
  onUploadSuccess?: (url: string, fileId: string) => void;
  currentAvatarUrl?: string;
  email: string;
}

export default function AvatarUpload({
  onUploadSuccess,
  currentAvatarUrl,
  email,
}: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(currentAvatarUrl || "");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "uploading" | "success" | "error" | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);

  const ikUploadRef = useRef<HTMLInputElement>(null);

  const authenticator = async () => {
    try {
      const response = await fetch("/api/imagekit-auth");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`,
        );
      }
      const data = await response.json();
      const { signature, expire, token } = data;
      return { signature, expire, token };
    } catch (error) {
      throw new Error(`Authentication request failed: ${error.message}`);
    }
  };

  const validateFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File must be less than 5MB in size.");
      return false;
    }
    if (!file.type.startsWith("image/")) {
      alert("File must be an image.");
      return false;
    }
    return true;
  };

  const onError = (err: any) => {
    setUploadStatus("error");
    setIsUploading(false);
    console.error("Upload error:", err);
  };

  const onUploadStart = () => {
    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);
  };

  const onProgress = (e: ProgressEvent) => {
    if (e.lengthComputable) {
      const progress = (e.loaded / e.total) * 100;
      setUploadProgress(progress);
    }
  };

  const onSuccess = (res: any) => {
    setIsUploading(false);
    setUploadStatus("success");
    setAvatarUrl(res.url);
    if (onUploadSuccess) {
      onUploadSuccess(res.url, res.fileId);
    }
    setTimeout(() => {
      setIsOpen(false);
      resetUploadState();
    }, 1500);
  };

  const resetUploadState = () => {
    setUploadProgress(0);
    setUploadStatus(null);
    setIsUploading(false);
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!isUploading) {
        setIsDragOver(true);
      }
    },
    [isUploading],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!isUploading && ikUploadRef.current) {
      ikUploadRef.current.click();
    }
  }, [isUploading]);

  useEffect(() => {
    if (currentAvatarUrl) {
      setAvatarUrl(currentAvatarUrl);
    }
  }, [currentAvatarUrl]);

  return (
    <ImageKitProvider
      publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!}
      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
      authenticator={authenticator}
    >
      <IKUpload
        ref={ikUploadRef}
        style={{ display: "none" }}
        validateFile={validateFile}
        onError={onError}
        onSuccess={onSuccess}
        onUploadProgress={onProgress}
        onUploadStart={onUploadStart}
        folder="/avatars"
      />

      <Avatar
        className="w-18 h-18 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsOpen(true)}
      >
        <AvatarImage
          src={avatarUrl}
          alt="User avatar"
          className="object-cover"
        />
        <AvatarFallback>
          <User className="w-8 h-8" />
        </AvatarFallback>
      </Avatar>

      <Credenza open={isOpen} onOpenChange={setIsOpen}>
        <CredenzaContent
          className="sm:max-w-md px-0 pt-0 sm:pt-4"
          showCloseIcon={false}
        >
          <CredenzaHeader className="border-b px-4 pb-4 flex items-center flex-row justify-between">
            <DialogTitle className="text-left">Upload Avatar</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </CredenzaHeader>

          <div className="space-y-4 px-4 pb-4 mt-4 sm:mt-0">
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${isDragOver && !isUploading ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"}
                ${isUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (!isUploading && ikUploadRef.current) {
                  // The IKUpload component will handle the dropped files if it's not hidden with display: none
                  // A better way is to let IKUpload handle it
                }
              }}
              onClick={handleClick}
            >
              <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                {isUploading ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploading...</p>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(uploadProgress)}%
                    </p>
                  </div>
                ) : uploadStatus === "success" ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-600">
                      ✓ Upload successful!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Closing dialog...
                    </p>
                  </div>
                ) : uploadStatus === "error" ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">
                      ✕ Upload failed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click to try again
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      Drag and drop an image here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to select a file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max size: 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </CredenzaContent>
      </Credenza>
    </ImageKitProvider>
  );
}
