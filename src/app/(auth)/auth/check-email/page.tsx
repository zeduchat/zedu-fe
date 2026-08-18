import React, { Suspense } from "react";
import CheckEmail from "./CheckEmail";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckEmail />
    </Suspense>
  );
}
