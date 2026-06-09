import { CommandRegistry } from "@/lib/omnibar/CommandRegistry";
import { IntentParser, type ParseResult } from "@/lib/omnibar/IntentParser";
import { OmniContextEngine } from "@/lib/omnibar/OmniContextEngine";

/** Low-latency parse path: alias resolve → intent parse → recent history. */
export class OmniCommandRouter {
  static parse(raw: string): ParseResult {
    const trimmed = raw.trim();
    const resolved = CommandRegistry.resolveInput(trimmed);
    const result = IntentParser.parse(resolved);
    if (trimmed) OmniContextEngine.pushRecent(trimmed);
    return result;
  }
}
