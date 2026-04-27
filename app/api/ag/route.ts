
import { NextResponse } from "next/server";

import { ChatGroq } from "@langchain/groq";
import { vectorStore } from "@/lib/agents/vector";

export async function POST(req: Request) {
  try {
    const { query, collectionName } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    // Test Ollama connectivity
    try {
      const res = await fetch("http://localhost:11434/api/tags", {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`Ollama ${res.status}`);
    } catch {
      return NextResponse.json(
        { error: "Ollama not running. Start with: ollama serve" },
        { status: 503 },
      );
    }

    const store = await vectorStore(collectionName);



    const systemPrompt = `You are an expert developer explaining a codebase.

RULES:
1. Base all your answers ONLY on the retrieved files and context provided below.
2. Do NOT hallucinate features, databases, or APIs not present in the context.
3. Keep explanations clear, well-structured, and concise.

FORMAT:
- Provide a high-level overview.
- Group the architecture cleanly into Frontend, Backend, and Other.
- Always cite the specific file paths you are referencing.
`;
    const llm = new ChatGroq({
      model: "openai/gpt-oss-120b",
      maxTokens: 4096,
      temperature: 0.2,
    });

    // 1. Deterministic RAG Retrieval
    const docs = await store.similaritySearch(query, 3);
    const retrievedContext = docs.length === 0 
      ? "No files found for this query."
      : docs.map((d) => `FILE: ${d.metadata.source}\nCONTENT: ${d.pageContent.slice(0, 1500)}...`).join("\n\n");

    const fullPrompt = `${systemPrompt}\n\n==========\nRETRIEVED CONTEXT:\n${retrievedContext}\n==========`;

    // 2. Direct LLM Invocation (Bypassing Agent Recursion Loops)
    const result = await llm.invoke([
      { role: "system", content: fullPrompt },
      { role: "user", content: query }
    ]);

    // 3. Extract output safely
    let content = "";
    if (typeof result.content === "string") {
      content = result.content;
    } else if (Array.isArray(result.content)) {
      content = result.content.map((c: any) => c.text || "").join("");
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("[AGENT] Fatal:", error);
    return NextResponse.json(
      { error: "Agent error", details: String(error) },
      { status: 500 },
    );
  }
}
