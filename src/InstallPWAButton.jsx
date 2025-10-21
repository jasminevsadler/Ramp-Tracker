import { useEffect, useState } from "react";

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onBeforeInstallPrompt(e) {
      // Chrome fires this when the app is installable
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
      // optional: analytics/log
      console.log("beforeinstallprompt fired");
    }

    function onAppInstalled() {
      setShow(false);
      setDeferredPrompt(null);
      console.log("appinstalled");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setShow(false);
    deferredPrompt.prompt();
    try {
      await deferredPrompt.userChoice; // { outcome: 'accepted'|'dismissed' }
    } finally {
      setDeferredPrompt(null);
    }
  };

  if (!show) return null;

  return (
    <button
      onClick={handleInstall}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 active:scale-[.99] transition"
      aria-label="Install RaMP"
      title="Install RaMP"
    >
      Install app
    </button>
  );
}
