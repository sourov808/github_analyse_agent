import { loadRepo } from "@/lib/agents/load_repo";
import { splitVector } from "@/lib/agents/split_vector";
import { vectorStore } from "@/lib/agents/vector";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { repoUrl, collectionName } = await req.json();
    const docs = await loadRepo(repoUrl);
    const chunks = await splitVector(docs);

    const store = await vectorStore(collectionName);

    const batch_size = 50;

    for (let i = 0; i < chunks.length; i += batch_size) {
      const batch = chunks.slice(i, i + batch_size);
      await store.addDocuments(batch);
    }

    return NextResponse.json({
      status: 200,
      message: "Repo loaded successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ status: 500, error: "Failed to load repo" });
  }
}
