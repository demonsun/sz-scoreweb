import { useEffect, useRef } from "react";
import { ADSENSE_CONFIG } from "./ad-config.js";

export default function AdUnit({ slot, format = "auto", responsive = true, className = "" }) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded (ad-blocker, dev mode, etc.)
    }
  }, []);

  return (
    <div className={"ad-wrapper " + className}>
      <span className="ad-label">广告</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CONFIG.client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
