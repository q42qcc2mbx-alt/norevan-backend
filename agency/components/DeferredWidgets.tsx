"use client";

import dynamic from "next/dynamic";

// Non-critical, interactive-only widgets — none are needed for first paint or
// SEO. Loading them with ssr:false code-splits their JS (incl. the chat UI)
// out of the initial bundle so the page becomes interactive sooner; they
// hydrate a tick later, which is imperceptible for a chat/cookie/PWA widget.
const ChatWidget = dynamic(() => import("@/components/ChatWidget"));
const DeviceChooser = dynamic(() => import("@/components/DeviceChooser"));
const PwaRegister = dynamic(() => import("@/components/PwaRegister"));
const CookieBanner = dynamic(() => import("@/components/CookieBanner"));

export default function DeferredWidgets() {
  return (
    <>
      <ChatWidget />
      <DeviceChooser />
      <PwaRegister />
      <CookieBanner />
    </>
  );
}
