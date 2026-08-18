"use client";

import { useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";

export default function ApiKeys({ status }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(status?.agent_api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6 py-6">
      <h3>Api Key</h3>
      <div className=" flex items-center gap-2">
        <a
          href={status?.agent_api_key}
          className="text-sm text-indigo-600 bg-indigo-50 px-2 py-2 rounded font-medium border"
        >
          {status?.agent_api_key}
        </a>
        <button
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-700"
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
