"use client";
import React, { Suspense } from "react";
import InviteForm from "./invite-form";

const AcceptOrgInvite = () => {
  return (
    <div className="">
      <Suspense
        fallback={
          <p className="w-full max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-[3.5rem] mb-[2rem] text-lg">
            Loading...
          </p>
        }
      >
        <InviteForm />
      </Suspense>
    </div>
  );
};

export default AcceptOrgInvite;
