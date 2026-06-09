const CHANNEL = "eq-terminal-runtime";

export type MultiWindowMessage =
  | { type: "asset:select"; coin: string }
  | { type: "layout:sync"; layoutHash: string }
  | { type: "vitals:pulse"; fps: number; stress: boolean };

/**
 * Cross-window state bridge for detached monitors (BroadcastChannel when available).
 */
export class MultiWindowCoordinator {
  private static instance: MultiWindowCoordinator | null = null;

  private channel: BroadcastChannel | null = null;
  private handlers: Array<(msg: MultiWindowMessage) => void> = [];

  static getInstance(): MultiWindowCoordinator {
    if (!MultiWindowCoordinator.instance) {
      MultiWindowCoordinator.instance = new MultiWindowCoordinator();
    }
    return MultiWindowCoordinator.instance;
  }

  init(): void {
    if (typeof BroadcastChannel === "undefined" || this.channel) return;
    this.channel = new BroadcastChannel(CHANNEL);
    this.channel.onmessage = (ev) => {
      const data = ev.data as MultiWindowMessage;
      for (const h of this.handlers) h(data);
    };
  }

  dispose(): void {
    this.channel?.close();
    this.channel = null;
    this.handlers = [];
  }

  subscribe(handler: (msg: MultiWindowMessage) => void): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  broadcast(msg: MultiWindowMessage): void {
    this.channel?.postMessage(msg);
  }
}

export const multiWindowCoordinator = MultiWindowCoordinator.getInstance();
