import "server-only";
import { api } from "@/lib/api/client";

export type Review = {
  id: number;
  authorName: string;
  rating: number;
  body: string;
  verified: boolean;
  createdAt: string;
};

export type ReviewSummary = {
  average: number;
  count: number;
  items: Review[];
};

export async function getReviews(slug: string): Promise<ReviewSummary> {
  try {
    return await api.get<ReviewSummary>(
      `/products/${encodeURIComponent(slug)}/reviews`,
      { cache: "no-store", noAuth: true },
    );
  } catch (err) {
    console.warn("[reviews] getReviews failed:", (err as Error).message);
    return { average: 0, count: 0, items: [] };
  }
}
