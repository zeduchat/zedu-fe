import React from "react";
import { Toaster } from "~/components/ui/toaster";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <div className="">{children}</div>
      <Toaster />
    </GoogleOAuthProvider>
  );
}
