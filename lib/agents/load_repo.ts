import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";

export async function loadRepo(repoUrl: string) {
  const loader = new GithubRepoLoader(repoUrl, {
    branch: "main",
    accessToken: process.env.GITHUB_ACCESS_TOKEN,
    recursive: true,
    maxConcurrency: 5,
    ignoreFiles: ["node_modules", "dist", "build", ".next", ".env"],
    ignorePaths: ["*.md", "*.txt"],
  });

  const docs = await loader.load();

  const filteredDocs = docs.filter((doc) => {
    const path = doc.metadata.source;

    return (
      path.endsWith(".ts") || path.endsWith(".tsx") || path.endsWith(".js")
    );
  });
  console.log(filteredDocs.length);
  return filteredDocs;
}
