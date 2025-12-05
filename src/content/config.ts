import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    summary: z.string().max(140),
    tags: z.array(z.string()).default([]), // TODO: remove
    languageTags: z.array(z.string()).default([]),
    toolTags: z.array(z.string()).default([]),
    domainTags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    repo: z.string().url().optional(),
    website: z.string().url().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  projects,
};
