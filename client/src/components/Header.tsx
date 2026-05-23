import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Clock, Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (href: string) =>
    location === href || (href === "/swap" && (location === "/" || location === ""));

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 h-[68px] flex items-center justify-between px-4"
        style={{
          background: "rgba(var(--bg-rgb,19,19,19),0.90)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--border1)",
        }}
      >
        {/* Left: Logo + Desktop Nav */}
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

          {/* Desktop nav pill */}
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
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* History button */}
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all duration-150"
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
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
                style={{ background: "var(--pink)" }}
              >
                {pending}
              </span>
            )}
          </button>

          {/* Chain indicator — desktop only */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl border text-[14px] font-medium select-none"
            style={{
              background: "var(--surface2)",
              borderColor: "var(--border2)",
              color: "var(--text1)",
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />
            <img
              src="/img/logos/arc.webp"
              alt="Arc Logo"
              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            />
            ARC Testnet
          </div>

          {/* Wallet — desktop only */}
          <div className="hidden sm:block">
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                return (
                  <div
                    {...(!mounted && {
                      "aria-hidden": true,
                      style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
                    })}
                  >
                    {!connected ? (
                      <button
                        onClick={openConnectModal}
                        className="px-4 py-2 rounded-2xl text-[14px] font-semibold text-white border-none cursor-pointer transition-all duration-150"
                        style={{ background: "var(--pink)", boxShadow: "0 0 16px rgba(252,114,255,0.3)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--pink-d)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--pink)")}
                      >
                        Connect
                      </button>
                    ) : (
                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-3 py-2 rounded-2xl text-[14px] font-medium cursor-pointer border-none transition-all duration-150"
                        style={{ background: "var(--surface2)", color: "var(--text1)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--surface3)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--surface2)")}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#fc72ff,#4c82fb)" }}
                        />
                        {account.address.slice(0, 6)}…{account.address.slice(-4)}
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex md:hidden w-9 h-9 rounded-xl items-center justify-center border-none cursor-pointer transition-all duration-150"
            style={{
              background: menuOpen ? "var(--surface3)" : "var(--surface2)",
              color: "var(--text1)",
            }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile slide-in drawer */}
      <div
        className="fixed top-[68px] left-0 right-0 z-30 md:hidden transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: menuOpen ? "600px" : "0px",
          background: "var(--surface1)",
          borderBottom: menuOpen ? "1px solid var(--border1)" : "none",
        }}
      >
        <div className="px-4 py-4 space-y-1">
          {/* Nav links */}
          {NAV.map(({ label, href }) => (
            <Link key={href} href={href} className="no-underline block">
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-[16px] transition-all duration-150 cursor-pointer"
                style={{
                  background: isActive(href) ? "var(--surface3)" : "transparent",
                  color: isActive(href) ? "var(--text1)" : "var(--text2)",
                  borderLeft: isActive(href) ? "3px solid var(--pink)" : "3px solid transparent",
                }}
              >
                {label}
                {isActive(href) && (
                  <span
                    className="ml-auto text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(252,114,255,0.15)", color: "var(--pink)" }}
                  >
                    Active
                  </span>
                )}
              </div>
            </Link>
          ))}

          {/* Divider */}
          <div className="h-px my-2" style={{ background: "var(--border1)" }} />

          {/* Chain indicator in drawer */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-[14px] font-medium"
            style={{ background: "var(--surface2)", color: "var(--text1)" }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />
            <img
              src="/img/logos/arc.webp"
              alt="Arc Logo"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span>ARC Testnet</span>
            <span
              className="ml-auto text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: "rgba(64,182,107,0.15)", color: "var(--green)" }}
            >
              Live
            </span>
          </div>

          {/* Wallet in drawer */}
          <div className="pt-1 pb-2">
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                return (
                  <div
                    {...(!mounted && {
                      "aria-hidden": true,
                      style: { opacity: 0, pointerEvents: "none", userSelect: "none" },
                    })}
                  >
                    {!connected ? (
                      <button
                        onClick={openConnectModal}
                        className="w-full py-4 rounded-2xl text-[16px] font-semibold text-white border-none cursor-pointer"
                        style={{ background: "var(--pink)", boxShadow: "0 0 20px rgba(252,114,255,0.3)" }}
                      >
                        Connect Wallet
                      </button>
                    ) : (
                      <button
                        onClick={openAccountModal}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[15px] font-medium cursor-pointer border-none"
                        style={{ background: "var(--surface2)", color: "var(--text1)" }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#fc72ff,#4c82fb)" }}
                        />
                        <span>{account.address.slice(0, 6)}…{account.address.slice(-4)}</span>
                        <span
                          className="ml-auto text-[12px] px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(64,182,107,0.15)", color: "var(--green)" }}
                        >
                          {account.displayBalance}
                        </span>
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </>
  );
}