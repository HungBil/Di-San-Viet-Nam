import { env } from "../config/env.js";

type AgentRequestInitFactory = () => RequestInit;

export async function fetchAgent(path: string, initFactory: AgentRequestInitFactory): Promise<Response> {
  let lastError: unknown;

  for (const baseUrl of getAgentBaseUrls()) {
    try {
      return await fetch(`${baseUrl}${path}`, initFactory());
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Agent request failed");
}

function getAgentBaseUrls() {
  const urls = [env.agentBaseUrl];

  try {
    const configuredUrl = new URL(env.agentBaseUrl);
    if (configuredUrl.hostname === "agent") {
      urls.unshift(`http://localhost:${process.env.AGENT_PORT ?? 8000}`);
    }
  } catch {
    // Keep the configured value; fetch will surface a concrete error.
  }

  return [...new Set(urls)];
}
