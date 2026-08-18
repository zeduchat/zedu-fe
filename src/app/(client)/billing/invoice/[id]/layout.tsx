"use client";
import React from "react";

export default function InvoiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto">{children}</div>
    </div>
  );
}
