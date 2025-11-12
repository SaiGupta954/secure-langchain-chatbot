// LangChain memory using ConversationSummaryMemory per session.
// Keeps long-term context compact via LLM summarization.

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ConversationSummaryMemory } from "langchain/memory";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.OPENAI_MODEL || "gpt-4o-mini",
  temperature: 0.3
});

// In-memory store (per server instance). For production, swap with Redis or a DB.
const memoryStore = new Map();

function getMemory(sessionId) {
  if (memoryStore.has(sessionId)) return memoryStore.get(sessionId);
  const memory = new ConversationSummaryMemory({
    llm: model,
    memoryKey: "chat_history",
    returnMessages: true
  });
  memoryStore.set(sessionId, memory);
  return memory;
}

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a concise, helpful assistant. Use the chat history for context."],
  ["placeholder", "chat_history"],
  ["human", "{input}"]
]);

const chain = RunnableSequence.from([
  {
    input: (x) => x.input,
    chat_history: async (x) => x.memory.loadMemoryVariables({}).then(v => v.chat_history || []),
  },
  prompt,
  model,
  new StringOutputParser()
]);

export async function chatWithMemory(sessionId, userMessage) {
  const memory = getMemory(sessionId);
  const response = await chain.invoke({ input: userMessage, memory });
  await memory.saveContext({ input: userMessage }, { output: response });
  return response;
}
