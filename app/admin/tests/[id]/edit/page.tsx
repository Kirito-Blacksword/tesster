"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Route } from "next";
import { Plus, Trash2, Upload, X } from "lucide-react";

type QuestionPayload = {
  id: string;
  index: number;
  section: string;
  subject: string;
  type: "mcq" | "numerical";
  text: string;
  image: string | null;
  options: { text: string; image: string | null }[];
  correctAnswer: string;
  explanation: string;
};

const EXAM_TEMPLATES = {
  jee:     { name: "JEE Main",  duration: 180, maxMarks: 300, scoring: { correct: 4,  incorrect: -1 }, subjects: ["Physics","Chemistry","Maths"],                                          sections: ["Physics MCQ","Physics Numerical","Chemistry MCQ","Chemistry Numerical","Maths MCQ","Maths Numerical"] },
  bitsat:  { name: "BITSAT",    duration: 180, maxMarks: 390, scoring: { correct: 3,  incorrect: -1 }, subjects: ["Physics","Chemistry","English","Logical Reasoning","Maths"],            sections: ["Part I: Physics","Part II: Chemistry","Part III: English Proficiency","Part III: Logical Reasoning","Part IV: Mathematics"] },
  comedk: { name: "COMEDK",    duration: 180, maxMarks: 180, scoring: { correct: 1,  incorrect: 0  }, subjects: ["Physics","Chemistry","Maths"],                                          sections: ["Physics","Chemistry","Maths"] },
  kcet:    { name: "KCET",      duration: 240, maxMarks: 180, scoring: { correct: 1,  incorrect: 0  }, subjects: ["Physics","Chemistry","Maths"],                                          sections: ["Physics","Chemistry","Maths"] },
} as const;

type TemplateKey = keyof typeof EXAM_TEMPLATES;

export default function EditTestPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const examId = params.id;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examName, setExamName] = useState("");
  const [baseExam, setBaseExam] = useState<TemplateKey>("jee");
  const [isPremium, setIsPremium] = useState(false);
  const [category, setCategory] = useState("");
  const [section, setSection] = useState("");
  const [questions, setQuestions] = useState<QuestionPayload[]>([]);

  useEffect(() => {
    fetch(`/api/admin/tests/${examId}`)
      .then((r) => r.json())
      .then((data) => {
        setExamName(data.name ?? "");
        setBaseExam((data.baseExamId as TemplateKey) ?? "jee");
        setIsPremium(data.isPremium ?? false);
        setCategory(data.category ?? "");
        setSection(data.section ?? "");
        setQuestions(
          (data.questions ?? []).map((q: any) => ({
            id: q.id,
            index: q.index,
            section: q.section,
            subject: q.subject,
            type: q.type,
            text: q.text,
            image: q.image ?? null,
            options: q.options ?? [
              { text: "Option A", image: null },
              { text: "Option B", image: null },
              { text: "Option C", image: null },
              { text: "Option D", image: null },
            ],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? "",
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [examId]);

  const template = EXAM_TEMPLATES[baseExam];

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        index: prev.length + 1,
        section: template.sections[0],
        subject: template.subjects[0],
        type: "mcq",
        text: "",
        image: null,
        options: [
          { text: "Option A", image: null },
          { text: "Option B", image: null },
          { text: "Option C", image: null },
          { text: "Option D", image: null },
        ],
        correctAnswer: "Option A",
        explanation: "",
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<QuestionPayload>) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) =>
      prev.filter((_, i) => i !== index).map((q, i) => ({ ...q, index: i + 1 }))
    );
  };

  const handleImageUpload = (file: File | undefined, cb: (b64: string | null) => void) => {
    if (!file) return cb(null);
    const reader = new FileReader();
    reader.onload = (e) => cb(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = async (publish?: boolean) => {
    if (!examName || questions.length === 0) {
      alert("Please provide an exam name and at least one question.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: examName,
        baseExamId: baseExam,
        durationMinutes: template.duration,
        maxMarks: template.maxMarks,
        cardDetails: `${Math.floor(template.duration / 60)} hours • ${template.maxMarks} marks`,
        scoringCorrect: template.scoring.correct,
        scoringIncorrect: template.scoring.incorrect,
        isPremium,
        category,
        section,
        questions,
      };

      const res = await fetch(`/api/admin/tests/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) { alert("Error: " + data.error); return; }

      // Optionally publish after saving
      if (publish !== undefined) {
        await fetch(`/api/admin/tests/${examId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: publish }),
        });
      }

      router.push("/admin" as Route);
    } catch {
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-slate-400">Loading exam...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Test</h2>
          <p className="text-slate-400">Update questions and settings, then save as draft or publish.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => save()} disabled={isSubmitting}
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>
          <button onClick={() => save(true)} disabled={isSubmitting}
            className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50">
            {isSubmitting ? "Publishing..." : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6">
          <label className="block text-sm font-medium text-slate-300">Exam Name</label>
          <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6">
          <label className="block text-sm font-medium text-slate-300">Base Pattern</label>
          <select value={baseExam} onChange={(e) => setBaseExam(e.target.value as TemplateKey)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none [&>option]:bg-[#171e29]">
            {Object.entries(EXAM_TEMPLATES).map(([k, t]) => <option key={k} value={k}>{t.name}</option>)}
          </select>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6">
          <label className="block text-sm font-medium text-slate-300">Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6">
          <label className="block text-sm font-medium text-slate-300">Section</label>
          <input type="text" value={section} onChange={(e) => setSection(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6 flex items-center">
          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
              <div className={`block h-6 w-10 rounded-full transition-colors ${isPremium ? "bg-brand" : "bg-white/20"}`} />
              <div className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${isPremium ? "translate-x-4" : ""}`} />
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-300">Make Premium</span>
              <span className="block text-xs text-slate-500">Require premium access</span>
            </div>
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="mt-8 space-y-6">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="relative rounded-2xl border border-white/10 bg-[#171e29] p-6">
            <button onClick={() => removeQuestion(qIndex)}
              className="absolute right-4 top-4 rounded-full p-2 text-rose-400 hover:bg-rose-400/10">
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-brand">{q.index}</span>
              <h3 className="font-semibold text-white">Question {q.index}</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-400">Subject</label>
                <select value={q.subject} onChange={(e) => updateQuestion(qIndex, { subject: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [&>option]:bg-[#171e29]">
                  {template.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Section</label>
                <select value={q.section} onChange={(e) => updateQuestion(qIndex, { section: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [&>option]:bg-[#171e29]">
                  {template.sections.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Type</label>
                <select value={q.type} onChange={(e) => updateQuestion(qIndex, { type: e.target.value as "mcq" | "numerical" })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [&>option]:bg-[#171e29]">
                  <option value="mcq">Multiple Choice</option>
                  <option value="numerical">Numerical Value</option>
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Question Text</label>
                <textarea value={q.text} onChange={(e) => updateQuestion(qIndex, { text: e.target.value })} rows={2}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Question Image (Optional)</label>
                {q.image ? (
                  <div className="relative mt-2 inline-block">
                    <img src={q.image} alt="" className="max-h-40 rounded-lg border border-white/10" />
                    <button onClick={() => updateQuestion(qIndex, { image: null })} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-slate-400 hover:bg-white/10">
                    <Upload className="h-5 w-5" /><span className="text-sm">Upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0], (b64) => updateQuestion(qIndex, { image: b64 }))} />
                  </label>
                )}
              </div>
            </div>

            {q.type === "mcq" ? (
              <div className="mt-6 rounded-2xl bg-[#11161f]/50 p-5">
                <p className="text-sm font-medium text-slate-300">Options</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <label className="flex items-center gap-2 border-b border-white/10 pb-2 text-sm text-white">
                        <input type="radio" name={`correct-${q.id}`} checked={q.correctAnswer === opt.text}
                          onChange={() => updateQuestion(qIndex, { correctAnswer: opt.text })} className="h-4 w-4 accent-brand" />
                        Correct Answer
                      </label>
                      <input type="text" value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          const old = newOpts[optIndex].text;
                          newOpts[optIndex].text = e.target.value;
                          updateQuestion(qIndex, { options: newOpts, ...(q.correctAnswer === old ? { correctAnswer: e.target.value } : {}) });
                        }}
                        className="mt-3 w-full rounded-lg border border-white/10 bg-[#171e29] px-3 py-2 text-sm text-white outline-none" />
                      {opt.image ? (
                        <div className="relative mt-2 inline-block">
                          <img src={opt.image} alt="" className="max-h-24 rounded border border-white/10" />
                          <button onClick={() => { const o = [...q.options]; o[optIndex].image = null; updateQuestion(qIndex, { options: o }); }} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 bg-[#171e29] px-3 py-2 text-xs text-slate-400 hover:bg-white/5">
                          <Upload className="h-3 w-3" /> Image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0], (b64) => { const o = [...q.options]; o[optIndex].image = b64; updateQuestion(qIndex, { options: o }); })} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300">Correct Answer (Numerical)</label>
                <input type="text" value={q.correctAnswer} onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand" />
              </div>
            )}

            <div className="mt-5 border-t border-white/10 pt-5">
              <label className="block text-sm font-medium text-slate-300">Explanation</label>
              <textarea value={q.explanation} onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })} rows={2}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand" />
            </div>
          </div>
        ))}
      </div>

      <button onClick={addQuestion}
        className="mx-auto mt-8 flex items-center gap-2 rounded-full border border-dashed border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10">
        <Plus className="h-4 w-4" /> Add Question
      </button>

      <div className="mt-8 flex justify-end gap-3 border-t border-white/10 pt-6">
        <button onClick={() => save()} disabled={isSubmitting}
          className="rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:opacity-50">
          Save Draft
        </button>
        <button onClick={() => save(true)} disabled={isSubmitting}
          className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50">
          Save & Publish
        </button>
      </div>
    </div>
  );
}
