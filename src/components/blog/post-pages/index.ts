import "server-only";

import { access } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { BlogPostModule } from "./types";

async function hasPostModuleFile(slug: string) {
  try {
    await access(path.join(process.cwd(), "src", "components", "blog", "post-pages", `${slug}.tsx`));
    return true;
  } catch {
    return false;
  }
}

const loadBlogPostModule = cache(async (slug: string): Promise<BlogPostModule | undefined> => {
  if (!(await hasPostModuleFile(slug))) {
    return undefined;
  }

  const module = await import(`./${slug}`);
  return module.default satisfies BlogPostModule;
});

export async function getBlogPostModule(slug: string) {
  return loadBlogPostModule(slug);
}

export type { BlogPostHeadingItem, BlogPostModule } from "./types";
