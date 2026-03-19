import { useEffect, useState } from "react";

export default function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
  };

  return (
    <div style={{ fontFamily: "Arial" }}>
      
      {/* TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 20px",
          background: "#6d28d9",
          color: "white",
        }}
      >
        <h2 style={{ margin: 0 }}>RaMP It Up!</h2>

        {deferredPrompt && (
          <button
            onClick={installApp}
            style={{
              background: "white",
              color: "#6d28d9",
              border: "none",
              padding: "8px 14px",
              borderRadius: "20px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Install App
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ padding: "20px" }}>
        <h3>RaMP Tracker</h3>
        <p>This is where your tracking system will go.</p>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <p><strong>Student:</strong> Example</p>
          <p><strong>Goal:</strong> Staying on task</p>
          <p><strong>Status:</strong> ✅ Met</p>
        </div>
      </div>
    </div>
  );
}
