"use client";

import React, { Suspense, useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <Suspense fallback={null}>
      <div className="relative min-h-[100dvh] w-full">{children}</div>
    </Suspense>
  );
}

export default Layout;
