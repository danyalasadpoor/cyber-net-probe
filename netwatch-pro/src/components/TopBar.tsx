import { useEffect, useState } from "react";
import { Menu, Wifi, WifiOff, Activity } from "lucide-react";
import { Network } from "@capacitor/network";

export default function TopBar({ onMenu }: { onMenu: () => void }) {
  const [online, setOnline] = useState(true);
  const [connType, setConnType] = useState<string>("unknown");

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const s = await Network.getStatus();
        setOnline(s.connected);
        setConnType(s.connectionType);
        const h = await Network.addListener("networkStatusChange", (st) => {
          setOnline(st.connected);
          setConnType(st.connectionType);
        });
        unsub = () => h.remove();
      } catch {
        setOnline(navigator.onLine);
        const upd = () => setOnline(navigator.onLine);
        window.addEventListener("online", upd);
        window.addEventListener("offline", upd);
        unsub = () => {
          window.removeEventListener("online", upd);
          window.removeEventListener("offline", upd);
        };
      }
    })();
    return () => unsub?.();
  }, []);

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-white/5 bg-[rgba(5,8,22,0.7)] backdrop-blur-xl px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/5"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
          <Activity className="w-4 h-4 text-primary" />
          <span>Realtime network intelligence</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            online
              ? "bg-success/10 text-success border-success/30"
              : "bg-danger/10 text-danger border-danger/30"
          }`}
        >
          {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {online ? "Online" : "Offline"} · {connType}
        </div>
      </div>
    </header>
  );
}
