import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/ollama";

export async function vectorStore() {
  const embeddings = new OllamaEmbeddings({
    model: "mxbai-embed-large:latest",
    baseUrl: "http://localhost:11434",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      collectionName: "github-analyzer",
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    },
  );

  return vectorStore;
}
