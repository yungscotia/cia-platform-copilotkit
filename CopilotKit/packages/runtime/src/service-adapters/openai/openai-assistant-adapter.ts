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
import { RunSubmitToolOutputsStreamParams } from "openai/resources/beta/threads/runs/runs";
import { RuntimeEventSource } from "../events";
import { ActionInput } from "../../graphql/inputs/action.input";
import { AssistantStreamEvent, AssistantTool } from "openai/resources/beta/assistants";
import { ForwardedParametersInput } from "../../graphql/inputs/forwarded-parameters.input";
import {Stream} from "openai/streaming";

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

  /**
   * Whether to keep the role in system messages as "System".
   * By default, it is converted to "developer", which is used by newer OpenAI models
   *
   * @default false
   */
  keepSystemRole?: boolean;
}

export class OpenAIAssistantAdapter implements CopilotServiceAdapter {
  private openai: OpenAI;
  private codeInterpreterEnabled: boolean;
  private assistantId: string;
  private fileSearchEnabled: boolean;
  private disableParallelToolCalls: boolean;
  private keepSystemRole: boolean = false;

  constructor(params: OpenAIAssistantAdapterParams) {
    this.openai = params.openai || new OpenAI({});
    this.codeInterpreterEnabled =
        params.codeInterpreterEnabled !== undefined ? params.codeInterpreterEnabled : true;
    this.fileSearchEnabled =
        params.fileSearchEnabled !== undefined ? params.fileSearchEnabled : true;
    this.assistantId = params.assistantId;
    this.disableParallelToolCalls = params?.disableParallelToolCalls || false;
    this.keepSystemRole = params?.keepSystemRole ?? false;
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
    const toolOutputs: RunSubmitToolOutputsStreamParams.ToolOutput[] = resultMessages.map(
        (message) => {
          return {
            tool_call_id: message.actionExecutionId,
            output: message.result,
          };
        },
    );

    const stream = await this.openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
      tool_outputs: toolOutputs,
      stream: true,
      ...(this.disableParallelToolCalls && { parallel_tool_calls: false }),
    });

    await this.streamResponse(stream, eventSource);
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
        .map((m) => convertMessageToOpenAIMessage(m, { keepSystemRole: this.keepSystemRole }))
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
    let stream = await this.openai.beta.threads.runs.create(threadId, {
      assistant_id: this.assistantId,
      stream: true,
      instructions,
      ...(tools.length > 0 && { tools }),
      ...(forwardedParameters?.maxTokens && {
        max_completion_tokens: forwardedParameters.maxTokens,
      }),
      ...(this.disableParallelToolCalls && { parallel_tool_calls: false }),
    });

    const [stream1, stream2] = stream.tee();

    await this.streamResponse(stream1, eventSource);

    return getRunIdFromStream(stream2);
  }

  private async streamResponse(
      stream: Stream<AssistantStreamEvent> & {
        _request_id?: string | null;
      },
      eventSource: RuntimeEventSource,
  ) {
    eventSource.stream(async (eventStream$) => {
      let inFunctionCall = false;
      let currentMessageId: string;
      let currentToolCallId: string;

      for await (const chunk of stream) {
        switch (chunk.event) {
          case "thread.message.created":
            if (inFunctionCall) {
              eventStream$.sendActionExecutionEnd({ actionExecutionId: currentToolCallId });
            }
            currentMessageId = chunk.data.id;
            eventStream$.sendTextMessageStart({ messageId: currentMessageId });
            break;
          case "thread.message.delta":
            if (chunk.data.delta.content?.[0].type === "text") {
              eventStream$.sendTextMessageContent({
                messageId: currentMessageId,
                content: chunk.data.delta.content?.[0].text.value,
              });
            }
            break;
          case "thread.message.completed":
            eventStream$.sendTextMessageEnd({ messageId: currentMessageId });
            break;
          case "thread.run.step.delta":
            let toolCallId: string | undefined;
            let toolCallName: string | undefined;
            let toolCallArgs: string | undefined;
            if (
                chunk.data.delta.step_details.type === "tool_calls" &&
                chunk.data.delta.step_details.tool_calls?.[0].type === "function"
            ) {
              toolCallId = chunk.data.delta.step_details.tool_calls?.[0].id;
              toolCallName = chunk.data.delta.step_details.tool_calls?.[0].function.name;
              toolCallArgs = chunk.data.delta.step_details.tool_calls?.[0].function.arguments;
            }

            if (toolCallName && toolCallId) {
              if (inFunctionCall) {
                eventStream$.sendActionExecutionEnd({ actionExecutionId: currentToolCallId });
              }
              inFunctionCall = true;
              currentToolCallId = toolCallId;
              eventStream$.sendActionExecutionStart({
                actionExecutionId: currentToolCallId,
                parentMessageId: chunk.data.id,
                actionName: toolCallName,
              });
            } else if (toolCallArgs) {
              eventStream$.sendActionExecutionArgs({
                actionExecutionId: currentToolCallId,
                args: toolCallArgs,
              });
            }
            break;
        }
      }
      if (inFunctionCall) {
        eventStream$.sendActionExecutionEnd({ actionExecutionId: currentToolCallId });
      }
      eventStream$.complete();
    });
  }
}

async function getRunIdFromStream(
    stream: Stream<AssistantStreamEvent> & { _request_id?: string | null },
): Promise<string> {

  for await (const event of stream) {
    if (event.event === "thread.run.created") {
      return event.data.id;
    }
  }
}