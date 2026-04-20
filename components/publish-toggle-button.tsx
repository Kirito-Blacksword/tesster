"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublishToggleButton({ examId, published: initialPublished }: { examId: string; published: boolean }) {
  const [published, setPublished] = useState(initialPublished);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const next = !published;
    try {
      const res = await fetch(`/api/admin/tests/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: next }),
      });
      const data = await res.json();
      if (data.success) {
        setPublished(next);
        router.refresh();
      } else {
        alert("Failed to update: " + (data.error ?? "unknown error"));
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-semibold transition hover:underline disabled:opacity-50 ${
        published ? "text-amber-400" : "text-emerald-400"
      }`}
    >
      {loading ? "..." : published ? "Unpublish" : "Publish"}
    </button>
  );
}
