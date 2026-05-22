import React from "react";
import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Clock } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useHistoryStore } from "../store/useHistoryStore";

const NAV = [
  { label: "Trade",   href: "/swap"    },
  { label: "Bridge",  href: "/bridge"  },
  { label: "Send",    href: "/send"    },
  { label: "Explore", href: "/explore" },
  { label: "Pool",    href: "/pool"    },
];

export function Header() {
  const [location] = useLocation();
  const { entries, panelOpen, setPanelOpen } = useHistoryStore();
  const pending = entries.filter(e => e.status === "pending").length;

  const isActive = (href: string) =>
    location === href || (href === "/swap" && (location === "/" || location === ""));

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-[68px] flex items-center justify-between px-4"
      style={{
        background: "rgba(var(--bg-rgb,19,19,19),0.90)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border1)",
      }}
    >
      {/* ── Left: Logo + Nav ────────────────────────────── */}
      <div className="flex items-center gap-3">
      <Link
        to="/swap"
        className="flex items-center gap-2 cursor-pointer select-none no-underline flex-shrink-0"
      >
        <img
          src="/img/logos/elements.webp"
          alt="Element Logo"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />

        <span
          className="font-bold text-[17px] tracking-tight hidden sm:block"
          style={{ color: "var(--text1)" }}
        >
          ElementSwap
        </span>
      </Link>

    {/* Nav pill */}
    <nav className="nav-pill hidden md:flex">
      {NAV.map(({ label, href }) => (
        <Link 
          key={href} 
          href={href} 
          className={`nav-item no-underline ${isActive(href) ? "active" : ""}`}
        >
          {label}
        </Link>
      ))}
    </nav>

      {/* Mobile nav — condensed */}
    <nav className="nav-pill flex md:hidden">
        {NAV.slice(0, 3).map(({ label, href }) => (
          <Link 
            key={href} 
            href={href} 
            className={`nav-item no-underline text-[13px] px-2.5 py-1.5 ${isActive(href) ? "active" : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      </div>

      {/* ── Right: Theme + History + Chain + Wallet ─────── */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* History button */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center
                     border-none cursor-pointer transition-all duration-150"
          style={{
            background: panelOpen ? "var(--surface3)" : "var(--surface2)",
            color: "var(--text2)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "var(--surface3)";
            e.currentTarget.style.color = "var(--text1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = panelOpen ? "var(--surface3)" : "var(--surface2)";
            e.currentTarget.style.color = "var(--text2)";
          }}
          title="Transaction history"
        >
          <Clock size={16} />
          {pending > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center
                             w-4 h-4 rounded-full text-[9px] font-bold text-white"
                  style={{ background: "var(--pink)" }}>
              {pending}
            </span>
          )}
        </button>

        {/* Chain indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl border
                        text-[14px] font-medium select-none"
             style={{
               background: "var(--surface2)",
               borderColor: "var(--border2)",
               color: "var(--text1)",
             }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />
                  <img
          src="/img/logos/elements.webp"
          alt="Element Logo"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
          ARC Testnet
        </div>

        {/* RainbowKit wallet */}
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
            const connected = mounted && account && chain;
            return (
              <div {...(!mounted && {
                "aria-hidden": true,
                style: { opacity:0, pointerEvents:"none", userSelect:"none" },
              })}>
                {!connected ? (
                  <button onClick={openConnectModal}
                    className="px-4 py-2 rounded-2xl text-[14px] font-semibold text-white
                               border-none cursor-pointer transition-all duration-150"
                    style={{ background: "var(--pink)", boxShadow: "0 0 16px rgba(252,114,255,0.3)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--pink-d)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "var(--pink)")}>
                    Connect
                  </button>
                ) : (
                  <button onClick={openAccountModal}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl border
                               text-[14px] font-medium cursor-pointer border-none
                               transition-all duration-150"
                    style={{
                      background: "var(--surface2)",
                      borderColor: "var(--border2)",
                      color: "var(--text1)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--surface3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "var(--surface2)")}>
                    <div className="w-5 h-5 rounded-full flex-shrink-0"
                         style={{ background: "linear-gradient(135deg,#fc72ff,#4c82fb)" }}/>
                    <span className="hidden sm:block">
                      {account.address.slice(0,6)}…{account.address.slice(-4)}
                    </span>
                  </button>
                )}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
