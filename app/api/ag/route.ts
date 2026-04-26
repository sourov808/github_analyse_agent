import { createAgent, tool } from "langchain";
import { NextResponse } from "next/server";

import { ChatGroq } from "@langchain/groq";
import z from "zod";
import { vectorStore } from "@/lib/agents/vector";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const store = await vectorStore();

    const retriveSchema = z.object({ query: z.string() });

    const retrieve = tool(
      async ({ query }) => {
        const retrieveDocs = await store.similaritySearch(query, 5);

        const content = retrieveDocs
          .map((doc) => `FILE: ${doc.metadata.source}\n${doc.pageContent}`)
          .join("\n\n");

        return { content, artifact: retrieveDocs };
      },
      {
        name: "retrieve_context",
        description: "Retrieve relevant code context from the repository",
        schema: retriveSchema,
      },
    );

    const tools = [retrieve];

    const systemPrompt = `You are an expert code analysis assistant helping developers understand GitHub repositories.

CRITICAL RULES - YOU MUST FOLLOW THESE:

1. RETRIEVAL FIRST: ALWAYS use the retrieve_context tool to get relevant code from the repository before answering. Never answer from your training data.

2. STAY GROUNDED: Only answer based on the retrieved context. If context doesn't contain the answer, say "I don't have enough context to answer that" or similar.

3. CITE SOURCES: When referencing code, always mention the file path. Format: "In file: <path>"

4. SHOW CODE: When explaining, include relevant code snippets from the context.

5. BE CONCISE: Provide clear, direct answers. Avoid lengthy explanations unless asked.

6. NO HALLUCINATION: Do not make assumptions about code organization, dependencies, or implementation details not present in context.

7. Structure your responses with:
   - Direct answer first
   - Supporting code snippets (if relevant)
   - File references

If the retrieved context shows multiple implementations, compare them and explain differences.

When analyzing code:
- Explain what the code does
- Highlight key patterns or design decisions
- Point out potential issues if they exist in the code
- Suggest improvements based on best practices visible in the codebase
- use markdown for code formatting
- use bullet points for lists/steps/important points

If asked about architecture, use the file structure and imports to infer relationships.
If asked about "how to" questions, show code examples from the repository.

Remember: You are analyzing ACTUAL CODE from the repository, not generating generic advice. If unsure, say "I don't know" instead of guessing.`;

    const llm = new ChatGroq({
      model: "openai/gpt-oss-120b",
    });

    const agent = createAgent({
      model: llm,
      tools,
      systemPrompt,
    });

    const message = {
      messages: [
        {
          role: "user",
          content: query,
        },
      ],
    };

    const result = await agent.invoke(message);

    const output = result.messages.at(-1)?.content;

    return NextResponse.json({ AI: output });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to load repo" });
  }
}
