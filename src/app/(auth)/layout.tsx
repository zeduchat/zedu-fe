"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { DataContext, DataProvider } from "~/store/GlobalState";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { state } = useContext(DataContext);
  const { orgSlug } = state;

  //
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push(`/${orgSlug}`);
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) return;

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <DataProvider>{children}</DataProvider>
    </GoogleOAuthProvider>
  );
}
