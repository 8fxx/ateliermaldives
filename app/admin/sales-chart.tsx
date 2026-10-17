"use client";

import { useState } from "react";

type Day = { day: string; value: number; count: number; label: string };

// Validated single-series bar hue (passes chroma + 3:1 contrast on the salt surface)
const BAR = "#0b8fa0";

export function SalesChart({ days }: { days: Day[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...days.map((d) => d.value), 1);
  const active = hover !== null ? days[hover] : null;
  const short = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <figure className="mt-6">
      <div className="h-6 text-sm" aria-live="polite">
        {active ? (
          <span>
            <span className="text-mute">{short(active.day)} · </span>
            {active.label} <span className="text-mute">from {active.count} {active.count === 1 ? "order" : "orders"}</span>
          </span>
        ) : (
          <span className="text-mute">Hover a day for details</span>
        )}
      </div>
      <div className="relative mt-3 h-48 border-b border-line" onMouseLeave={() => setHover(null)}>
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {days.map((d, i) => (
            // The full-height column is the hit target; the bar inside is the mark
            <button
              key={d.day}
              type="button"
              aria-label={`${short(d.day)}: ${d.label}, ${d.count} orders`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              className="flex h-full flex-1 items-end justify-center"
            >
              <span
                className="block w-full max-w-6 rounded-t-[4px] transition-opacity"
                style={{
                  height: d.value ? `${Math.max((d.value / max) * 100, 2)}%` : 0,
                  background: BAR,
                  opacity: hover === null || hover === i ? 1 : 0.45,
                }}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-mute">
        <span>{short(days[0].day)}</span>
        <span>{short(days[days.length - 1].day)}</span>
      </div>
      <table className="sr-only">
        <caption>Order value per day</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.day}>
              <th scope="row">{d.day}</th>
              <td>{d.label}</td>
              <td>{d.count} orders</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
