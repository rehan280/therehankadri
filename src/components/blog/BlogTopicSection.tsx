import { type BlogCategory, type BlogPost } from "@/lib/blog";
import BlogTopicSectionClient from "./BlogTopicSectionClient";
import BlogTopicSectionContent from "./BlogTopicSectionContent";

type BlogTopicSectionProps = {
  category: BlogCategory;
  eyebrow: string;
  description: string;
  posts: BlogPost[];
};

function getPrimaryTags(posts: BlogPost[]) {
  const values = new Set<string>();

  posts.forEach((post) => {
    const primaryTag = post.subcategories[0];
    if (primaryTag) {
      values.add(primaryTag);
    }
  });

  return Array.from(values);
}

export default function BlogTopicSection({
  category,
  eyebrow,
  description,
  posts,
}: BlogTopicSectionProps) {
  const primaryTags = getPrimaryTags(posts);
  const tags = ["All", ...primaryTags];

  if (primaryTags.length <= 1) {
    return (
      <BlogTopicSectionContent
        category={category}
        eyebrow={eyebrow}
        description={description}
        posts={posts}
        tags={tags}
        activeTag="All"
        showFilters={false}
      />
    );
  }

  return (
    <BlogTopicSectionClient
      category={category}
      eyebrow={eyebrow}
      description={description}
      posts={posts}
      tags={tags}
    />
  );
}
