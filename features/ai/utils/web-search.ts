import { openai } from "@ai-sdk/openai";

/** OpenAI web search tool config for Responses API. */
export function getWebSearchTools() {
  return {
    web_search: openai.tools.webSearch({
      searchContextSize: "medium",
      externalWebAccess: true,
    }),
  };
}
