import dynamic from "next/dynamic";
import { TerminalBootSplash } from "@/components/TerminalBootSplash";
import { recoverFromChunkLoadError } from "@/lib/chunkLoadRecovery";
import { guardBootStorage } from "@/lib/runtime/bootStorageGuard";

function ChunkRecoverySplash() {
  return <TerminalBootSplash />;
}

function loadTerminalApp() {
  // Prune any oversized/corrupt persisted state BEFORE the terminal modules
  // (and their store hydration) run, so a bloated layout/journal can't OOM the
  // renderer on load.
  guardBootStorage();
  return import("@/components/terminal/TerminalApp")
    .then((mod) => mod.TerminalApp)
    .catch((err: unknown) => {
      if (recoverFromChunkLoadError(err)) return ChunkRecoverySplash;
      throw err;
    });
}

const TerminalApp = dynamic(loadTerminalApp, {
  ssr: false,
  loading: () => <TerminalBootSplash />,
});

export default function HomePage() {
  return <TerminalApp />;
}
