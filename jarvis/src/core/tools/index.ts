import { runCommandTool } from "./runCommand";
import { createReminderTool, listRemindersTool, cancelReminderTool } from "./reminders";

// web_search / web_fetch выполняются на серверах Anthropic — своего кода не требуют.
const webSearchTool = { type: "web_search_20260209", name: "web_search" } as const;
const webFetchTool = { type: "web_fetch_20260209", name: "web_fetch" } as const;

export const tools = [
  runCommandTool,
  createReminderTool,
  listRemindersTool,
  cancelReminderTool,
  webSearchTool,
  webFetchTool,
];
