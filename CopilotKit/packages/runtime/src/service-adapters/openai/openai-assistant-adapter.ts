/**
 * Copilot Runtime adapter for the OpenAI Assistant API.
 *
 * ## Example
 *
 * ```ts
 * import { CopilotRuntime, OpenAIAssistantAdapter } from "@copilotkit/runtime";
 * import OpenAI from "openai";
 *
 * const copilotKit = new CopilotRuntime();
 *
 * const openai = new OpenAI({
 *   organization: "<your-organization-id>",
 *   apiKey: "<your-api-key>",
 * });
 *
 * return new OpenAIAssistantAdapter({
 *   openai,
 *   assistantId: "<your-assistant-id>",
 *   codeInterpreterEnabled: true,
 *   fileSearchEnabled: true,
 * });
 * ```
 */
import OpenAI from "openai";
import {
  CopilotServiceAdapter,
  CopilotRuntimeChatCompletionRequest,
  CopilotRuntimeChatCompletionResponse,
} from "../service-adapter";
import { Message, ResultMessage, TextMessage } from "../../graphql/types/converted";
import {
  convertActionInputToOpenAITool,
  convertMessageToOpenAIMessage,
  convertSystemMessageToAssistantAPI,
} from "./utils";
import { RuntimeEventSource } from "../events";
import { ActionInput } from "../../graphql/inputs/action.input";
import { AssistantStreamEvent, AssistantTool } from "openai/resources/beta/assistants";
import { ForwardedParametersInput } from "../../graphql/inputs/forwarded-parameters.input";

export interface OpenAIAssistantAdapterParams {
  /**
   * The ID of the assistant to use.
   */
  assistantId: string;

  /**
   * An optional OpenAI instance to use. If not provided, a new instance will be created.
   */
  openai?: OpenAI;

  /**
   * Whether to enable code interpretation.
   * @default true
   */
  codeInterpreterEnabled?: boolean;

  /**
   * Whether to enable file search.
   * @default true
   */
  fileSearchEnabled?: boolean;

  /**
   * Whether to disable parallel tool calls.
   * You can disable parallel tool calls to force the model to execute tool calls sequentially.
   * This is useful if you want to execute tool calls in a specific order so that the state changes
   * introduced by one tool call are visible to the next tool call. (i.e. new actions or readables)
   *
   * @default false
   */
  disableParallelToolCalls?: boolean;
}

export class OpenAIAssistantAdapter implements CopilotServiceAdapter {
  private openai: OpenAI;
  private codeInterpreterEnabled: boolean;
  private assistantId: string;
  private fileSearchEnabled: boolean;
  private disableParallelToolCalls: boolean;

  constructor(params: OpenAIAssistantAdapterParams) {
    this.openai = params.openai || new OpenAI({});
    this.codeInterpreterEnabled = params.codeInterpreterEnabled !== undefined ? params.codeInterpreterEnabled : true;
    this.fileSearchEnabled = params.fileSearchEnabled !== undefined ? params.fileSearchEnabled : true;
    this.assistantId = params.assistantId;
    this.disableParallelToolCalls = params?.disableParallelToolCalls || false;
  }

  async process(
    request: CopilotRuntimeChatCompletionRequest,
  ): Promise<CopilotRuntimeChatCompletionResponse> {
    const { messages, actions, eventSource, runId, forwardedParameters } = request;

    // if we don't have a threadId, create a new thread
    let threadId = request.extensions?.openaiAssistantAPI?.threadId;

    if (!threadId) {
      threadId = (await this.openai.beta.threads.create()).id;
    }

    const lastMessage = messages.at(-1);

    let nextRunId: string | undefined = undefined;

    console.log("Processing messages:", JSON.stringify(messages, null, 2));

    // submit function outputs
    if (lastMessage.isResultMessage() && runId) {
      nextRunId = await this.submitToolOutputs(threadId, runId, messages, eventSource);
    }
    // submit user message
    else if (lastMessage.isTextMessage()) {
      nextRunId = await this.submitUserMessage(
        threadId,
        messages,
        actions,
        eventSource,
        forwardedParameters,
      );
    }
    // unsupported message
    else {
      throw new Error("No actionable message found in the messages");
    }

    return {
      runId: nextRunId,
      threadId,
      extensions: {
        ...request.extensions,
        openaiAssistantAPI: {
          threadId: threadId,
          runId: nextRunId,
        },
      },
    };
  }

  private async submitToolOutputs(
    threadId: string,
    runId: string,
    messages: Message[],
    eventSource: RuntimeEventSource,
  ) {
    let run = await this.openai.beta.threads.runs.retrieve(threadId, runId);

    if (!run.required_action) {
      throw new Error("No tool outputs required");
    }

    // get the required tool call ids
    const toolCallsIds = run.required_action.submit_tool_outputs.tool_calls.map(
      (toolCall) => toolCall.id,
    );

    // search for these tool calls
    const resultMessages = messages.filter(
      (message) => message.isResultMessage() && toolCallsIds.includes(message.actionExecutionId),
    ) as ResultMessage[];

    if (toolCallsIds.length != resultMessages.length) {
      throw new Error("Number of function results does not match the number of tool calls");
    }

    // submit the tool outputs
    const toolOutputs = resultMessages.map(
      (message) => {
        return {
          tool_call_id: message.actionExecutionId,
          output: message.result,
        };
      },
    );

    console.log("Submitting tool outputs", toolOutputs);

    // Replace streaming with non-streaming API
    const run_result = await this.openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
      tool_outputs: toolOutputs,
      ...(this.disableParallelToolCalls && { parallel_tool_calls: false }),
    });

    // Process the run and generate events
    await this.processRun(threadId, run.id, eventSource);
    
    return runId;
  }

  private async submitUserMessage(
    threadId: string,
    messages: Message[],
    actions: ActionInput[],
    eventSource: RuntimeEventSource,
    forwardedParameters: ForwardedParametersInput,
  ) {
    messages = [...messages];

    // get the instruction message
    const instructionsMessage = messages.shift();
    const instructions = instructionsMessage.isTextMessage() ? instructionsMessage.content : "";

    // get the latest user message
    const userMessage = messages
      .map((m) => convertMessageToOpenAIMessage(m))
      .map(convertSystemMessageToAssistantAPI)
      .at(-1);

    if (userMessage.role !== "user") {
      throw new Error("No user message found");
    }

    await this.openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage.content,
    });

    const openaiTools = actions.map(convertActionInputToOpenAITool);

    const tools = [
      ...openaiTools,
      ...(this.codeInterpreterEnabled ? [{ type: "code_interpreter" } as AssistantTool] : []),
      ...(this.fileSearchEnabled ? [{ type: "file_search" } as AssistantTool] : []),
    ];

    // Replace streaming with non-streaming API
    const run = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: this.assistantId,
      instructions,
      ...(tools.length > 0 && { tools }),
      ...(forwardedParameters?.maxTokens && {
        max_completion_tokens: forwardedParameters.maxTokens,
      }),
      ...(this.disableParallelToolCalls && { parallel_tool_calls: false }),
    });

    // Process the run and generate events
    await this.processRun(threadId, run.id, eventSource);

    return run.id;
  }

  // New method to process a completed run and send events
  private async processRun(threadId: string, runId: string, eventSource: RuntimeEventSource) {
    return eventSource.stream(async (eventStream$) => {

      let run;
      let completed = false;
      const terminalStatuses = ["completed", "requires_action", "cancelled", "failed", "expired"];
      while (!completed) {
        run = await this.openai.beta.threads.runs.retrieve(threadId, runId);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        completed = terminalStatuses.includes(run.status);
      }

      // Process the run steps
      const runSteps = await this.openai.beta.threads.runs.steps.list(threadId, run.id, { order: "asc" });
      
      for (const step of runSteps.data) {
        if (step.step_details.type === 'tool_calls') {
          for (const toolCall of step.step_details.tool_calls) {
            if (toolCall.type === 'function') {
              const actionExecutionId = toolCall.id;
              const actionName = toolCall.function.name;
              const args = toolCall.function.arguments;
              

              eventStream$.sendActionExecution({
                actionExecutionId,
                actionName,
                args,
                parentMessageId: step.id
              });
              
              // If there's output (for completed tool calls)
              if (toolCall.function.output) {
                eventStream$.sendActionExecutionResult({
                  actionExecutionId,
                  actionName,
                  result: toolCall.function.output
                });
              }
            }
          }
        } else if (step.step_details.type === 'message_creation') {
          // Handle message creation steps
          const messageId = step.step_details.message_creation.message_id;
          eventStream$.sendTextMessageStart({ messageId });

          const message = await this.openai.beta.threads.messages.retrieve(threadId, messageId);
          
          // Process the content of the message
          for (const content of message.content) {
            if (content.type === 'text') {
              eventStream$.sendTextMessageContent({
                messageId,
                content: content.text.value
              });
            }
          }
          
          eventStream$.sendTextMessageEnd({ messageId });
        }
      }
      
      eventStream$.complete();
    });
  }
}