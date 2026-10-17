import { z } from "zod";

export const RunnerProfileSchema = z.object({
  name: z.string().trim().min(1).max(60),
  goal: z.enum(["first-5k", "10k", "half-marathon", "marathon", "general-fitness"]),
  experience: z.enum(["new", "casual", "regular", "competitive"]),
  weeklyKm: z.number().min(0).max(250),
  daysPerWeek: z.number().int().min(2).max(7),
  raceDate: z.string().max(20).optional(),
  recentRace: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
});

export type RunnerProfile = z.infer<typeof RunnerProfileSchema>;

const SessionSchema = z.object({
  day: z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]),
  type: z.enum(["Easy", "Long", "Tempo", "Intervals", "Hills", "Recovery", "Strength", "Rest"]),
  title: z.string(),
  distanceKm: z.number(),
  details: z.string().describe("Warm-up, main set and cool-down, with paces or effort cues"),
});

export const TrainingPlanSchema = z.object({
  summary: z.string().describe("Two or three sentences on the plan's approach for this runner"),
  paceGuide: z.array(z.object({ zone: z.string(), pace: z.string(), feel: z.string() })),
  weeks: z.array(
    z.object({
      week: z.number().int(),
      focus: z.string(),
      totalKm: z.number(),
      sessions: z.array(SessionSchema),
    }),
  ),
  islandTips: z.array(z.string()).describe("Heat, humidity and hydration tips for running in the tropics"),
});

export type TrainingPlan = z.infer<typeof TrainingPlanSchema>;

export const goalLabels: Record<RunnerProfile["goal"], string> = {
  "first-5k": "First 5K",
  "10k": "10K",
  "half-marathon": "Half marathon",
  marathon: "Marathon",
  "general-fitness": "General fitness",
};

export const PROFILE_STORAGE_KEY = "atelier.runner";
export const PLAN_STORAGE_KEY = "atelier.plan";
