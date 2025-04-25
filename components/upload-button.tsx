"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Youtube } from "lucide-react";
import Link from "next/link";

const buttonVariant = {
  outline: "outline",
  ghost: "ghost",
  link: "link",
  default: "default",
  destructive: "destructive",
  secondary: "secondary",
} as const;

interface UploadButtonProps {
  variant?: keyof typeof buttonVariant;
}

export function UploadButton({ variant = "default" }: UploadButtonProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant={buttonVariant[variant]}
        className="h-20 flex flex-col gap-1"
        asChild
      >
        <Link href="/upload?type=file">
          <FileText className="h-6 w-6" />
          <span>Upload Document</span>
        </Link>
      </Button>
      <Button
        variant={buttonVariant[variant]}
        className="h-20 flex flex-col gap-1"
        asChild
      >
        <Link href="/upload?type=youtube">
          <Youtube className="h-6 w-6" />
          <span>YouTube Link</span>
        </Link>
      </Button>
    </div>
  );
}
