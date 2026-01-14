"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const courseCategories = [
  "Clinical Skills",
  "Therapeutic Techniques",
  "Assessment Methods",
  "Research & Evidence",
  "Patient Care",
  "Professional Development",
  "Certification Prep",
  "Specialized Therapy",
  "Health Tech",
];

const levels = ["Beginner", "Intermediate", "Advanced"];

export default function NewCoursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [outline, setOutline] = useState<string[]>([""]);
  const [chapters, setChapters] = useState([{ title: "", file: null as File | null, videoUrl: "" }]);
  const [notes, setNotes] = useState([{ title: "", url: "" }]);
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("draft");
  const [certificate, setCertificate] = useState(false);
  const [liveSession, setLiveSession] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const addOutline = () => setOutline((prev) => [...prev, ""]);
  const updateOutline = (i: number, v: string) => setOutline((prev) => prev.map((x, idx) => (idx === i ? v : x)));
  const removeOutline = (i: number) => setOutline((prev) => prev.filter((_, idx) => idx !== i));

  const addChapter = () => setChapters((prev) => [...prev, { title: "", file: null, videoUrl: "" }]);
  const updateChapterTitle = (i: number, v: string) =>
    setChapters((prev) => prev.map((c, idx) => (idx === i ? { ...c, title: v } : c)));
  const updateChapterFile = (i: number, file: File | null) =>
    setChapters((prev) => prev.map((c, idx) => (idx === i ? { ...c, file } : c)));
  const removeChapter = (i: number) => setChapters((prev) => prev.filter((_, idx) => idx !== i));

  const addNote = () => setNotes((prev) => [...prev, { title: "", url: "" }]);
  const updateNote = (i: number, key: "title" | "url", v: string) =>
    setNotes((prev) => prev.map((n, idx) => (idx === i ? { ...n, [key]: v } : n)));
  const removeNote = (i: number) => setNotes((prev) => prev.filter((_, idx) => idx !== i));

  const uploadVideo = (file: File, onProgress: (percent: number) => void) =>
    new Promise<string>((resolve, reject) => {
      const form = new FormData();
      form.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/theralearn/uploads/video");
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 100);
          onProgress(percent);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res?.success && res?.url) return resolve(res.url);
          } catch (e) {}
          return reject(new Error("Upload failed"));
        }
        reject(new Error("Upload failed"));
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(form);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !level || !duration) {
      toast.error("Title, category, level, and duration are required");
      return;
    }
    if (chapters.some((c) => !c.file || !c.title)) {
      toast.error("Each chapter needs a title and video file");
      return;
    }
    setSubmitting(true);
    setIsUploading(true);
    setProgress(0);
    try {
      let totalProgress = 0;
      const perFile = 100 / Math.max(chapters.length, 1);
      const uploadedChapters = [] as { title: string; videoUrl: string }[];

      for (let i = 0; i < chapters.length; i += 1) {
        const chap = chapters[i];
        const url = await uploadVideo(chap.file as File, (p) => {
          const overall = Math.min(99, Math.round(totalProgress + (p / 100) * perFile));
          setProgress(overall);
        });
        totalProgress += perFile;
        setProgress(Math.min(99, Math.round(totalProgress)));
        uploadedChapters.push({ title: chap.title, videoUrl: url });
      }

      const payload = {
        title,
        description,
        category,
        level,
        duration,
        price: price || null,
        outline: outline.filter((x) => x.trim()),
        chapters: uploadedChapters,
        notes: notes.filter((n) => n.title || n.url),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        certificate,
        liveSession,
        status,
      };

      const res = await fetch("/api/theralearn/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Could not create course");
      }
      setProgress(100);
      toast.success("Course created");
      router.push("/theralearn/instructor/dashboard");
    } catch (err: any) {
      console.error("[course create]", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-orange-600 font-semibold">TheraLearn</p>
            <h1 className="text-3xl font-bold text-slate-900">Create Course</h1>
            <p className="text-slate-600">Draft a course and publish when you’re ready.</p>
          </div>
          <button
            onClick={() => router.push("/theralearn/instructor/dashboard")}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Back to dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Title *</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="e.g. Advanced Rehab Protocols"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 min-h-[120px]"
                placeholder="What will students learn?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Category *</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category</option>
                  {courseCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Level *</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">Select level</option>
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Duration *</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="e.g. 6 weeks"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Price (optional)</label>
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="₹2999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Outline</p>
                <p className="text-xs text-slate-500">Add module titles</p>
              </div>
              <button type="button" onClick={addOutline} className="text-sm text-orange-600">+ Add module</button>
            </div>
            <div className="space-y-3">
              {outline.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    placeholder={`Module ${i + 1}`}
                    value={item}
                    onChange={(e) => updateOutline(i, e.target.value)}
                  />
                  {outline.length > 1 && (
                    <button type="button" onClick={() => removeOutline(i)} className="text-slate-500 hover:text-red-500 text-sm">Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Chapters (videos)</p>
                <p className="text-xs text-slate-500">Title + upload video file</p>
              </div>
              <button type="button" onClick={addChapter} className="text-sm text-orange-600">+ Add chapter</button>
            </div>
            <div className="space-y-3">
              {chapters.map((c, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="Chapter title"
                    value={c.title}
                    onChange={(e) => updateChapterTitle(i, e.target.value)}
                  />
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      accept="video/*"
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
                      onChange={(e) => updateChapterFile(i, e.target.files?.[0] || null)}
                    />
                    {chapters.length > 1 && (
                      <button type="button" onClick={() => removeChapter(i)} className="text-slate-500 hover:text-red-500 text-sm">Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">Notes (PDF links)</p>
                <p className="text-xs text-slate-500">Share handouts or slides</p>
              </div>
              <button type="button" onClick={addNote} className="text-sm text-orange-600">+ Add note</button>
            </div>
            <div className="space-y-3">
              {notes.map((n, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="Note title"
                    value={n.title}
                    onChange={(e) => updateNote(i, "title", e.target.value)}
                  />
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
                      placeholder="PDF link"
                      value={n.url}
                      onChange={(e) => updateNote(i, "url", e.target.value)}
                    />
                    {notes.length > 1 && (
                      <button type="button" onClick={() => removeNote(i)} className="text-slate-500 hover:text-red-500 text-sm">Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Tags (comma separated)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="pain, rehab, ortho"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={certificate} onChange={(e) => setCertificate(e.target.checked)} />
                Certificate on completion
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={liveSession} onChange={(e) => setLiveSession(e.target.checked)} />
                Includes live sessions
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/theralearn/instructor/dashboard")}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save course"}
            </button>
          </div>

          {isUploading && (
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
