"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { ProductShell } from "@/components/layout/product-shell";

/* ── Figma asset constants ──────────────────────── */
const imgUploadIcon = "";
const imgCloseIcon = "";

export default function SubmitPage() {
  return (
    <ProductShell>
      <div className="relative min-h-screen">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#e4e9ea]">
          <div className="bg-[#3b6934] h-full w-3/4" />
        </div>

        {/* Cancel Button */}
        <Link
          href="/discover/1"
          className="absolute top-8 right-8 surface-secondary p-2 rounded-lg"
        >
          <div className="relative h-3.5 w-3.5">
            <Image
              src={imgCloseIcon}
              alt="Cancel"
              fill
              className="object-contain"
            />
          </div>
        </Link>

        {/* Main Content */}
        <div className="flex flex-col gap-4 max-w-[896px] mx-auto pt-[193px] pb-[64px] px-8">
          {/* Step Indicator & Context */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <p
                className="text-[#5a6061]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "12px",
                  fontWeight: "600",
                  letterSpacing: "0.36px",
                  textTransform: "uppercase"
                }}
              >
                STEP 1 OF 4
              </p>
            </div>
            
            <div className="flex flex-col">
              <h1
                className="text-[#2d3435]"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "56px",
                  fontWeight: "600",
                  lineHeight: "78.4px",
                  letterSpacing: "-1.12px"
                }}
              >
                Upload Proof
              </h1>
            </div>
            
            <div className="max-w-[576px]">
              <p
                className="text-[#5a6061]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "16px",
                  lineHeight: "26px",
                  letterSpacing: "0.16px"
                }}
              >
                Provide visual confirmation of your sustainability action. This helps us<br />
                verify your impact accurately and maintain the integrity of our ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2">
          <div className="surface-muted aspect-[3/1] rounded-lg overflow-hidden relative">
            {/* Subtle decorative background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(221,228,229,0.2)]" />
            
            <div className="flex flex-col items-center justify-center h-full relative">
              <div className="relative h-8 w-11">
                <Image
                  src={imgUploadIcon}
                  alt="Upload"
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="pt-4">
                <div className="flex flex-col gap-1 items-center">
                  <p
                    className="text-[#2d3435]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "22px",
                      fontWeight: "500",
                      lineHeight: "33px"
                    }}
                  >
                    Drag and drop your file here
                  </p>
                  <p
                    className="text-[#5a6061]"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      lineHeight: "24px",
                      letterSpacing: "0.16px"
                    }}
                  >
                    or click to browse from your device
                  </p>
                </div>
              </div>
              
              {/* Hidden File Input */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 overflow-hidden pb-[247px]">
                <div className="bg-[#efefef] border-2 border-black px-2 py-1">
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "16px",
                      lineHeight: "24px"
                    }}
                  >
                    Choose File
                  </p>
                </div>
                <p
                  className="text-[#2d3435]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "16px",
                    lineHeight: "24px"
                  }}
                >
                  No file chosen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="absolute left-8 right-8 bottom-[64px]">
          <div className="flex justify-end">
            <button className="btn-primary px-8 py-4 rounded-sm">
              <span
                className="text-[#e6ffdb]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "14px",
                  fontWeight: "600",
                  letterSpacing: "0.35px",
                  textTransform: "uppercase"
                }}
              >
                CONTINUE
              </span>
            </button>
          </div>
        </div>
      </div>
    </ProductShell>
  );
}
