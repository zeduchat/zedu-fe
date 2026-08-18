import React from "react";
import { Toaster } from "~/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* <Header /> */}
      <div className="">{children}</div>
      {/* <ExternalPageFooter /> */}
      <Toaster />
    </>
  );
}
