"use client";
import React, { useContext } from "react";
import { DataContext } from "~/store/GlobalState";

const TypingUsers = () => {
  const { state } = useContext(DataContext);
  const { userTyping } = state;

  //

  return (
    <>
      {userTyping?.length > 0 && (
        <p className="ml-8 text-xs">
          {userTyping?.map((username: any, index: number) => (
            <span key={index}>
              {username}
              {index < userTyping?.length - 1 ? ", " : ""}
            </span>
          ))}
          {userTyping?.length === 1 ? " is typing" : " are typing"}
        </p>
      )}
    </>
  );
};

export default TypingUsers;
