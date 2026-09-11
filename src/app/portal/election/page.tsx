"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  AlertTriangle,
  Bell,
  Eye,
  Edit3,
  X,
  History,
  Loader2,
  Lock,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { getAllLGAs } from "@/lib/constants";
import { assignmentCoversScope, isAdminUser } from "@/lib/permissions";
import {
  subscribeToElectionResults,
  correctElectionResult,
  type ElectionResultDoc,
  type ElectionPartyResult,
} from "@/lib/firebase/election";
import { getCurrentTenant } from "@/lib/firebase/tenants";
import type { LGA, Ward } from "@/types";

const partyColors: Record<string, string> = {
  apc: "#1B4F72",
  pdp: "#27AE60",
  ndc: "#E74C3C",
};

interface AlertToast {
  id: string;
  puName: string;
  wardName: string;
  lgaName: string;
  results: ElectionPartyResult[];
}

export default function ElectionDashboard() {
  const { profile, assignments, accessLoading } = useAuth();
  const isAdmin = isAdminUser(profile);

  const [lgas, setLgas] = useState<LGA[]>([]);
  const [results, setResults] = useState<ElectionResultDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState("ifeanyi-4-nkanu");

  // Filter state
  const [selectedLgaId, setSelectedLgaId] = useState<string>("all");
  const [selectedWardId, setSelectedWardId] = useState<string>("all");

  // Modals & Toasts
  const [toastAlerts, setToastAlerts] = useState<AlertToast[]>([]);
  const [inspectResult, setInspectResult] = useState<ElectionResultDoc | null>(null);
  const [editingResult, setEditingResult] = useState<ElectionResultDoc | null>(null);
  const [editFormResults, setEditFormResults] = useState<ElectionPartyResult[]>([]);
  const [editReason, setEditReason] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Load LGAs
  useEffect(() => {
    async function initLgas() {
      const data = await getAllLGAs();
      setLgas(data);
      const tenant = await getCurrentTenant();
      setTenantId(tenant.id);
    }
    initLgas();
  }, []);

  // Real-time Firestore Listener
  useEffect(() => {
    if (!tenantId) return;

    const unsubscribe = subscribeToElectionResults(tenantId, (docs, isInitialLoad) => {
      setResults(docs);
      setLoading(false);

      if (!isInitialLoad && docs.length > 0) {
        // Detect newly arrived results that are approved for toast alert
        const newest = docs[docs.length - 1];

        if (newest.status === "approved") {
          // Resolve names for toast
          let puName = newest.polling_unit_id;
          let wardName = newest.ward_id;
          let lgaName = "Enugu";

          for (const lga of lgas) {
            for (const ward of lga.wards) {
              const pu = ward.pollingUnits.find((p) => p.id === newest.polling_unit_id);
              if (pu) {
                puName = `${pu.code} — ${pu.name}`;
                wardName = `${ward.code} — ${ward.name}`;
                lgaName = lga.name;
              }
            }
          }

          const alert: AlertToast = {
            id: `${newest.id}_${Date.now()}`,
            puName,
            wardName,
            lgaName,
            results: newest.results,
          };

          setToastAlerts((prev) => [...prev, alert]);

          // Auto-dismiss alert after 6 seconds
          setTimeout(() => {
            setToastAlerts((prev) => prev.filter((a) => a.id !== alert.id));
          }, 6000);
        }
      }
    });

    return () => unsubscribe();
  }, [tenantId, lgas]);

  // Hierarchical Result Filtering based on User's Scope
  const coveredResults = useMemo(() => {
    if (isAdmin) return results;

    const activeAssignments = assignments.filter((a) => a.status === "active");
    if (activeAssignments.length === 0) return [];

    return results.filter((result) => {
      return activeAssignments.some((assignment) =>
        assignmentCoversScope(
          assignment,
          { scope_type: "ward", scope_id: result.ward_id },
          lgas
        ) ||
        assignmentCoversScope(
          assignment,
          { scope_type: "polling_unit", scope_id: result.polling_unit_id },
          lgas
        )
      );
    });
  }, [isAdmin, assignments, results, lgas]);

  // Apply Status (Only Approved count in official dashboard) and UI Dropdown Filters
  const filteredResults = useMemo(() => {
    return coveredResults.filter((r) => {
      // Official aggregation requires approved status
      if (r.status !== "approved") return false;

      if (selectedLgaId !== "all") {
        const lga = lgas.find((l) => l.id === selectedLgaId);
        if (lga && !lga.wards.some((w) => w.id === r.ward_id)) {
          return false;
        }
      }
      if (selectedWardId !== "all" && r.ward_id !== selectedWardId) {
        return false;
      }
      return true;
    });
  }, [coveredResults, selectedLgaId, selectedWardId, lgas]);

  // Aggregate Figures
  const aggregates = useMemo(() => {
    let totalVotes = 0;
    let apc = 0;
    let pdp = 0;
    let ndc = 0;

    for (const r of filteredResults) {
      for (const p of r.results) {
        const v = Number(p.votes) || 0;
        totalVotes += v;
        if (p.party === "apc") apc += v;
        if (p.party === "pdp") pdp += v;
        if (p.party === "ndc") ndc += v;
      }
    }

    const totalPUsInScope = lgas.reduce(
      (acc, l) =>
        acc + l.wards.reduce((wAcc, w) => wAcc + w.pollingUnits.length, 0),
      0
    );

    const reportedUnits = filteredResults.length;
    const reportingPercent = totalPUsInScope > 0
      ? ((reportedUnits / totalPUsInScope) * 100).toFixed(1)
      : "0.0";

    return {
      totalVotes,
      apc,
      pdp,
      ndc,
      reportedUnits,
      totalUnits: totalPUsInScope || 200,
      reportingPercent,
      apcLead: apc - pdp,
    };
  }, [filteredResults, lgas]);

  // Chart Data
  const wardChartData = useMemo(() => {
    const wardMap = new Map<string, { ward: string; APC: number; PDP: number; NDC: number }>();

    for (const r of filteredResults) {
      // Resolve ward name
      let wardName = r.ward_id;
      for (const l of lgas) {
        const w = l.wards.find((item) => item.id === r.ward_id);
        if (w) {
          wardName = w.name;
          break;
        }
      }

      if (!wardMap.has(wardName)) {
        wardMap.set(wardName, { ward: wardName, APC: 0, PDP: 0, NDC: 0 });
      }

      const entry = wardMap.get(wardName)!;
      for (const p of r.results) {
        const v = Number(p.votes) || 0;
        if (p.party === "apc") entry.APC += v;
        if (p.party === "pdp") entry.PDP += v;
        if (p.party === "ndc") entry.NDC += v;
      }
    }

    return Array.from(wardMap.values());
  }, [filteredResults, lgas]);

  const pieChartData = [
    { name: "APC", value: aggregates.apc },
    { name: "PDP", value: aggregates.pdp },
    { name: "NDC", value: aggregates.ndc },
  ];

  // Admin Correct Result Handler
  const handleSaveCorrection = async () => {
    if (!editingResult || !profile) return;
    setSavingEdit(true);

    try {
      await correctElectionResult({
        resultDocId: editingResult.id,
        newResults: editFormResults,
        adminUserId: profile.id || "admin",
        reason: editReason,
        existingDoc: editingResult,
      });

      setEditingResult(null);
      setEditReason("");
    } catch (err) {
      console.error("Failed to correct election result:", err);
      alert("Failed to save correction. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  if (accessLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-apc-primary" />
        <span className="ml-3 text-gray-500">Connecting to live election data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert Container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toastAlerts.map((a) => (
          <div
            key={a.id}
            className="bg-white border-2 border-apc-primary rounded-xl shadow-xl p-4 pointer-events-auto animate-in slide-in-from-bottom-5 duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-apc-primary font-bold text-sm">
                <Bell className="h-4 w-4 animate-bounce" />
                <span>New Result Received</span>
              </div>
              <button
                onClick={() => setToastAlerts((prev) => prev.filter((item) => item.id !== a.id))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-1 text-xs font-semibold text-gray-900">{a.puName}</p>
            <p className="text-xs text-gray-500">{a.wardName} · {a.lgaName}</p>

            <div className="mt-2 grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-lg text-center text-xs font-semibold">
              {a.results.map((r) => (
                <div key={r.party}>
                  <span className="text-gray-500 uppercase">{r.party}: </span>
                  <span className="text-gray-900">{r.votes}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Election Operations Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            {isAdmin
              ? "Live state-wide election results aggregation and evidence inspection."
              : "Read-only aggregated election results for your authorized campaign scope."}
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedLgaId}
            onChange={(e) => {
              setSelectedLgaId(e.target.value);
              setSelectedWardId("all");
            }}
            className="px-3 py-2 border rounded-lg text-xs font-semibold bg-white"
          >
            <option value="all">All LGAs</option>
            {lgas.map((lga) => (
              <option key={lga.id} value={lga.id}>
                {lga.name}
              </option>
            ))}
          </select>

          <select
            value={selectedWardId}
            onChange={(e) => setSelectedWardId(e.target.value)}
            disabled={selectedLgaId === "all"}
            className="px-3 py-2 border rounded-lg text-xs font-semibold bg-white disabled:bg-gray-100"
          >
            <option value="all">All Wards</option>
            {selectedLgaId !== "all" &&
              lgas
                .find((l) => l.id === selectedLgaId)
                ?.wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} — {w.name}
                  </option>
                ))}
          </select>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-green-50/60 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  Reported PUs
                </p>
                <p className="text-3xl font-bold text-green-800 mt-1">
                  {aggregates.reportedUnits} / {aggregates.totalUnits}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {aggregates.reportingPercent}% coverage
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Total Votes Cast
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {aggregates.totalVotes.toLocaleString()}
                </p>
              </div>
              <Upload className="h-8 w-8 text-apc-primary shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  APC Votes
                </p>
                <p className="text-3xl font-bold text-apc-primary mt-1">
                  {aggregates.apc.toLocaleString()}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600 shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                APC Margin
              </p>
              <p
                className={`text-3xl font-bold mt-1 ${
                  aggregates.apcLead >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {aggregates.apcLead >= 0 ? `+${aggregates.apcLead.toLocaleString()}` : aggregates.apcLead.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">votes relative to PDP</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ward by Ward Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {wardChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No election results submitted yet in this scope.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ward" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="APC" fill={partyColors.apc} />
                    <Bar dataKey="PDP" fill={partyColors.pdp} />
                    <Bar dataKey="NDC" fill={partyColors.ndc} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vote Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {aggregates.totalVotes === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No votes recorded yet in this scope.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.name === "APC"
                              ? partyColors.apc
                              : entry.name === "PDP"
                              ? partyColors.pdp
                              : partyColors.ndc
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Polling Unit Submissions & Evidence Inspection Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Submitted Polling Unit Results ({filteredResults.length})</CardTitle>
            {!isAdmin && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                <Lock className="h-3 w-3" /> Read-Only View
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {filteredResults.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-500">
                No polling unit election results available in this scope yet.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <th className="text-left py-3 px-4">Polling Unit / Ward</th>
                    <th className="text-right py-3 px-4">APC</th>
                    <th className="text-right py-3 px-4">PDP</th>
                    <th className="text-right py-3 px-4">NDC</th>
                    <th className="text-center py-3 px-4">Form EC8 Evidence</th>
                    <th className="text-right py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredResults.map((r) => {
                    const apcVotes = r.results.find((p) => p.party === "apc")?.votes || 0;
                    const pdpVotes = r.results.find((p) => p.party === "pdp")?.votes || 0;
                    const ndcVotes = r.results.find((p) => p.party === "ndc")?.votes || 0;

                    return (
                      <tr key={r.id} className="hover:bg-gray-50/80">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900">{r.polling_unit_id}</p>
                          <p className="text-xs text-gray-500">Ward: {r.ward_id}</p>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-blue-900">{apcVotes}</td>
                        <td className="text-right py-3 px-4 font-semibold text-green-900">{pdpVotes}</td>
                        <td className="text-right py-3 px-4 font-semibold text-red-900">{ndcVotes}</td>
                        <td className="text-center py-3 px-4">
                          {r.cloudinary_url ? (
                            <button
                              onClick={() => setInspectResult(r)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-apc-primary hover:underline"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Inspect EC8
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">No Image</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {r.history && r.history.length > 0 && (
                              <button
                                onClick={() => setInspectResult(r)}
                                title="View audit history"
                                className="p-1 text-gray-400 hover:text-apc-primary"
                              >
                                <History className="h-4 w-4" />
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setEditingResult(r);
                                  setEditFormResults([...r.results]);
                                  setEditReason("");
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded bg-apc-primary/10 text-apc-primary hover:bg-apc-primary hover:text-white transition-colors"
                              >
                                Correct
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inspect EC8 Image & Audit History Modal */}
      {inspectResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-apc-primary text-white p-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">Form EC8 Result Evidence</h2>
                <p className="text-xs text-white/80">
                  PU: {inspectResult.polling_unit_id} · Ward: {inspectResult.ward_id}
                </p>
              </div>
              <button onClick={() => setInspectResult(null)} className="p-1 hover:bg-white/10 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Evidence Image */}
              {inspectResult.cloudinary_url ? (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Official Form EC8 Result Sheet Image
                  </p>
                  <div className="rounded-xl border bg-gray-50 overflow-hidden flex items-center justify-center p-2 min-h-[250px]">
                    <img
                      src={inspectResult.cloudinary_url}
                      alt="Form EC8 Evidence"
                      className="max-h-[350px] object-contain rounded"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed text-center text-sm text-gray-500">
                  No Form EC8 photo evidence was attached to this submission.
                </div>
              )}

              {/* Audit History */}
              {inspectResult.history && inspectResult.history.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
                    <History className="h-4 w-4 text-apc-primary" />
                    Correction Audit History
                  </h3>
                  <div className="space-y-3">
                    {inspectResult.history.map((h, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1">
                        <p className="font-semibold text-gray-800">
                          Correction by Admin: {h.edited_by}
                        </p>
                        <p className="text-gray-500">Reason: {h.reason || "None specified"}</p>
                        <p className="text-gray-400">Timestamp: {String(h.edited_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-6 py-3 bg-gray-50 flex justify-end">
              <button
                onClick={() => setInspectResult(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border bg-white text-gray-700 hover:bg-gray-100"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Correction Modal */}
      {editingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-apc-primary text-white p-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">Correct Election Result</h2>
                <p className="text-xs text-white/80">PU: {editingResult.polling_unit_id}</p>
              </div>
              <button onClick={() => setEditingResult(null)} className="p-1 hover:bg-white/10 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500">
                Correct party vote counts against the submitted Form EC8 photo evidence. All corrections will be recorded in the audit trail.
              </p>

              <div className="space-y-3">
                {editFormResults.map((pr, idx) => (
                  <div key={pr.party} className="flex items-center justify-between gap-4">
                    <label className="text-sm font-semibold text-gray-700 uppercase">
                      {pr.party} Votes
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={pr.votes}
                      onChange={(e) => {
                        const updated = [...editFormResults];
                        updated[idx].votes = parseInt(e.target.value) || 0;
                        setEditFormResults(updated);
                      }}
                      className="w-28 px-3 py-2 border rounded-lg text-sm text-right"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason / Audit Note
                </label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Corrected typo in PDP vote count per EC8 sheet"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setEditingResult(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCorrection}
                disabled={savingEdit}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-apc-primary text-white hover:bg-apc-dark disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save Correction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
