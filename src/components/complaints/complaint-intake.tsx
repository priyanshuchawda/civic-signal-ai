"use client";

import { SendHorizonal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { classifyComplaint } from "../../domain/complaints";
import type { ComplaintClassification } from "../../domain/complaints";
import { sanitizeForAi } from "../../domain/privacy";
import type { CivicArea } from "../../data/delhi-seed";

type StoredComplaint = {
  id: string;
  areaId: string;
  areaName: string;
  sanitizedText: string;
  classification: ComplaintClassification;
  createdAt: string;
};

const storageKey = "civic-signal:complaints";

function createComplaintId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredComplaints() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as StoredComplaint[]) : [];
  } catch {
    return [];
  }
}

export function ComplaintIntake({ areas }: { areas: CivicArea[] }) {
  const [selectedAreaId, setSelectedAreaId] = useState(areas[0]?.id ?? "");
  const [complaintText, setComplaintText] = useState("");
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<StoredComplaint[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSubmissions(readStoredComplaints());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const selectedArea = useMemo(
    () => areas.find((area) => area.id === selectedAreaId) ?? areas[0],
    [areas, selectedAreaId],
  );
  const latestSubmission = submissions[0];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = complaintText.trim();

    if (!trimmedText) {
      setError("Describe the civic issue before submitting.");
      return;
    }

    if (!selectedArea) {
      setError("Select an area before submitting.");
      return;
    }

    const sanitizedText = sanitizeForAi(trimmedText);
    const classification = classifyComplaint(sanitizedText);
    const submission: StoredComplaint = {
      id: createComplaintId(),
      areaId: selectedArea.id,
      areaName: selectedArea.name,
      sanitizedText,
      classification,
      createdAt: new Date().toISOString(),
    };

    setSubmissions((current) => {
      const next = [submission, ...current].slice(0, 5);
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    setComplaintText("");
    setError("");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          Complaint intake
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Classify a resident report locally before any AI service is involved.
        </p>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="complaint-area"
            className="text-sm font-medium text-slate-700"
          >
            Area
          </label>
          <select
            id="complaint-area"
            value={selectedAreaId}
            onChange={(event) => setSelectedAreaId(event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          >
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="complaint-text"
            className="text-sm font-medium text-slate-700"
          >
            Complaint
          </label>
          <textarea
            id="complaint-text"
            value={complaintText}
            onChange={(event) => setComplaintText(event.target.value)}
            rows={4}
            aria-describedby={error ? "complaint-error" : undefined}
            className="min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            placeholder="Example: Garbage has not been collected near the lane for three days."
          />
          {error ? (
            <p id="complaint-error" className="text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <SendHorizonal aria-hidden="true" className="size-4" />
          Classify complaint
        </button>
      </form>

      {latestSubmission ? (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">
              {latestSubmission.classification.category}
            </span>
            <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
              {latestSubmission.classification.urgency}
            </span>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-950">
            {latestSubmission.classification.department}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {latestSubmission.sanitizedText}
          </p>
          {latestSubmission.classification.reasons.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {latestSubmission.classification.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
