"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { submitElectionResultWithEvidence } from "@/lib/firebase/election";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { parties } from "@/lib/utils";
import { getAllLGAs } from "@/lib/constants";
import type { LGA } from "@/types";
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function ElectionUploadPage() {
  const { profile } = useAuth();
  const isAdminOrElectionOfficer =
    profile?.access_role === "admin" ||
    profile?.access_role === "election_officer";

  const [lgas, setLgas] = useState<LGA[]>([]);

  useEffect(() => {
    async function loadLgas() {
      const data = await getAllLGAs();
      setLgas(data);
    }
    loadLgas();
  }, []);

  const [form, setForm] = useState({
    lga_id: profile?.lga_id ?? "nkanu-west",
    ward_id: isAdminOrElectionOfficer ? "" : (profile?.ward_id ?? ""),
    polling_unit_id: isAdminOrElectionOfficer
      ? ""
      : (profile?.polling_unit_id ?? ""),
    results: parties.map((p) => ({ party: p.id, votes: 0 })),
  });

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedLga = lgas.find((lga) => lga.id === form.lga_id);
  const wards = selectedLga?.wards ?? [];

  const selectedWard = wards.find((ward) => ward.id === form.ward_id);
  const pollingUnits = selectedWard?.pollingUnits ?? [];

  // Resolved names for member reporting area
  const memberLga = lgas.find((lga) => lga.id === (profile?.lga_id ?? "nkanu-west"));
  const memberWard = memberLga?.wards.find((w) => w.id === profile?.ward_id);
  const memberPollingUnit = memberWard?.pollingUnits.find(
    (pu) => pu.id === profile?.polling_unit_id,
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
      setEvidencePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.ward_id || !form.polling_unit_id) {
      setError("Ward and polling unit are required.");
      return;
    }

    if (!evidenceFile) {
      setError("Form EC8 / official result sheet photo evidence is required.");
      return;
    }

    // Non‑privileged users can only submit for their own registered ward/PU
    if (!isAdminOrElectionOfficer) {
      if (
        form.ward_id !== profile?.ward_id ||
        form.polling_unit_id !== profile?.polling_unit_id
      ) {
        setError(
          "You can only submit results for your registered ward and polling unit.",
        );
        return;
      }
    }

    const nonZeroResults = form.results.filter((r) => r.votes > 0);
    if (nonZeroResults.length === 0) {
      setError("Please enter at least one party vote.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload Form EC8 image to Cloudinary
      let cloudinaryUrl: string | null = null;
      try {
        cloudinaryUrl = await uploadToCloudinary(
          evidenceFile,
          "ifeanyi-2027/news"
        );
      } catch (uploadErr: any) {
        console.warn("Cloudinary upload fallback:", uploadErr);
      }

      // 2. Submit result + evidence metadata to Firestore
      await submitElectionResultWithEvidence({
        pollingUnitId: form.polling_unit_id,
        wardId: form.ward_id,
        results: nonZeroResults,
        userId: profile?.id || "unknown",
        cloudinaryUrl,
      });

      setMessage(
        "Election results and Form EC8 evidence submitted successfully! They will be aggregated in real time.",
      );
      setEvidenceFile(null);
      setEvidencePreview(null);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-gray-900">
        Upload Election Results
      </h1>

      {!isAdminOrElectionOfficer && (
        <div className="p-4 bg-apc-light text-apc-primary rounded-lg border border-apc-primary/20">
          <p className="font-medium">Your Reporting Area</p>
          <p className="mt-1">
            <span className="font-semibold">LGA:</span>{" "}
            {memberLga ? memberLga.name : "Not set"}
          </p>
          <p>
            <span className="font-semibold">Ward:</span>{" "}
            {memberWard ? `${memberWard.code} — ${memberWard.name}` : "Not set"}
          </p>
          <p>
            <span className="font-semibold">Polling Unit:</span>{" "}
            {memberPollingUnit
              ? `${memberPollingUnit.code} — ${memberPollingUnit.name}`
              : "Not set"}
          </p>
          <p className="text-sm mt-2 text-gray-600">
            You can only submit results for this area.
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6"
      >
        {/* LGA, Ward and Polling Unit – admin/election officer selection */}
        {isAdminOrElectionOfficer && (
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LGA *
              </label>
              <select
                value={form.lga_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lga_id: e.target.value,
                    ward_id: "",
                    polling_unit_id: "",
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-apc-primary focus:border-transparent text-sm"
                required
              >
                <option value="">Select LGA</option>
                {lgas.map((lga) => (
                  <option key={lga.id} value={lga.id}>
                    {lga.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ward *
              </label>
              <select
                value={form.ward_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ward_id: e.target.value,
                    polling_unit_id: "",
                  })
                }
                disabled={!form.lga_id}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-apc-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                required
              >
                <option value="">
                  {form.lga_id ? "Select ward" : "Select an LGA first"}
                </option>
                {wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.code} — {ward.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Polling Unit *
              </label>
              <select
                value={form.polling_unit_id}
                onChange={(e) =>
                  setForm({ ...form, polling_unit_id: e.target.value })
                }
                disabled={!form.ward_id}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-apc-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                required
              >
                <option value="">
                  {form.ward_id ? "Select polling unit" : "Select a ward first"}
                </option>
                {pollingUnits.map((pu) => (
                  <option key={pu.id} value={pu.id}>
                    {pu.code} — {pu.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Form EC8 Evidence Photo Upload */}
        <div className="border-t pt-6">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Form EC8 / Official Result Sheet Photo *
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Upload a clear photo of the signed Form EC8 result sheet for this polling unit.
          </p>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100/50 transition-colors">
            {evidencePreview ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border mb-3">
                <img
                  src={evidencePreview}
                  alt="Form EC8 Result Sheet"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              required={!evidenceFile}
              className="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-apc-primary file:text-white hover:file:bg-apc-dark cursor-pointer"
            />
          </div>
        </div>

        {/* Party votes */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-apc-primary mb-4">
            Enter Votes per Party
          </h3>
          <div className="space-y-4">
            {parties.map((party, idx) => (
              <div key={party.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {party.name} ({party.id.toUpperCase()}) Votes
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.results[idx].votes}
                  onChange={(e) => {
                    const newResults = [...form.results];
                    newResults[idx].votes = parseInt(e.target.value) || 0;
                    setForm({ ...form, results: newResults });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-apc-primary focus:border-transparent text-sm"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-apc-primary text-white py-3 rounded-lg font-semibold hover:bg-apc-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Uploading Evidence & Results...</span>
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              <span>Submit Election Results</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
