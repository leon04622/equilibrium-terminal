let gatewayLatencyMs = 4;
let gatewayFanoutClients = 0;

export function reportGatewayMetrics(latencyMs: number, fanoutClients: number): void {
  gatewayLatencyMs = latencyMs;
  gatewayFanoutClients = fanoutClients;
}

export function readGatewayMetrics(): { gatewayLatencyMs: number; gatewayFanoutClients: number } {
  return { gatewayLatencyMs, gatewayFanoutClients };
}
