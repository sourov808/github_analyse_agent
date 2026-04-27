import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/ollama";

export async function vectorStore(collectionName?: string) {
  const name = collectionName || "github-analyzer";
  console.log("[VECTOR] Initializing vector store for collection:", name);

  const embeddings = new OllamaEmbeddings({
    model: "mxbai-embed-large:latest",
    baseUrl: "http://localhost:11434",
  });

  const config = {
    collectionName: name,
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  };

  try {
    // Try connecting to existing collection
    console.log("[VECTOR] Attempting to connect to existing collection:", name);
    return await QdrantVectorStore.fromExistingCollection(embeddings, config);
  } catch (error) {
    // Log detailed error info
    const err = error as Error & { status?: number; code?: number };
    console.error("[VECTOR] Error connecting to collection:", {
      message: err.message,
      status: err.status,
      code: err.code,
      stack: err.stack,
    });

    const isNotFound =
      err.status === 404 ||
      err.code === 404 ||
      err.message?.toLowerCase().includes("collection not found") ||
      err.message?.toLowerCase().includes("not found");

    if (isNotFound) {
      console.log("[VECTOR] Collection not found, creating new collection:", name);
      try {
        return await QdrantVectorStore.fromDocuments([], embeddings, config);
      } catch (createErr) {
        console.error("[VECTOR] Failed to create collection:", createErr);
        throw createErr;
      }
    }

    // Re-throw other errors
    console.error("[VECTOR] Unexpected error, re-throwing:", error);
    throw error;
  }
}
