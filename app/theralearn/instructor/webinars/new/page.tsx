"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/NewAuthContext";

const categories = ["Clinical", "Therapeutic", "Tech", "Business", "Wellness"];
const levels = ["Beginner", "Intermediate", "Advanced"];

export default function NewWebinarPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [tags, setTags] = useState("");
  const [questions, setQuestions] = useState<{ id: string; label: string; required: boolean }[]>([]);
  const [questionLabel, setQuestionLabel] = useState("");
  const [questionRequired, setQuestionRequired] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please login as an instructor to schedule a webinar");
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const uploadThumbnail = async (file: File) => {
    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads/webinar-thumbnail", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.data?.url) {
        throw new Error(data?.message || "Could not upload thumbnail");
      }
      setThumbnail(data.data.url);
      toast.success("Thumbnail uploaded");
    } catch (err: any) {
      console.error("[thumbnail upload]", err);
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleThumbnailChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadThumbnail(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing auth token. Please login again.");
      return;
    }
    if (uploadingThumbnail) {
      toast.error("Please wait for the thumbnail upload to finish");
      return;
    }
    if (!title || !startTime || !durationMinutes) {
      toast.error("Title, start time, and duration are required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        thumbnail: thumbnail.trim() || null,
        startTime,
        durationMinutes: Number(durationMinutes),
        category: category || null,
        level: level || null,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        customQuestions: questions,
      };

      const res = await fetch("/api/theralearn/webinars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        toast.error("Login required. Please sign in again.");
        router.push("/auth/login");
        return;
      }
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Could not schedule webinar");
      }
      toast.success("Webinar scheduled");
      router.push("/theralearn/instructor/dashboard");
    } catch (err: any) {
      console.error("[webinar create]", err);
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-orange-600 font-semibold">TheraLearn</p>
            <h1 className="text-3xl font-bold text-slate-900">Schedule Webinar</h1>
            <p className="text-slate-600">Create a live session powered by 100ms.</p>
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
                placeholder="e.g. Live Case Demo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 min-h-[100px]"
                placeholder="What will you cover?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Thumbnail</label>
              <div className="mt-1 flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={handleThumbnailChange}
                  disabled={uploadingThumbnail}
                />
                {thumbnail && (
                  <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    <img src={thumbnail} alt="Webinar thumbnail" className="h-40 w-full object-cover" />
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  Upload a 16:9 image. It will be stored on Cloudinary and shown on the attendee detail page.
                </p>
                {uploadingThumbnail && <p className="text-xs text-orange-600">Uploading...</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Start time *</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Duration (minutes) *</label>
                <input
                  type="number"
                  min="15"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Category</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Level</label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option value="">Select</option>
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Tags (comma separated)</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="live, demo, ortho"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Enrollment questions</p>
                  <p className="text-xs text-slate-500">Ask attendees for additional details. Mark required when needed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!questionLabel.trim()) return;
                    setQuestions((prev) => [
                      ...prev,
                      { id: `q_${Date.now()}_${prev.length}`, label: questionLabel.trim(), required: Boolean(questionRequired) },
                    ]);
                    setQuestionLabel("");
                    setQuestionRequired(true);
                  }}
                  className="px-3 py-2 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-sm"
                >
                  Add question
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center">
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="What do you want to ask?"
                  value={questionLabel}
                  onChange={(e) => setQuestionLabel(e.target.value)}
                />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={questionRequired}
                    onChange={(e) => setQuestionRequired(e.target.checked)}
                  />
                  Required
                </label>
                <div className="text-xs text-slate-500">Text response</div>
              </div>
              {questions.length > 0 && (
                <div className="space-y-2">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{q.label}</span>
                        <span className="text-xs text-slate-500">{q.required ? "Required" : "Optional"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setQuestions((prev) => prev.filter((item) => item.id !== q.id))}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              {submitting ? "Scheduling..." : "Schedule webinar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
