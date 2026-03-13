import type { BookEditorValues, MovieEditorValues, TravelEditorValues } from "@/lib/types/items";
import type { MetadataCandidate } from "@/lib/metadata/schemas";

function joinTags(tags: string[]) {
  return tags.join(", ");
}

export function mapMetadataCandidateToBookPatch(candidate: MetadataCandidate): Partial<BookEditorValues> {
  if (candidate.kind !== "book") {
    return {};
  }

  return {
    title: candidate.title,
    author: candidate.author ?? "",
    summary: candidate.summary ?? "",
    tags: joinTags(candidate.tags)
  };
}

export function mapMetadataCandidateToMoviePatch(candidate: MetadataCandidate): Partial<MovieEditorValues> {
  if (candidate.kind !== "movie") {
    return {};
  }

  return {
    title: candidate.title,
    director: candidate.director ?? "",
    releaseYear: candidate.releaseYear ?? "",
    platform: candidate.platform ?? "",
    note: candidate.note ?? "",
    tags: joinTags(candidate.tags)
  };
}

export function mapMetadataCandidateToTravelPatch(candidate: MetadataCandidate): Partial<TravelEditorValues> {
  if (candidate.kind !== "travel") {
    return {};
  }

  return {
    placeName: candidate.title,
    country: candidate.country ?? "",
    city: candidate.city ?? "",
    description: candidate.description ?? ""
  };
}
