// Server-only analytics data layer. Calls the Express backend (admin-gated).
import "server-only";
import { api } from "@/lib/api/client";

export type AnalyticsData = {
  days: number;
  totals: { views: number; visitors: number; today: number; online: number };
  series: { day: string; views: number; visitors: number }[];
  topPages: { path: string; views: number }[];
  topCountries: { country: string; views: number }[];
  devices: { device: string; views: number }[];
};

export async function getAnalytics(days = 30): Promise<AnalyticsData | null> {
  try {
    return await api.get<AnalyticsData>(`/admin/analytics?days=${days}`, {
      cache: "no-store",
    });
  } catch (err) {
    console.warn("[analytics] fetch failed:", (err as Error).message);
    return null;
  }
}
