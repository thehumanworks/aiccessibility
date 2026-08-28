export {};

declare global {
  namespace WebMCP {
    interface ToolExecuteCallbackOptions {
      signal?: AbortSignal;
    }

    interface ToolAnnotations {
      readOnlyHint?: boolean;
      untrustedContentHint?: boolean;
    }

    interface ModelContextTool {
      name: string;
      title?: string;
      description: string;
      inputSchema?: object;
      annotations?: ToolAnnotations;
      execute: (
        input: Record<string, unknown>,
        options?: ToolExecuteCallbackOptions,
      ) => unknown | Promise<unknown>;
    }

    interface ModelContextRegisterToolOptions {
      signal?: AbortSignal;
      exposedTo?: string[];
    }

    interface ModelContext extends EventTarget {
      registerTool(
        tool: ModelContextTool,
        options?: ModelContextRegisterToolOptions,
      ): Promise<void>;
    }
  }

  interface Document {
    readonly modelContext?: WebMCP.ModelContext;
  }
}
