"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Loading from "~/components/ui/loading";
import { SessionRequest } from "~/utils/new-request";

const AutoLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  // verify the session id
  useEffect(() => {
    const verifySession = async () => {
      const res = await SessionRequest("/users/me", sessionId as string);
      if (res.status === 200 || res.status === 201) {
        const user = res?.data?.data?.user;
        localStorage.setItem("token", sessionId as string);
        localStorage.setItem("useremail", user?.email);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("orgId", user?.current_org);
        const orgSlug = user?.current_organisation_slug;
        if (orgSlug) {
          localStorage.setItem("orgSlug", orgSlug);
        }
        router.push(orgSlug ? `/${orgSlug}` : "/client");
      }
    };
    verifySession();
  }, [sessionId]);

  return (
    <section className="w-full text-center md:w-[55%] flex flex-col max-w-xs md:max-w-lg mx-auto items-start pt-[30px]">
      <div className="w-full flex flex-col justify-center mt-[100px] md:mt-[160px] items-center gap-[8px] mb-[32px] ">
        <Loading height="60" width="60" color="#7141F8" />
        <p className="text-gray-600 text-sm">Authenticating...</p>
      </div>
    </section>
  );
};

export default AutoLogin;
