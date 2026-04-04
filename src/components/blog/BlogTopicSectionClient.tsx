"use client";

import { useMemo, useState } from "react";
import { type BlogCategory, type BlogPost } from "@/lib/blog";
import BlogTopicSectionContent from "./BlogTopicSectionContent";

type BlogTopicSectionClientProps = {
  category: BlogCategory;
  eyebrow: string;
  description: string;
  posts: BlogPost[];
  tags: string[];
};

export default function BlogTopicSectionClient({
  category,
  eyebrow,
  description,
  posts,
  tags,
}: BlogTopicSectionClientProps) {
  const [activeTag, setActiveTag] = useState("All");

  const filteredPosts = useMemo(() => {
    if (activeTag === "All") return posts;
    return posts.filter((post) => post.subcategories[0] === activeTag);
  }, [activeTag, posts]);

  return (
    <BlogTopicSectionContent
      category={category}
      eyebrow={eyebrow}
      description={description}
      posts={filteredPosts}
      tags={tags}
      activeTag={activeTag}
      onSelectTag={setActiveTag}
      showFilters
    />
  );
}
