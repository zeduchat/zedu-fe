"use client";
import { useEffect, useState } from "react";

export interface Credential {
  id: string;
  name: string;
  type: string;
}

export function useCredentials(type?: string) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type) return;
    setLoading(true);
    (async () => {
      try {
        // In production: /api/credentials?type=${type}
        const res = await fetch(`/api/credentials?type=${type}`);
        if (!res.ok) throw new Error("Failed to fetch credentials");
        const data = await res.json();
        setCredentials(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [type]);

  const addCredential = (cred: Omit<Credential, "id">) => {
    const newCred = {
      ...cred,
      id: `cred_${Math.random().toString(36).slice(2, 8)}`,
    };
    setCredentials((prev) => [...prev, newCred]);
    return newCred;
  };

  return { credentials, loading, addCredential };
}
