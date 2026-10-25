"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_STORAGE_KEY, PROFILE_STORAGE_KEY, goalLabels, type RunnerProfile } from "@/lib/plan";

const experience: { value: RunnerProfile["experience"]; label: string; hint: string }[] = [
  { value: "new", label: "New", hint: "Just starting out" },
  { value: "casual", label: "Casual", hint: "A few runs a month" },
  { value: "regular", label: "Regular", hint: "Running most weeks" },
  { value: "competitive", label: "Competitive", hint: "Racing for times" },
];

const defaults: RunnerProfile = {
  name: "",
  goal: "10k",
  experience: "casual",
  weeklyKm: 15,
  daysPerWeek: 3,
  raceDate: "",
  recentRace: "",
  notes: "",
};

export default function ClubPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<RunnerProfile>(defaults);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) setProfile({ ...defaults, ...JSON.parse(saved) });
    } catch {}
  }, []);

  const set = <K extends keyof RunnerProfile>(key: K, value: RunnerProfile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      localStorage.removeItem(PLAN_STORAGE_KEY);
    } catch {}
    router.push("/plan?generate=1");
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <p className="eyebrow text-mute">Equatra Run Club</p>
        <h1 className="mt-3 font-serif text-6xl leading-none">
          Join the <span className="italic text-lagoon">club</span>.
        </h1>
        <p className="mt-6 max-w-md text-mute">
          Membership of the club is free. Tell our AI coach about your running and it will write your first week of
          training straight away. Equatra Pace members get the full plan through to race day.
        </p>
        <ul className="mt-8 space-y-3 text-sm">
          <li>✺ Weekly virtual club runs, logged anywhere in the world</li>
          <li>✺ Plans built for heat and humidity</li>
          <li>✺ Early access to new kit drops</li>
        </ul>
      </div>

      <form onSubmit={submit} className="space-y-8 rounded-3xl bg-salt p-6 sm:p-10 lg:col-span-3">
        <label className="block">
          <span className="eyebrow text-mute">Your name</span>
          <input
            required
            maxLength={60}
            className="field mt-2"
            value={profile.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Aishath"
          />
        </label>

        <fieldset>
          <legend className="eyebrow text-mute">Goal</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(goalLabels) as RunnerProfile["goal"][]).map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => set("goal", g)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  profile.goal === g ? "border-ink bg-ink text-salt" : "border-line hover:border-ink"
                }`}
              >
                {goalLabels[g]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow text-mute">Experience</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {experience.map((x) => (
              <button
                type="button"
                key={x.value}
                onClick={() => set("experience", x.value)}
                className={`rounded-2xl border p-3 text-left ${
                  profile.experience === x.value ? "border-ink bg-ink text-salt" : "border-line hover:border-ink"
                }`}
              >
                <span className="block text-sm font-medium">{x.label}</span>
                <span className="block text-xs opacity-60">{x.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow text-mute">Current km / week: {profile.weeklyKm}</span>
            <input
              type="range"
              min={0}
              max={120}
              step={5}
              className="mt-4 w-full accent-lagoon"
              value={profile.weeklyKm}
              onChange={(e) => set("weeklyKm", Number(e.target.value))}
            />
          </label>
          <label className="block">
            <span className="eyebrow text-mute">Days you can run: {profile.daysPerWeek}</span>
            <input
              type="range"
              min={2}
              max={7}
              className="mt-4 w-full accent-lagoon"
              value={profile.daysPerWeek}
              onChange={(e) => set("daysPerWeek", Number(e.target.value))}
            />
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow text-mute">Race date (optional)</span>
            <input type="date" className="field mt-2" value={profile.raceDate} onChange={(e) => set("raceDate", e.target.value)} />
          </label>
          <label className="block">
            <span className="eyebrow text-mute">Recent result (optional)</span>
            <input
              className="field mt-2"
              maxLength={120}
              value={profile.recentRace}
              onChange={(e) => set("recentRace", e.target.value)}
              placeholder="5K in 27:30"
            />
          </label>
        </div>

        <label className="block">
          <span className="eyebrow text-mute">Anything else your coach should know?</span>
          <textarea
            rows={3}
            maxLength={500}
            className="field mt-2"
            value={profile.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="I run before work, only treadmill on weekdays, old calf niggle…"
          />
        </label>

        <button type="submit" className="btn-dark w-full">
          Join &amp; build my plan
        </button>
      </form>
    </section>
  );
}
