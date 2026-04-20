"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Plus, Trash2, Upload, X } from "lucide-react";

type LayoutItem = { id: string; label: string; badge?: string };
type LayoutGroup = { label: string; items: LayoutItem[] };

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
  jee: {
    name: "JEE Main Pattern",
    duration: 180,
    maxMarks: 300,
    scoring: { correct: 4, incorrect: -1 },
    subjects: ["Physics", "Chemistry", "Maths"],
    sections: ["Physics MCQ", "Physics Numerical", "Chemistry MCQ", "Chemistry Numerical", "Maths MCQ", "Maths Numerical"],
  },
  bitsat: {
    name: "BITSAT Pattern",
    duration: 180,
    maxMarks: 390,
    scoring: { correct: 3, incorrect: -1 },
    subjects: ["Physics", "Chemistry", "English", "Logical Reasoning", "Maths"],
    sections: ["Part I: Physics", "Part II: Chemistry", "Part III: English Proficiency", "Part III: Logical Reasoning", "Part IV: Mathematics"],
  },
  comedk: {
    name: "COMEDK Pattern",
    duration: 180,
    maxMarks: 180,
    scoring: { correct: 1, incorrect: 0 },
    subjects: ["Physics", "Chemistry", "Maths"],
    sections: ["Physics", "Chemistry", "Maths"],
  },
  kcet: {
    name: "KCET Pattern",
    duration: 240,
    maxMarks: 180,
    scoring: { correct: 1, incorrect: 0 },
    subjects: ["Physics", "Chemistry", "Maths"],
    sections: ["Physics", "Chemistry", "Maths"],
  },
};

export default function NewTestPage() {
  const router = useRouter();
  const [baseExam, setBaseExam] = useState<keyof typeof EXAM_TEMPLATES>("jee");
  const [examName, setExamName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [category, setCategory] = useState("");
  const [section, setSection] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomSection, setIsCustomSection] = useState(false);
  const [layoutGroups, setLayoutGroups] = useState<LayoutGroup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<QuestionPayload[]>([]);

  useEffect(() => {
    fetch(`/api/admin/layout/${baseExam}`)
      .then(r => r.json())
      .then(data => setLayoutGroups(data.groups || []))
      .catch(console.error);
  }, [baseExam]);

  const template = EXAM_TEMPLATES[baseExam];

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(36).slice(2),
        index: questions.length + 1,
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
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, index: i + 1 }));
    setQuestions(newQuestions);
  };

  const handleImageUpload = (file: File | undefined, callback: (base64: string | null) => void) => {
    if (!file) {
      callback(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin" as Route);
      } else {
        alert("Error saving exam: " + data.error);
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Test</h2>
          <p className="text-slate-400">Configure settings and add questions directly or via images.</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-full bg-brand px-6 py-2 font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Test"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6">
          <label className="block text-sm font-medium text-slate-300">Exam Name</label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g. JEE Main Mock Test 4"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand"
          />
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6">
          <label className="block text-sm font-medium text-slate-300">Base Pattern</label>
          <select
            value={baseExam}
            onChange={(e) => {
              setBaseExam(e.target.value as keyof typeof EXAM_TEMPLATES);
              setCategory("");
              setSection("");
            }}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand [&>option]:bg-[#171e29]"
          >
            {Object.entries(EXAM_TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6">
          <label className="block text-sm font-medium text-slate-300">Category (Sidebar Group)</label>
          <div className="mt-2 space-y-3">
            <select
              value={isCustomCategory ? "NEW" : category}
              onChange={(e) => {
                if (e.target.value === "NEW") {
                  setIsCustomCategory(true);
                  setCategory("");
                  setSection("");
                  setIsCustomSection(true);
                } else {
                  setIsCustomCategory(false);
                  setCategory(e.target.value);
                  setSection("");
                  setIsCustomSection(false);
                }
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand [&>option]:bg-[#171e29]"
            >
              <option value="" disabled>Select a category</option>
              {layoutGroups.map(g => (
                <option key={g.label} value={g.label}>{g.label}</option>
              ))}
              <option value="NEW">+ Create New Category...</option>
            </select>
            {isCustomCategory && (
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter new category name..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand"
                autoFocus
              />
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6">
          <label className="block text-sm font-medium text-slate-300">Section (Folder)</label>
          <div className="mt-2 space-y-3">
            <select
              value={isCustomSection ? "NEW" : section}
              disabled={!category}
              onChange={(e) => {
                if (e.target.value === "NEW") {
                  setIsCustomSection(true);
                  setSection("");
                } else {
                  setIsCustomSection(false);
                  setSection(e.target.value);
                }
              }}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand disabled:opacity-50 [&>option]:bg-[#171e29]"
            >
              <option value="" disabled>{category ? "Select a section" : "Select a category first"}</option>
              {(!isCustomCategory && category) && layoutGroups.find(g => g.label === category)?.items.map(i => (
                <option key={i.label} value={i.label}>{i.label}</option>
              ))}
              {category && <option value="NEW">+ Create New Section...</option>}
            </select>
            {isCustomSection && (
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Enter new section name..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand"
                autoFocus
              />
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#171e29] p-6 flex flex-col justify-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
              />
              <div className={`block h-6 w-10 rounded-full transition-colors ${isPremium ? "bg-brand" : "bg-white/20"}`}></div>
              <div className={`dot absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${isPremium ? "translate-x-4" : ""}`}></div>
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-300">Make Premium</span>
              <span className="block text-xs text-slate-500">Require premium access to unlock this test</span>
            </div>
          </label>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="relative rounded-2xl border border-white/10 bg-[#171e29] p-6 shadow-sm">
            <button
              onClick={() => removeQuestion(qIndex)}
              className="absolute right-4 top-4 rounded-full p-2 text-rose-400 hover:bg-rose-400/10"
              title="Remove question"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-brand">
                {q.index}
              </span>
              <h3 className="font-semibold text-white">Question {q.index}</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-400">Subject</label>
                <select
                  value={q.subject}
                  onChange={(e) => updateQuestion(qIndex, { subject: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [&>option]:bg-[#171e29]"
                >
                  {template.subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Section</label>
                <select
                  value={q.section}
                  onChange={(e) => updateQuestion(qIndex, { section: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [&>option]:bg-[#171e29]"
                >
                  {template.sections.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Type</label>
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(qIndex, { type: e.target.value as "mcq" | "numerical" })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none [&>option]:bg-[#171e29]"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="numerical">Numerical Value</option>
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Question Text</label>
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                  rows={2}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand"
                  placeholder="Type the question content here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300">Question Image (Optional)</label>
                {q.image ? (
                  <div className="relative mt-2 inline-block">
                    <img src={q.image} alt="Question preview" className="max-h-40 rounded-lg border border-white/10" />
                    <button onClick={() => updateQuestion(qIndex, { image: null })} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-slate-400 transition hover:bg-white/10">
                    <Upload className="h-5 w-5" />
                    <span className="text-sm">Click to upload an image for the question</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files?.[0], (b64) => updateQuestion(qIndex, { image: b64 }))}
                    />
                  </label>
                )}
              </div>
            </div>

            {q.type === "mcq" ? (
              <div className="mt-6 rounded-2xl bg-[#11161f]/50 p-5">
                <p className="text-sm font-medium text-slate-300">Options</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="relative rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <label className="flex items-center gap-2 text-sm text-white">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === opt.text}
                            onChange={() => updateQuestion(qIndex, { correctAnswer: opt.text })}
                            className="h-4 w-4 accent-brand"
                          />
                          Is Correct Answer
                        </label>
                      </div>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          const oldText = newOpts[optIndex].text;
                          newOpts[optIndex].text = e.target.value;
                          const isCorrect = q.correctAnswer === oldText;
                          updateQuestion(qIndex, {
                            options: newOpts,
                            ...(isCorrect ? { correctAnswer: e.target.value } : {})
                          });
                        }}
                        className="mt-3 w-full rounded-lg border border-white/10 bg-[#171e29] px-3 py-2 text-sm text-white outline-none"
                      />
                      {opt.image ? (
                        <div className="relative mt-2 inline-block">
                          <img src={opt.image} alt="Option preview" className="max-h-24 rounded border border-white/10" />
                          <button onClick={() => {
                            const newOpts = [...q.options];
                            newOpts[optIndex].image = null;
                            updateQuestion(qIndex, { options: newOpts });
                          }} className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-[#171e29] px-3 py-2 text-xs text-slate-400 hover:bg-white/5">
                          <Upload className="h-3 w-3" /> Upload Option Image
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0], (b64) => {
                            const newOpts = [...q.options];
                            newOpts[optIndex].image = b64;
                            updateQuestion(qIndex, { options: newOpts });
                          })} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300">Correct Answer (Numerical)</label>
                <input
                  type="text"
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(qIndex, { correctAnswer: e.target.value })}
                  placeholder="e.g. 42"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-brand"
                />
              </div>
            )}

            <div className="mt-5 border-t border-white/10 pt-5">
              <label className="block text-sm font-medium text-slate-300">Explanation</label>
              <textarea
                value={q.explanation}
                onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                rows={2}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand"
                placeholder="Explain the solution..."
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="mx-auto mt-8 flex items-center gap-2 rounded-full border border-dashed border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
      >
        <Plus className="h-4 w-4" /> Add Question
      </button>
    </div>
  );
}
