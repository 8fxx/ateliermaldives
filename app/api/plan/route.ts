import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { RunnerProfileSchema, TrainingPlanSchema, goalLabels, type RunnerProfile } from "@/lib/plan";
import { isMember } from "@/lib/stripe";

export const maxDuration = 300;

const SYSTEM_PROMPT = `You are the head coach of Equatra Run Club, a virtual run club whose members train across the Maldives and around the world.

Write a personalised running plan for the runner described. Build mileage conservatively (no more than ~10% week over week, with a lighter week every third or fourth week), respect the number of days they can run, and match intensity to their experience. If they are new, favour run/walk and easy effort. If a race date is given, taper into it.

Give paces as min/km ranges derived from their recent race or experience, and include effort cues (RPE or "conversational") so the plan still works without a watch. Every day of the week appears in each week's sessions; days without running are "Rest" or "Strength" with distanceKm 0.

Keep the voice warm, concise and specific. No medical claims; if their notes mention injury or illness, recommend seeing a professional before starting.`;

function weeksFor(profile: RunnerProfile, member: boolean) {
  if (!member) return 1;
  if (profile.raceDate) {
    const weeks = Math.ceil((new Date(profile.raceDate).getTime() - Date.now()) / (7 * 24 * 3600 * 1000));
    if (Number.isFinite(weeks)) return Math.min(Math.max(weeks, 4), 16);
  }
  return 12;
}

export async function POST(req: Request) {
  const parsedProfile = RunnerProfileSchema.safeParse(await req.json().catch(() => null));
  if (!parsedProfile.success) {
    return NextResponse.json({ error: "Please complete your runner profile." }, { status: 400 });
  }
  const profile = parsedProfile.data;
  const member = await isMember();
  const weeks = weeksFor(profile, member);

  const runner = [
    `Name: ${profile.name}`,
    `Goal: ${goalLabels[profile.goal]}`,
    `Experience: ${profile.experience}`,
    `Current volume: ${profile.weeklyKm} km/week`,
    `Days available per week: ${profile.daysPerWeek}`,
    profile.raceDate && `Race date: ${profile.raceDate} (today is ${new Date().toISOString().slice(0, 10)})`,
    profile.recentRace && `Recent race result: ${profile.recentRace}`,
    profile.notes && `Notes from the runner: ${profile.notes}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(TrainingPlanSchema) },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `<runner>\n${runner}\n</runner>\n\nWrite weeks 1 through ${weeks} of their plan.`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "Our coach couldn't write a plan from that profile. Try editing your notes." },
        { status: 422 },
      );
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return NextResponse.json({ error: "The plan came back incomplete. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ plan: response.parsed_output, member, preview: !member });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic auth failed. Is ANTHROPIC_API_KEY set?");
      return NextResponse.json({ error: "The AI coach isn't configured yet." }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Our coach is busy. Try again in a minute." }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
      return NextResponse.json({ error: "Something went wrong writing your plan." }, { status: 502 });
    }
    // Client-side failures, e.g. no ANTHROPIC_API_KEY or `ant auth login` profile configured
    console.error("Plan generation failed:", error);
    return NextResponse.json({ error: "The AI coach isn't available right now." }, { status: 503 });
  }
}
