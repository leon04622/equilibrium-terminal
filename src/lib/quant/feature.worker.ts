/** Web Worker — deterministic feature vector pass-through validation. */

const FEATURE_SLOT_COUNT = 7;

export interface WorkerFeatureRequest {
  type: "extract";
  requestId: string;
  values: number[];
}

export interface WorkerFeatureResponse {
  type: "extract";
  requestId: string;
  ok: boolean;
  values: number[];
}

self.onmessage = (ev: MessageEvent<WorkerFeatureRequest>) => {
  const msg = ev.data;
  if (msg.type !== "extract") return;

  const values = new Float64Array(msg.values.length);
  for (let i = 0; i < msg.values.length && i < FEATURE_SLOT_COUNT; i += 1) {
    values[i] = msg.values[i];
  }

  const response: WorkerFeatureResponse = {
    type: "extract",
    requestId: msg.requestId,
    ok: true,
    values: Array.from(values),
  };

  self.postMessage(response);
};
