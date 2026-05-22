import React, { useEffect } from "react";
import { Route, Switch } from "wouter";
import { WagmiProvider }  from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";

import { wagmiConfig } from "./lib/wagmi";
import { useThemeStore, initThemeListener } from "./store/useThemeStore";

import { Header }       from "./components/Header";
import { HistoryPanel } from "./components/HistoryPanel";

import { SwapPage }             from "./pages/Swap";
import { PoolsPage }            from "./pages/Pools";
import { AddLiquidityPage }     from "./pages/AddLiquidity";
import { RemoveLiquidityPage }  from "./pages/RemoveLiquidity";
import { WrapUnwrapPage }       from "./pages/WrapUnwrap";
import { ExplorePage }          from "./pages/Explore";
import { BridgePage }           from "./pages/Bridge";
import { SendPage }             from "./pages/Send";

import "@rainbow-me/rainbowkit/styles.css";
import "./styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
});

function AppInner() {
  const { resolved, setTheme, theme } = useThemeStore();

  /* Apply theme on mount + listen for OS changes */
  useEffect(() => {
    setTheme(theme);
    initThemeListener();
  }, []);

  /* RainbowKit theme tracks resolved value */
  const rbkTheme = resolved === "light"
    ? lightTheme({
        accentColor: "#d946ef",
        accentColorForeground: "white",
        borderRadius: "large",
      })
    : darkTheme({
        accentColor: "#fc72ff",
        accentColorForeground: "white",
        borderRadius: "large",
        overlayBlur: "large",
        colors: {
          modalBackground:        "#1c1c1c",
          modalBorder:            "rgba(255,255,255,0.10)",
          profileForeground:      "#2c2c2c",
          connectButtonBackground:"#2c2c2c",
        },
      });

  return (
    <RainbowKitProvider theme={rbkTheme} modalSize="compact">

      {/* Page background glow */}
      <div className="page-glow" />

      {/* Header */}
      <Header />

      {/* History slide-in panel */}
      <HistoryPanel />

      {/* Routes */}
      <Switch>
        <Route path="/"            component={SwapPage}           />
        <Route path="/swap"        component={SwapPage}           />
        <Route path="/bridge"      component={BridgePage}         />
        <Route path="/send"        component={SendPage}           />
        <Route path="/explore"     component={ExplorePage}        />
        <Route path="/pool"        component={PoolsPage}          />
        <Route path="/pool/add"    component={AddLiquidityPage}   />
        <Route path="/pool/remove" component={RemoveLiquidityPage}/>
        <Route path="/wrap"        component={WrapUnwrapPage}     />
        <Route path="/unwrap"      component={WrapUnwrapPage}     />
        <Route>
          <main className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-[64px] font-bold mb-2"
                 style={{
                   background: "linear-gradient(135deg,var(--pink),var(--blue))",
                   WebkitBackgroundClip: "text",
                   WebkitTextFillColor: "transparent",
                 }}>404</p>
              <p className="text-[16px]" style={{ color: "var(--text2)" }}>Page not found</p>
            </div>
          </main>
        </Route>
      </Switch>

      {/* Toasts */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background:   "var(--surface1)",
            border:       "1px solid var(--border2)",
            color:        "var(--text1)",
            fontFamily:   "Inter, sans-serif",
            fontSize:     "14px",
            fontWeight:   "500",
            borderRadius: "14px",
            padding:      "14px 18px",
            boxShadow:    "0 8px 32px rgba(0,0,0,0.25)",
            maxWidth:     "380px",           // ← Add max width
            wordBreak:    "break-word",      // ← Break long words
            whiteSpace:   "normal",          // ← Allow wrapping
            overflowWrap: "break-word",      // ← Ensure wrapping
          },
          success: { iconTheme: { primary: "#40b66b", secondary: "transparent" } },
          error:   { iconTheme: { primary: "#ff4f4f", secondary: "transparent" } },
          loading: { iconTheme: { primary: "#fc72ff", secondary: "transparent" } },
        }}
      />
    </RainbowKitProvider>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </WagmiProvider>
  );
}


// import React, { useEffect } from "react";
// import { Route, Switch } from "wouter";
// import { WagmiProvider }  from "wagmi";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
// import { Toaster } from "react-hot-toast";

// import { wagmiConfig } from "./lib/wagmi";
// import { useThemeStore, initThemeListener } from "./store/useThemeStore";

// import { Header }       from "./components/Header";
// import { HistoryPanel } from "./components/HistoryPanel";

// import { SwapPage }             from "./pages/Swap";
// import { PoolsPage }            from "./pages/Pools";
// import { AddLiquidityPage }     from "./pages/AddLiquidity";
// import { RemoveLiquidityPage }  from "./pages/RemoveLiquidity";
// import { WrapUnwrapPage }       from "./pages/WrapUnwrap";
// import { ExplorePage }          from "./pages/Explore";
// import { BridgePage }           from "./pages/Bridge";
// import { SendPage }             from "./pages/Send";

// import "@rainbow-me/rainbowkit/styles.css";
// import "./styles/globals.css";

// const queryClient = new QueryClient({
//   defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
// });

// function AppInner() {
//   const { resolved, setTheme, theme } = useThemeStore();

//   /* Apply theme on mount + listen for OS changes */
//   useEffect(() => {
//     setTheme(theme);
//     initThemeListener();
//   }, []);

//   /* RainbowKit theme tracks resolved value */
//   const rbkTheme = resolved === "light"
//     ? lightTheme({
//         accentColor: "#d946ef",
//         accentColorForeground: "white",
//         borderRadius: "large",
//       })
//     : darkTheme({
//         accentColor: "#fc72ff",
//         accentColorForeground: "white",
//         borderRadius: "large",
//         overlayBlur: "large",
//       });

//   if (resolved === "dark") {
//     rbkTheme.colors.modalBackground      = "#1c1c1c";
//     rbkTheme.colors.modalBorder          = "rgba(255,255,255,0.10)";
//     rbkTheme.colors.profileForeground    = "#2c2c2c";
//     rbkTheme.colors.connectButtonBackground = "#2c2c2c";
//   }

//   return (
//     <RainbowKitProvider theme={rbkTheme} modalSize="compact">

//       {/* Page background glow */}
//       <div className="page-glow" />

//       {/* Header */}
//       <Header />

//       {/* History slide-in panel */}
//       <HistoryPanel />

//       {/* Routes */}
//       <Switch>
//         <Route path="/"            component={SwapPage}           />
//         <Route path="/swap"        component={SwapPage}           />
//         <Route path="/bridge"      component={BridgePage}         />
//         <Route path="/send"        component={SendPage}           />
//         <Route path="/explore"     component={ExplorePage}        />
//         <Route path="/pool"        component={PoolsPage}          />
//         <Route path="/pool/add"    component={AddLiquidityPage}   />
//         <Route path="/pool/remove" component={RemoveLiquidityPage}/>
//         <Route path="/wrap"        component={WrapUnwrapPage}     />
//         <Route path="/unwrap"      component={WrapUnwrapPage}     />
//         <Route>
//           <main className="relative z-10 flex items-center justify-center min-h-screen">
//             <div className="text-center">
//               <p className="text-[64px] font-bold mb-2"
//                  style={{
//                    background: "linear-gradient(135deg,var(--pink),var(--blue))",
//                    WebkitBackgroundClip: "text",
//                    WebkitTextFillColor: "transparent",
//                  }}>404</p>
//               <p className="text-[16px]" style={{ color: "var(--text2)" }}>Page not found</p>
//             </div>
//           </main>
//         </Route>
//       </Switch>

//       {/* Toasts */}
//       <Toaster
//         position="bottom-right"
//         toastOptions={{
//           style: {
//             background:   "var(--surface1)",
//             border:       "1px solid var(--border2)",
//             color:        "var(--text1)",
//             fontFamily:   "Inter, sans-serif",
//             fontSize:     "14px",
//             fontWeight:   "500",
//             borderRadius: "14px",
//             padding:      "14px 18px",
//             boxShadow:    "0 8px 32px rgba(0,0,0,0.25)",
//           },
//           success: { iconTheme: { primary: "#40b66b", secondary: "transparent" } },
//           error:   { iconTheme: { primary: "#ff4f4f", secondary: "transparent" } },
//           loading: { iconTheme: { primary: "#fc72ff", secondary: "transparent" } },
//         }}
//       />
//     </RainbowKitProvider>
//   );
// }

// export default function App() {
//   return (
//     <WagmiProvider config={wagmiConfig}>
//       <QueryClientProvider client={queryClient}>
//         <AppInner />
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }
