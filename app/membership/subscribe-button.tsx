"use client";

import { useState } from "react";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function subscribe() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/subscribe", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else {
      setError(data.error ?? "Couldn't start checkout.");
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={subscribe} disabled={loading} className="btn w-full bg-coral text-salt hover:bg-salt hover:text-ink">
        {loading ? "Opening checkout…" : "Become a member"}
      </button>
      {error && <p className="mt-3 text-xs text-coral">{error}</p>}
    </>
  );
}
