"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Save, Trash2, X } from "lucide-react";
import { examConfigs, type ExamId } from "@/lib/exams";

type LayoutItem = { id: string; label: string; badge?: string };
type LayoutGroup = { label: string; items: LayoutItem[] };

export default function LayoutManagerPage() {
  const router = useRouter();
  const [baseExam, setBaseExam] = useState<ExamId>("jee");
  const [groups, setGroups] = useState<LayoutGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchLayout() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/layout/${baseExam}`);
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups || []);
        }
      } catch (error) {
        console.error("Failed to fetch layout", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLayout();
  }, [baseExam]);

  const saveLayout = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: baseExam, groups }),
      });
      if (!res.ok) throw new Error("Failed to save layout");
      alert("Layout saved successfully!");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error saving layout.");
    } finally {
      setIsSaving(false);
    }
  };

  const addCategory = () => {
    const label = prompt("Enter new category name:");
    if (label && label.trim() !== "") {
      setGroups([...groups, { label: label.trim(), items: [] }]);
    }
  };

  const addSection = (groupIndex: number) => {
    const label = prompt("Enter new section name:");
    if (label && label.trim() !== "") {
      const newGroups = [...groups];
      newGroups[groupIndex].items.push({
        id: `custom-${newGroups[groupIndex].label}-${label.trim()}`.toLowerCase().replace(/\s+/g, '-'),
        label: label.trim(),
      });
      setGroups(newGroups);
    }
  };

  const moveGroup = (index: number, direction: 1 | -1) => {
    if (index + direction < 0 || index + direction >= groups.length) return;
    const newGroups = [...groups];
    const temp = newGroups[index];
    newGroups[index] = newGroups[index + direction];
    newGroups[index + direction] = temp;
    setGroups(newGroups);
  };

  const moveItem = (groupIndex: number, itemIndex: number, direction: 1 | -1) => {
    const items = groups[groupIndex].items;
    if (itemIndex + direction < 0 || itemIndex + direction >= items.length) return;
    const newGroups = [...groups];
    const temp = items[itemIndex];
    newGroups[groupIndex].items[itemIndex] = items[itemIndex + direction];
    newGroups[groupIndex].items[itemIndex + direction] = temp;
    setGroups(newGroups);
  };

  const deleteGroup = (index: number) => {
    if (confirm("Are you sure you want to delete this entire category?")) {
      const newGroups = [...groups];
      newGroups.splice(index, 1);
      setGroups(newGroups);
    }
  };

  const deleteItem = (groupIndex: number, itemIndex: number) => {
    if (confirm("Are you sure you want to delete this section?")) {
      const newGroups = [...groups];
      newGroups[groupIndex].items.splice(itemIndex, 1);
      setGroups(newGroups);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f18] text-white p-6 md:p-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Layout Manager</h1>
            <p className="text-slate-400 mt-1">Reorder categories and sections for the mock tests board.</p>
          </div>
          <button
            onClick={saveLayout}
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand/90 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {isSaving ? "Saving..." : "Save Layout"}
          </button>
        </header>

        <div className="rounded-2xl border border-white/10 bg-[#121824] p-6">
          <label className="block text-sm font-medium text-slate-300">Target Exam Pattern</label>
          <select
            value={baseExam}
            onChange={(e) => setBaseExam(e.target.value as ExamId)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand [&>option]:bg-[#171e29]"
          >
            {Object.values(examConfigs).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 rounded-2xl bg-white/5"></div>
            <div className="h-24 rounded-2xl bg-white/5"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group, groupIndex) => (
              <div key={`${group.label}-${groupIndex}`} className="rounded-2xl border border-white/10 bg-[#121824] p-4">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                  <h2 className="text-lg font-medium text-brand">{group.label}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveGroup(groupIndex, -1)} disabled={groupIndex === 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                    <button onClick={() => moveGroup(groupIndex, 1)} disabled={groupIndex === groups.length - 1} className="p-2 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                    <button onClick={() => deleteGroup(groupIndex)} className="p-2 text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                <div className="space-y-2">
                  {group.items.map((item, itemIndex) => (
                    <div key={`${item.id}-${itemIndex}`} className="flex items-center justify-between rounded-xl bg-[#171e29] px-4 py-3 border border-white/5">
                      <span className="text-slate-200">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => moveItem(groupIndex, itemIndex, -1)} disabled={itemIndex === 0} className="p-1.5 text-slate-500 hover:text-slate-300 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                        <button onClick={() => moveItem(groupIndex, itemIndex, 1)} disabled={itemIndex === group.items.length - 1} className="p-1.5 text-slate-500 hover:text-slate-300 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                        <button onClick={() => deleteItem(groupIndex, itemIndex)} className="p-1.5 text-slate-500 hover:text-red-400"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                  {group.items.length === 0 && <p className="text-slate-500 text-sm px-4 py-2">No sections in this category.</p>}
                  
                  <button onClick={() => addSection(groupIndex)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
                    <Plus className="h-4 w-4" /> Add Section
                  </button>
                </div>
              </div>
            ))}

            <button onClick={addCategory} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-transparent px-4 py-6 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white">
              <Plus className="h-5 w-5" /> Add New Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
