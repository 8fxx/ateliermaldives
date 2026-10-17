"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PLAN_STORAGE_KEY, PROFILE_STORAGE_KEY, goalLabels, type RunnerProfile, type TrainingPlan } from "@/lib/plan";

type Stored = { plan: TrainingPlan; preview: boolean };

const typeColors: Record<string, string> = {
  Easy: "bg-lagoon/10 text-lagoon",
  Recovery: "bg-lagoon/10 text-lagoon",
  Long: "bg-ink text-salt",
  Tempo: "bg-coral/15 text-coral",
  Intervals: "bg-coral text-salt",
  Hills: "bg-coral/15 text-coral",
  Strength: "bg-line text-ink",
  Rest: "bg-transparent text-mute border border-line",
};

export default function PlanPage() {
  return (
    <Suspense>
      <Plan />
    </Suspense>
  );
}

function Plan() {
  const params = useSearchParams();
  const [profile, setProfile] = useState<RunnerProfile | null>(null);
  const [data, setData] = useState<Stored | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const started = useRef(false);

  const generate = useCallback(async (p: RunnerProfile) => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...p,
          raceDate: p.raceDate || undefined,
          recentRace: p.recentRace || undefined,
          notes: p.notes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      const stored = { plan: json.plan, preview: json.preview };
      setData(stored);
      try {
        localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(stored));
      } catch {}
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let p: RunnerProfile | null = null;
    let saved: Stored | null = null;
    try {
      p = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) ?? "null");
      saved = JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) ?? "null");
    } catch {}
    setProfile(p);
    // Regenerate after joining, after upgrading, or when nothing is cached yet
    const upgraded = params.get("welcome") === "1" && saved?.preview;
    if (p && (params.get("generate") === "1" || upgraded || !saved)) generate(p);
    else setData(saved);
  }, [generate, params]);

  if (!profile && status !== "loading") {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-6xl">Your plan starts here.</h1>
        <p className="mt-4 text-mute">Join the run club and tell our coach about your running first.</p>
        <Link href="/club" className="btn-dark mt-8">
          Join the run club
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
      {params.get("welcome") === "1" && (
        <p className="mb-8 rounded-2xl bg-lagoon px-5 py-4 text-sm text-salt">
          Welcome to Atelier Pace. Your full plan is being written now.
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-mute">
            {profile && `${goalLabels[profile.goal]} · ${profile.daysPerWeek} days a week`}
          </p>
          <h1 className="mt-3 font-serif text-6xl leading-none">
            {profile?.name ? `${profile.name}'s plan` : "Your plan"}
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href="/club" className="btn-light">
            Edit profile
          </Link>
          {profile && (
            <button className="btn-dark" onClick={() => generate(profile)} disabled={status === "loading"}>
              Regenerate
            </button>
          )}
        </div>
      </div>

      {status === "loading" && (
        <div className="mt-16 rounded-3xl bg-salt p-12 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-line border-t-lagoon" />
          <p className="mt-6 font-serif text-3xl italic">Your coach is writing your plan…</p>
          <p className="mt-2 text-sm text-mute">This usually takes under a minute.</p>
        </div>
      )}

      {status === "error" && (
        <div className="mt-12 rounded-2xl border border-coral/40 bg-coral/10 p-6 text-sm">
          {error}{" "}
          {profile && (
            <button className="underline" onClick={() => generate(profile)}>
              Try again
            </button>
          )}
        </div>
      )}

      {status !== "loading" && data && <PlanView {...data} />}
    </section>
  );
}

function PlanView({ plan, preview }: Stored) {
  return (
    <>
      <p className="mt-8 max-w-3xl text-lg leading-relaxed">{plan.summary}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plan.paceGuide.map((z) => (
          <div key={z.zone} className="rounded-2xl bg-salt p-5">
            <p className="eyebrow text-mute">{z.zone}</p>
            <p className="mt-2 font-serif text-3xl">{z.pace}</p>
            <p className="mt-1 text-sm text-mute">{z.feel}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-10">
        {plan.weeks.map((w) => (
          <div key={w.week}>
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <h2 className="font-serif text-3xl">
                Week {w.week} <span className="italic text-mute">· {w.focus}</span>
              </h2>
              <span className="shrink-0 text-sm text-mute">{w.totalKm} km</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-7">
              {w.sessions.map((s) => (
                <div key={s.day} className="rounded-2xl bg-salt p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-mute">{s.day}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${typeColors[s.type] ?? ""}`}>
                      {s.type}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium">{s.title}</p>
                  {s.distanceKm > 0 && <p className="font-serif text-2xl">{s.distanceKm} km</p>}
                  <p className="mt-2 text-xs leading-relaxed text-mute">{s.details}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="mt-12 overflow-hidden rounded-3xl bg-ink p-8 text-salt sm:p-12">
          <p className="eyebrow text-salt/50">That was week one</p>
          <h2 className="mt-3 font-serif text-5xl">
            Unlock the full plan with <span className="italic text-coral">Atelier Pace</span>.
          </h2>
          <p className="mt-4 max-w-xl text-salt/70">
            Every week through to race day, with a taper, pace zones and regeneration whenever your life changes.
          </p>
          <Link href="/membership" className="btn mt-8 bg-salt text-ink hover:bg-coral hover:text-salt">
            See membership
          </Link>
        </div>
      )}

      {plan.islandTips.length > 0 && (
        <div className="mt-12 rounded-3xl bg-lagoon p-8 text-salt">
          <p className="eyebrow text-salt/60">Island tips</p>
          <ul className="mt-4 space-y-2 text-sm">
            {plan.islandTips.map((t) => (
              <li key={t}>✺ {t}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
