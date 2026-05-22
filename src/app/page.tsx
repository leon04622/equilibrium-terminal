import dynamic from "next/dynamic";
import { TerminalBootSplash } from "@/components/TerminalBootSplash";
import { recoverFromChunkLoadError } from "@/lib/chunkLoadRecovery";

function ChunkRecoverySplash() {
  return <TerminalBootSplash />;
}

function loadTerminalApp() {
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
