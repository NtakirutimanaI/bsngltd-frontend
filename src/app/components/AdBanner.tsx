import { useEffect } from "react";

interface AdBannerProps {
    slot: string;
    format?: "auto" | "fluid" | "rectangle";
    className?: string;
}

export function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error", e);
        }
    }, []);

    return (
        <div className={`ad-container overflow-hidden my-4 ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // Replace with real ID
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
}
