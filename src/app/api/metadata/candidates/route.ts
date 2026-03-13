import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { searchMetadataCandidates } from "@/lib/metadata/service";
import { metadataRouteRequestSchema, metadataRouteResponseSchema } from "@/lib/metadata/schemas";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          candidates: [],
          autoApplyCandidateId: null,
          reason: null
        },
        { status: 401 }
      );
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        {
          status: "error",
          candidates: [],
          autoApplyCandidateId: null,
          reason: null
        },
        { status: 400 }
      );
    }

    const parsed = metadataRouteRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          status: "error",
          candidates: [],
          autoApplyCandidateId: null,
          reason: null
        },
        { status: 400 }
      );
    }

    const result = await searchMetadataCandidates(parsed.data);
    const response = metadataRouteResponseSchema.parse(result);

    return NextResponse.json(response);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[metadata-route] unhandled error", error);
    }

    return NextResponse.json(
      {
        status: "error",
        candidates: [],
        autoApplyCandidateId: null,
        reason: "upstream_error"
      },
      { status: 500 }
    );
  }
}
