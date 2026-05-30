import type { Metadata } from "next";
import GenericToolPage, { generateGenericToolMetadata } from "../_generic/GenericToolPage";
import { toolDefinition } from "./tool";

export function generateMetadata(): Promise<Metadata> {
  return generateGenericToolMetadata(toolDefinition.slug);
}

export default function Page() {
  return <GenericToolPage toolSlug={toolDefinition.slug} />;
}
