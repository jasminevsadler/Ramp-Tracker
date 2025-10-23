import { useEffect, useState } from "react";

/**
 * Header install button that:
 * - shows even before Chrome fires the event (disabled state)
 * - enables itself when `beforeinstallprompt` fires
 * - hides itself after install
 */
export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);

  useEffect(() => {
    // Already installed?
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;
    setInstalled(isStandalone);

    const onBIP = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanPrompt(true);
      console.log("beforeinstallprompt fired");
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setCanPrompt(false);
      console.log("appinstalled");
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback instructions if Chrome didn't fire the event yet
      alert(
        "How to install:\n\n• Desktop Chrome/Edge: menu → Install (or Save & share → Install page as app)\n• Android Chrome: menu → Install app\n• iPhone Safari: Share → Add to Home Screen"
      );
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanPrompt(false);
  };

  if (installed) return null; // hide if already installed

  return (
    <button
      onClick={handleInstall}
      disabled={!canPrompt && !deferredPrompt}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold shadow
        ${canPrompt ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}
      title="Install RaMP"
      aria-label="Install RaMP"
    >
      Install app
    </button>
  );
}
