"use client";
import React, { useContext, useEffect } from "react";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";

const TYPING_EXPIRE_MS = 4000;

const TypingUsers = () => {
  const { state, dispatch } = useContext(DataContext);
  const { userTyping } = state;

  useEffect(() => {
    if (!userTyping?.length) return;

    const interval = setInterval(() => {
      const now = Date.now();
      userTyping.forEach((typer: any) => {
        if (now - (typer?.at || 0) > TYPING_EXPIRE_MS) {
          dispatch({
            type: ACTIONS.USER_TYPING,
            payload: { userId: typer.id, typing: false },
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userTyping, dispatch]);

  if (!userTyping?.length) return null;

  const names = userTyping
    .map((typer: any) => (typeof typer === "string" ? typer : typer?.username))
    .filter(Boolean);

  if (!names.length) return null;

  let label = "";
  if (names.length === 1) {
    label = `${names[0]} is typing…`;
  } else if (names.length === 2) {
    label = `${names[0]} and ${names[1]} are typing…`;
  } else {
    label = "Several people are typing…";
  }

  return (
    <p className="pointer-events-none absolute inset-x-3 top-full z-10 mt-1 text-xs text-[#667085] md:inset-x-5 dark:text-zinc-400">
      {label}
    </p>
  );
};

export default TypingUsers;
