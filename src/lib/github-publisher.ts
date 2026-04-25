import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

type GitHubPublishConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  basePath: string;
  apiVersion: string;
  authorName?: string;
  authorEmail?: string;
};

type GitHubContentEntry = {
  sha: string;
  path: string;
  type: string;
};

export type GitHubPublishStatus = {
  enabled: boolean;
  owner?: string;
  repo?: string;
  branch?: string;
};

export type GitHubSyncInput = {
  commitMessage: string;
  upsertLocalFilePaths?: string[];
  deleteLocalFilePaths?: string[];
};

export type GitHubSyncResult = {
  enabled: boolean;
  createdOrUpdatedPaths: string[];
  deletedPaths: string[];
  repo?: string;
  branch?: string;
};

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

function getGitHubPublishConfig(): GitHubPublishConfig | null {
  const token =
    process.env.GITHUB_CONTENTS_TOKEN?.trim() ||
    process.env.GITHUB_TOKEN?.trim() ||
    "";
  const owner = process.env.GITHUB_REPO_OWNER?.trim() || "";
  const repo = process.env.GITHUB_REPO_NAME?.trim() || "";

  if (!token || !owner || !repo) {
    return null;
  }

  return {
    token,
    owner,
    repo,
    branch: process.env.GITHUB_REPO_BRANCH?.trim() || "main",
    basePath: trimSlashes(process.env.GITHUB_REPO_BASE_PATH?.trim() || ""),
    apiVersion: process.env.GITHUB_API_VERSION?.trim() || "2022-11-28",
    authorName: process.env.GITHUB_COMMIT_AUTHOR_NAME?.trim() || undefined,
    authorEmail: process.env.GITHUB_COMMIT_AUTHOR_EMAIL?.trim() || undefined,
  };
}

export function getGitHubPublishStatus(): GitHubPublishStatus {
  const config = getGitHubPublishConfig();

  if (!config) {
    return {
      enabled: false,
    };
  }

  return {
    enabled: true,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
  };
}

function encodeRepositoryPath(filePath: string) {
  return filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function toRepositoryRelativePath(localFilePath: string) {
  return path.relative(process.cwd(), localFilePath).replace(/\\/g, "/");
}

function buildRepositoryPath(localFilePath: string, config: GitHubPublishConfig) {
  const relativePath = trimSlashes(toRepositoryRelativePath(localFilePath));
  return config.basePath ? `${config.basePath}/${relativePath}` : relativePath;
}

function buildContentUrl(config: GitHubPublishConfig, repositoryPath: string) {
  return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${encodeRepositoryPath(repositoryPath)}`;
}

async function githubRequest(
  config: GitHubPublishConfig,
  repositoryPath: string,
  init?: RequestInit
) {
  return fetch(buildContentUrl(config, repositoryPath), {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": config.apiVersion,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

async function getGitHubContentEntry(
  config: GitHubPublishConfig,
  localFilePath: string
): Promise<GitHubContentEntry | null> {
  const repositoryPath = buildRepositoryPath(localFilePath, config);
  const url = new URL(buildContentUrl(config, repositoryPath));
  url.searchParams.set("ref", config.branch);

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": config.apiVersion,
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`GitHub lookup failed for ${repositoryPath} (${response.status}).`);
  }

  return (await response.json()) as GitHubContentEntry;
}

function getCommitIdentity(config: GitHubPublishConfig) {
  if (!config.authorName || !config.authorEmail) {
    return {};
  }

  return {
    committer: {
      name: config.authorName,
      email: config.authorEmail,
    },
    author: {
      name: config.authorName,
      email: config.authorEmail,
    },
  };
}

async function upsertGitHubFile(
  config: GitHubPublishConfig,
  localFilePath: string,
  commitMessage: string
) {
  const repositoryPath = buildRepositoryPath(localFilePath, config);
  const content = await fs.readFile(localFilePath, "utf8");
  const existingEntry = await getGitHubContentEntry(config, localFilePath);

  const body = {
    message: commitMessage,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: config.branch,
    ...(existingEntry?.sha ? { sha: existingEntry.sha } : {}),
    ...getCommitIdentity(config),
  };

  const response = await githubRequest(config, repositoryPath, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `GitHub publish failed for ${repositoryPath} (${response.status}): ${responseText}`
    );
  }

  return repositoryPath;
}

async function deleteGitHubFile(
  config: GitHubPublishConfig,
  localFilePath: string,
  commitMessage: string
) {
  const repositoryPath = buildRepositoryPath(localFilePath, config);
  const existingEntry = await getGitHubContentEntry(config, localFilePath);

  if (!existingEntry?.sha) {
    return null;
  }

  const response = await githubRequest(config, repositoryPath, {
    method: "DELETE",
    body: JSON.stringify({
      message: commitMessage,
      sha: existingEntry.sha,
      branch: config.branch,
      ...getCommitIdentity(config),
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `GitHub delete failed for ${repositoryPath} (${response.status}): ${responseText}`
    );
  }

  return repositoryPath;
}

export async function syncCmsFilesToGitHub(
  input: GitHubSyncInput
): Promise<GitHubSyncResult> {
  const config = getGitHubPublishConfig();

  if (!config) {
    return {
      enabled: false,
      createdOrUpdatedPaths: [],
      deletedPaths: [],
    };
  }

  const upsertPaths = Array.from(new Set(input.upsertLocalFilePaths ?? []));
  const deletePaths = Array.from(new Set(input.deleteLocalFilePaths ?? []));
  const createdOrUpdatedPaths: string[] = [];
  const deletedPaths: string[] = [];

  for (const localFilePath of upsertPaths) {
    createdOrUpdatedPaths.push(
      await upsertGitHubFile(config, localFilePath, input.commitMessage)
    );
  }

  for (const localFilePath of deletePaths) {
    const deletedPath = await deleteGitHubFile(config, localFilePath, input.commitMessage);
    if (deletedPath) {
      deletedPaths.push(deletedPath);
    }
  }

  return {
    enabled: true,
    createdOrUpdatedPaths,
    deletedPaths,
    repo: `${config.owner}/${config.repo}`,
    branch: config.branch,
  };
}
