"use client";

import { useEffect, useRef } from "react";
import animationData from "@/components/shared/loader-animation.json";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type LottiePlayerElement = HTMLElement & {
  load?: (animation: unknown) => void;
};

type LottiePlayerAttributes = HTMLAttributes<LottiePlayerElement> & {
  autoplay?: boolean | "true" | "false";
  loop?: boolean | "true" | "false";
  mode?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "lottie-player": DetailedHTMLProps<LottiePlayerAttributes, LottiePlayerElement>;
    }
  }
}

type LoaderProps = {
  className?: string;
  size?: number;
};

export default function Loader({ className = "", size = 180 }: LoaderProps) {
  const playerRef = useRef<LottiePlayerElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadAnimation = () => {
      if (playerRef.current?.load) {
        playerRef.current.load(animationData);
      }
    };

    if ((window as Window & { lottiePlayerScriptLoaded?: boolean }).lottiePlayerScriptLoaded) {
      loadAnimation();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@lottiefiles/lottie-player@1.5.6/dist/lottie-player.js";
    script.async = true;
    script.onload = () => {
      (window as Window & { lottiePlayerScriptLoaded?: boolean }).lottiePlayerScriptLoaded = true;
      loadAnimation();
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <lottie-player
        ref={playerRef}
        autoplay
        loop
        mode="normal"
        style={{ width: size, height: size }}
      ></lottie-player>
    </div>
  );
}
