"use client";

import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "~/store/GlobalState";
import { GetRequest } from "~/utils/new-request";

type UserStatus = {
  text: string;
  emoji: string;
};

const ProfileStatus = ({ user }: { user?: Record<string, unknown> | null }) => {
  const { state } = useContext(DataContext);
  const { statusCallback, profileCallback } = state;
  const [status, setStatus] = useState<UserStatus | null>(null);

  const userId = user?.user_id ?? user?.id ?? user?.userid;

  useEffect(() => {
    if (!userId) {
      setStatus(null);
      return;
    }

    let cancelled = false;

    const fetchStatus = async () => {
      const res = await GetRequest(`/users/${userId}/status`);
      const responseStatus = res?.status ?? res?.response?.status;

      if (
        !cancelled &&
        (responseStatus === 200 || responseStatus === 201) &&
        res?.data?.data
      ) {
        const text = String(res.data.data.text ?? "").trim();
        const emoji = String(res.data.data.emoji ?? "").trim();

        if (!text && !emoji) {
          setStatus(null);
          return;
        }

        setStatus({ text, emoji });
        return;
      }

      if (!cancelled) {
        setStatus(null);
      }
    };

    void fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [userId, statusCallback, profileCallback, user?.text, user?.icon]);

  if (!status) return null;

  return (
    <div className="flex items-center gap-2 min-w-0">
      {status.emoji ? (
        <span className="text-lg leading-none shrink-0" aria-hidden="true">
          {status.emoji}
        </span>
      ) : null}
      {status.text ? (
        <p className="text-[15px] text-[#344054] truncate">{status.text}</p>
      ) : null}
    </div>
  );
};

export default ProfileStatus;
