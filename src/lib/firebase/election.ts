import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Unsubscribe,
} from "firebase/firestore";

import { db } from "./config";
import { getCurrentTenant } from "./tenants";

/*
 * ============================================================
 * ELECTION RESULTS TYPES
 * ============================================================
 */

export interface ElectionPartyResult {
  party: string;
  votes: number;
}

export interface ElectionResultHistory {
  edited_by: string;
  edited_at: unknown;
  old_results: ElectionPartyResult[];
  new_results: ElectionPartyResult[];
  reason?: string;
}

export interface ElectionResultDoc {
  id: string;
  tenant_id: string;
  ward_id: string;
  polling_unit_id: string;
  results: ElectionPartyResult[];
  submitted_by: string;
  verified: boolean;
  cloudinary_url?: string | null;
  cloudinary_public_id?: string | null;
  history?: ElectionResultHistory[];
  created_at?: unknown;
  updated_at?: unknown;
}

/*
 * ============================================================
 * POLLING UNIT REPORT TYPES
 * ============================================================
 */

export interface PUReportDoc {
  id: string;
  tenant_id: string;
  ward_id: string;
  polling_unit_id: string;
  submitted_by: string;
  report_type: "opening" | "turnout" | "conduct" | "closing" | "general";
  title: string;
  content: string;
  cloudinary_url?: string | null;
  status: "submitted" | "under_review" | "acknowledged";
  created_at?: unknown;
}

/*
 * ============================================================
 * ELECTION INCIDENT TYPES
 * ============================================================
 */

export interface ElectionIncidentDoc {
  id: string;
  tenant_id: string;
  ward_id: string;
  polling_unit_id?: string | null;
  incident_type: "ballot_snatching" | "violence" | "bavas_malfunction" | "late_arrival" | "vote_buying" | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  reported_by: string;
  cloudinary_url?: string | null;
  status: "reported" | "investigating" | "resolved" | "dismissed";
  created_at?: unknown;
}

/*
 * ============================================================
 * SUBMIT ELECTION RESULT WITH FORM EC8 EVIDENCE
 * ============================================================
 */

export async function submitElectionResultWithEvidence(data: {
  pollingUnitId: string;
  wardId: string;
  results: ElectionPartyResult[];
  userId: string;
  cloudinaryUrl?: string | null;
  cloudinaryPublicId?: string | null;
}) {
  const tenant = await getCurrentTenant();
  const resultDocId = `${data.wardId}__${data.pollingUnitId}`;
  const resultRef = doc(db, "election_results", resultDocId);

  await setDoc(resultRef, {
    tenant_id: tenant.id,
    ward_id: data.wardId,
    polling_unit_id: data.pollingUnitId,
    results: data.results,
    submitted_by: data.userId,
    verified: false,
    cloudinary_url: data.cloudinaryUrl || null,
    cloudinary_public_id: data.cloudinaryPublicId || null,
    history: [],
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

/*
 * ============================================================
 * ADMIN CORRECT ELECTION RESULT (WITH AUDIT HISTORY)
 * ============================================================
 */

export async function correctElectionResult(data: {
  resultDocId: string;
  newResults: ElectionPartyResult[];
  adminUserId: string;
  reason?: string;
  existingDoc: ElectionResultDoc;
}) {
  const resultRef = doc(db, "election_results", data.resultDocId);

  const historyItem: ElectionResultHistory = {
    edited_by: data.adminUserId,
    edited_at: new Date().toISOString(),
    old_results: data.existingDoc.results,
    new_results: data.newResults,
    reason: data.reason || "Administrative correction against submitted EC8 evidence",
  };

  const updatedHistory = [...(data.existingDoc.history || []), historyItem];

  await updateDoc(resultRef, {
    results: data.newResults,
    verified: true,
    history: updatedHistory,
    updated_at: serverTimestamp(),
  });
}

/*
 * ============================================================
 * REAL-TIME ELECTION RESULTS SUBSCRIBER
 * ============================================================
 */

export function subscribeToElectionResults(
  tenantId: string,
  onData: (results: ElectionResultDoc[], isInitialLoad: boolean) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "election_results"),
    where("tenant_id", "==", tenantId)
  );

  let isFirstSnapshot = true;

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ElectionResultDoc[];

      onData(docs, isFirstSnapshot);
      isFirstSnapshot = false;
    },
    (err) => {
      console.error("Error in election results listener:", err);
      if (onError) onError(err);
    }
  );
}

/*
 * ============================================================
 * POLLING UNIT REPORTS SERVICE
 * ============================================================
 */

export async function createPUReport(data: {
  ward_id: string;
  polling_unit_id: string;
  submitted_by: string;
  report_type: PUReportDoc["report_type"];
  title: string;
  content: string;
  cloudinary_url?: string | null;
}) {
  const tenant = await getCurrentTenant();
  const ref = await addDoc(collection(db, "pu_reports"), {
    tenant_id: tenant.id,
    ...data,
    status: "submitted",
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToPUReports(
  tenantId: string,
  onData: (reports: PUReportDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "pu_reports"),
    where("tenant_id", "==", tenantId),
    orderBy("created_at", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as PUReportDoc[];
      onData(docs);
    },
    (err) => {
      console.error("Error in PU reports listener:", err);
      if (onError) onError(err);
    }
  );
}

/*
 * ============================================================
 * ELECTION INCIDENTS SERVICE
 * ============================================================
 */

export async function createElectionIncident(data: {
  ward_id: string;
  polling_unit_id?: string | null;
  incident_type: ElectionIncidentDoc["incident_type"];
  severity: ElectionIncidentDoc["severity"];
  description: string;
  reported_by: string;
  cloudinary_url?: string | null;
}) {
  const tenant = await getCurrentTenant();
  const ref = await addDoc(collection(db, "election_incidents"), {
    tenant_id: tenant.id,
    ...data,
    status: "reported",
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToElectionIncidents(
  tenantId: string,
  onData: (incidents: ElectionIncidentDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, "election_incidents"),
    where("tenant_id", "==", tenantId),
    orderBy("created_at", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ElectionIncidentDoc[];
      onData(docs);
    },
    (err) => {
      console.error("Error in election incidents listener:", err);
      if (onError) onError(err);
    }
  );
}
