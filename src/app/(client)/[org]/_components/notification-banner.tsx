import { BellOff, Settings, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { useNotificationStatus } from "~/hooks/useNotificationStatus";

export function NotificationBanner() {
  const { permission, browser } = useNotificationStatus();
  const [isVisible, setIsVisible] = useState(true);

  if (
    permission === "granted" ||
    permission === "default" ||
    permission === "unsupported" ||
    !isVisible
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-slate-700">
            <BellOff size={18} className="text-red-500" />
            <span className="font-semibold text-sm">Notifications Blocked</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-slate-600 text-[13px] leading-relaxed mb-4">
            You're missing out on real-time updates and mentions. To re-enable
            notifications, follow these steps:
          </p>

          <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 mb-4">
            <h4 className="text-[12px] font-bold text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Settings size={12} />
              How to Unblock for{" "}
              {browser === "chrome" ? "Chrome / Edge" : "Safari"}
            </h4>

            <ol className="text-[13px] text-slate-700 space-y-2 ml-4 list-decimal">
              {browser === "chrome" ? (
                <>
                  <li>
                    Click the{" "}
                    <span className="font-bold text-blue-800 italic">
                      Settings/Tune
                    </span>{" "}
                    icon left of the URL.
                  </li>
                  <li>
                    Locate <strong>Notifications</strong> and toggle it{" "}
                    <strong>On</strong>.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    Go to <strong>Settings</strong> {">"}{" "}
                    <strong>Websites</strong>.
                  </li>
                  <li>
                    Select <strong>Notifications</strong> and allow this site.
                  </li>
                </>
              )}
              <li>Refresh this page to apply changes.</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
