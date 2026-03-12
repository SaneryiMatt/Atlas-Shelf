import { createHash } from "node:crypto";

import { and, eq, inArray, notInArray } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { projectNotes, projectTags, tags } from "@/lib/db/schema";

type TransactionClient = Parameters<Parameters<NonNullable<typeof db>["transaction"]>[0]>[0];

function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "tag";
}

function buildTagSlug(name: string) {
  return `${slugify(name)}-${createHash("sha1").update(name).digest("hex").slice(0, 6)}`;
}

export async function syncProjectTags(tx: TransactionClient, projectId: string, tagNames: string[]) {
  if (!tagNames.length) {
    await tx.delete(projectTags).where(eq(projectTags.projectId, projectId));
    return;
  }

  await tx
    .insert(tags)
    .values(
      tagNames.map((tagName) => ({
        name: tagName,
        slug: buildTagSlug(tagName)
      }))
    )
    .onConflictDoNothing({ target: tags.name });

  const tagRecords = await tx
    .select({
      id: tags.id
    })
    .from(tags)
    .where(inArray(tags.name, tagNames));

  const tagIds = tagRecords.map((tagRecord) => tagRecord.id);

  if (!tagIds.length) {
    await tx.delete(projectTags).where(eq(projectTags.projectId, projectId));
    return;
  }

  await tx
    .delete(projectTags)
    .where(and(eq(projectTags.projectId, projectId), notInArray(projectTags.tagId, tagIds)));

  await tx
    .insert(projectTags)
    .values(
      tagIds.map((tagId) => ({
        projectId,
        tagId
      }))
    )
    .onConflictDoNothing({
      target: [projectTags.projectId, projectTags.tagId]
    });
}

export async function syncManagedNote(
  tx: TransactionClient,
  input: {
    projectId: string;
    title: string;
    type: "general" | "planning" | "memory";
    body: string | null;
  }
) {
  const body = input.body?.trim() ?? "";

  const [existingNote] = await tx
    .select({
      id: projectNotes.id
    })
    .from(projectNotes)
    .where(and(eq(projectNotes.projectId, input.projectId), eq(projectNotes.title, input.title)))
    .limit(1);

  if (!body) {
    if (existingNote) {
      await tx.delete(projectNotes).where(eq(projectNotes.id, existingNote.id));
    }

    return;
  }

  const timestamp = new Date();

  if (existingNote) {
    await tx
      .update(projectNotes)
      .set({
        type: input.type,
        body,
        recordedAt: timestamp,
        updatedAt: timestamp
      })
      .where(eq(projectNotes.id, existingNote.id));

    return;
  }

  await tx.insert(projectNotes).values({
    projectId: input.projectId,
    title: input.title,
    type: input.type,
    body,
    recordedAt: timestamp,
    updatedAt: timestamp
  });
}
