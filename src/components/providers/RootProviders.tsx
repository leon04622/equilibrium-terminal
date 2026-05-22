"use client";

import { HyperliquidProvider } from "@/components/providers/HyperliquidProvider";
import { WagmiProvider } from "@/components/providers/WagmiProvider";
import { TerminalErrorBoundary } from "@/components/TerminalErrorBoundary";

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <TerminalErrorBoundary>
      <WagmiProvider>
        <HyperliquidProvider>{children}</HyperliquidProvider>
      </WagmiProvider>
    </TerminalErrorBoundary>
  );
}
