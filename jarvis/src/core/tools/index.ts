import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { localToolDefs } from "./definitions";

// web_search / web_fetch выполняются на серверах Anthropic — своего кода не требуют.
// allowed_callers: ["direct"] нужен, т.к. Haiku 4.5 не поддерживает programmatic tool calling
// (динамическую фильтрацию через код), которую эти инструменты используют по умолчанию.
const webSearchTool = {
  type: "web_search_20260209" as const,
  name: "web_search" as const,
  allowed_callers: ["direct"] as Array<"direct">,
};
const webFetchTool = {
  type: "web_fetch_20260209" as const,
  name: "web_fetch" as const,
  allowed_callers: ["direct"] as Array<"direct">,
};

const localTools = localToolDefs.map((def) =>
  betaZodTool({
    name: def.name,
    description: def.description,
    inputSchema: def.schema,
    run: def.run,
  })
);

export const tools = [...localTools, webSearchTool, webFetchTool];
