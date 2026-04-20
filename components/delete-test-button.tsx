"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteTestButton({ examId }: { examId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/tests/${examId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete test");
      }
    } catch (error) {
      alert("Error deleting test");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-rose-400 hover:text-rose-300 disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
