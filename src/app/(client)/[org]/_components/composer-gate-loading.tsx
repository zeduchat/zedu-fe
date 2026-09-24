"use client";

import Loading from "~/components/ui/loading";

const ComposerGateLoading = () => {
  return (
    <div className="mx-3 md:mx-5 mb-3 h-[96px] rounded-xl border border-[#E6EAEF] dark:border-white/10 bg-[#F9FAFB] dark:bg-[#222529] flex items-center justify-center">
      <Loading color="#5757CD" height="24px" width="24px" />
    </div>
  );
};

export default ComposerGateLoading;
