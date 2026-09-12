"use client";

import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./config";
import { expandAssignmentToScopes } from "@/lib/organization";
import type { OrganizationalAssignment, LGA } from "@/types";

export type CampaignReportStatus =
  | "submitted"
  | "under_review"
  | "accepted"
  | "returned";

export type CampaignReportType =
  | "activity"
  | "community"
  | "mobilization"
  | "meeting"
  | "field"
  | "other";

export interface CampaignFieldReport {
  id: string;

  tenant_id: string;

  submitted_by: string;

  report_type: CampaignReportType;

  title: string;
  description: string;

  scope_type: string;
  scope_id: string;

  location?: string | null;

  participants?: number | null;

  issues?: string | null;

  community_feedback?: string | null;

  requests?: string | null;

  follow_up_required?: boolean;

  evidence_url?: string | null;

  status: CampaignReportStatus;

  reviewed_by?: string | null;
  review_comment?: string | null;

  created_at?: unknown;
  updated_at?: unknown;
}

/*
 * ============================================================
 * COLLECTION
 * ============================================================
 */

const COLLECTION = "campaign_field_reports";

/*
 * ============================================================
 * MAP DOCUMENT
 * ============================================================
 */

function mapReport(
  id: string,
  data: Record<string, unknown>,
): CampaignFieldReport {
  return {
    id,

    tenant_id: String(data.tenant_id ?? ""),

    submitted_by: String(data.submitted_by ?? ""),

    report_type: (data.report_type as CampaignReportType) ?? "field",

    title: String(data.title ?? ""),

    description: String(data.description ?? ""),

    scope_type: String(data.scope_type ?? ""),
    scope_id: String(data.scope_id ?? ""),

    location: typeof data.location === "string" ? data.location : null,

    participants:
      typeof data.participants === "number" ? data.participants : null,

    issues: typeof data.issues === "string" ? data.issues : null,

    community_feedback:
      typeof data.community_feedback === "string"
        ? data.community_feedback
        : null,

    requests: typeof data.requests === "string" ? data.requests : null,

    follow_up_required: data.follow_up_required === true,

    evidence_url:
      typeof data.evidence_url === "string" ? data.evidence_url : null,

    status: (data.status as CampaignReportStatus) ?? "submitted",

    reviewed_by: typeof data.reviewed_by === "string" ? data.reviewed_by : null,

    review_comment:
      typeof data.review_comment === "string" ? data.review_comment : null,

    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/*
 * ============================================================
 * MY REPORTS
 * ============================================================
 */

export async function getMyCampaignReports(
  userId: string,
): Promise<CampaignFieldReport[]> {
  if (!userId) {
    return [];
  }

  const q = query(
    collection(db, COLLECTION),
    where("submitted_by", "==", userId),
    orderBy("created_at", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => mapReport(item.id, item.data()));
}

/**
 * Gets campaign reports for an active organizational assignment by expanding
 * its scope to all descendant scopes using expandAssignmentToScopes.
 */
export async function getScopedCampaignReportsForAssignment(
  assignment: OrganizationalAssignment,
  lgas: LGA[],
): Promise<CampaignFieldReport[]> {
  if (!assignment || assignment.status !== "active") {
    return [];
  }

  const expandedScopes = expandAssignmentToScopes(assignment, lgas);
  if (expandedScopes.length === 0) {
    return [];
  }

  const resultsMap = new Map<string, CampaignFieldReport>();

  await Promise.all(
    expandedScopes.map(async ({ scope_type, scope_id }) => {
      const q = query(
        collection(db, COLLECTION),
        where("tenant_id", "==", assignment.tenant_id),
        where("scope_type", "==", scope_type),
        where("scope_id", "==", scope_id),
        orderBy("created_at", "desc"),
      );

      const snapshot = await getDocs(q);

      snapshot.docs.forEach((docSnapshot) => {
        const item = mapReport(docSnapshot.id, docSnapshot.data());
        resultsMap.set(item.id, item);
      });
    }),
  );

  return Array.from(resultsMap.values()).sort((a, b) => {
    const aDate = a.created_at ? new Date(String(a.created_at)).getTime() : 0;
    const bDate = b.created_at ? new Date(String(b.created_at)).getTime() : 0;
    return bDate - aDate;
  });
}

/*
 * ============================================================
 * ALL TENANT REPORTS (ADMIN GLOBAL)
 * ============================================================
 */

export async function getAllCampaignReportsForTenant(
  tenantId: string,
): Promise<CampaignFieldReport[]> {
  if (!tenantId) {
    return [];
  }

  const q = query(
    collection(db, COLLECTION),
    where("tenant_id", "==", tenantId),
    orderBy("created_at", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => mapReport(item.id, item.data()));
}

/*
 * ============================================================
 * SCOPED REPORTS
 * ============================================================
 */

export async function getScopedCampaignReports(
  tenantId: string,
  scopeType: string,
  scopeId: string,
): Promise<CampaignFieldReport[]> {
  if (!tenantId || !scopeType || !scopeId) {
    return [];
  }

  const q = query(
    collection(db, COLLECTION),
    where("tenant_id", "==", tenantId),
    where("scope_type", "==", scopeType),
    where("scope_id", "==", scopeId),
    orderBy("created_at", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => mapReport(item.id, item.data()));
}

/*
 * ============================================================
 * CREATE REPORT
 * ============================================================
 */

export async function createCampaignFieldReport(data: {
  tenant_id: string;

  submitted_by: string;

  report_type: CampaignReportType;

  title: string;
  description: string;

  scope_type: string;
  scope_id: string;

  location?: string | null;

  participants?: number | null;

  issues?: string | null;

  community_feedback?: string | null;

  requests?: string | null;

  follow_up_required?: boolean;

  evidence_url?: string | null;
}) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,

    status: "submitted",

    reviewed_by: null,
    review_comment: null,

    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return ref.id;
}
