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
import { CURRENT_TENANT_ID } from "./tenants";
import { getAllLGAs } from "@/lib/constants";
import { expandAssignmentToScopes } from "@/lib/organization";

import type { OrganizationalAssignment, ScopeType, LGA } from "@/types";

/*
 * ============================================================
 * CAMPAIGN ISSUE
 * ============================================================
 */

export type CampaignIssueType =
  | "logistics"
  | "campaign_activity"
  | "community_concern"
  | "volunteer"
  | "communication"
  | "security"
  | "infrastructure"
  | "other";

export type CampaignIssuePriority = "low" | "medium" | "high" | "urgent";

export type CampaignIssueStatus =
  | "reported"
  | "acknowledged"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export interface CampaignIssue {
  id: string;

  tenant_id?: string;

  title: string;
  description: string;

  issue_type: CampaignIssueType;
  priority: CampaignIssuePriority;
  status: CampaignIssueStatus;

  scope_type: ScopeType;
  scope_id: string;

  reported_by: string;

  assigned_to?: string | null;

  location?: string | null;

  evidence_url?: string | null;

  resolution_notes?: string | null;

  created_at?: unknown;
  updated_at?: unknown;
}

/*
 * ============================================================
 * CREATE ISSUE
 * ============================================================
 */

export async function createCampaignIssue(data: {
  title: string;
  description: string;
  issue_type: CampaignIssueType;
  priority: CampaignIssuePriority;

  scope_type: ScopeType;
  scope_id: string;

  reported_by: string;

  location?: string;
  evidence_url?: string;
  tenant_id?: string;
}) {
  const ref = await addDoc(collection(db, "issues"), {
    title: data.title.trim(),
    description: data.description.trim(),

    issue_type: data.issue_type,
    priority: data.priority,

    status: "reported",

    scope_type: data.scope_type,
    scope_id: data.scope_id,

    reported_by: data.reported_by,

    location: data.location?.trim() || null,
    evidence_url: data.evidence_url?.trim() || null,

    tenant_id: data.tenant_id ?? null,

    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return ref.id;
}

/*
 * ============================================================
 * GET ALL ISSUES (ADMIN GLOBAL)
 * ============================================================
 */

export async function getAllCampaignIssues(): Promise<CampaignIssue[]> {
  const q = query(collection(db, "issues"), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as CampaignIssue[];
}

/*
 * ============================================================
 * GET ISSUES FOR AN ORGANIZATIONAL SCOPE
 * ============================================================
 */

export async function getScopedCampaignIssues(
  assignment: OrganizationalAssignment,
  lgasData?: LGA[],
): Promise<CampaignIssue[]> {
  if (!assignment || assignment.status !== "active") {
    return [];
  }

  const lgas = lgasData || (await getAllLGAs());
  const expandedScopes = expandAssignmentToScopes(assignment, lgas);

  if (expandedScopes.length === 0) {
    return [];
  }

  const resultsMap = new Map<string, CampaignIssue>();

  await Promise.all(
    expandedScopes.map(async ({ scope_type, scope_id }) => {
      const q = query(
        collection(db, "issues"),
        where("tenant_id", "==", CURRENT_TENANT_ID),
        where("scope_type", "==", scope_type),
        where("scope_id", "==", scope_id),
        orderBy("created_at", "desc"),
      );

      const snapshot = await getDocs(q);

      snapshot.docs.forEach((docSnapshot) => {
        const item = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as CampaignIssue;
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
 * GET MY REPORTED ISSUES
 * ============================================================
 */

export async function getMyCampaignIssues(
  userId: string,
): Promise<CampaignIssue[]> {
  const q = query(
    collection(db, "issues"),
    where("reported_by", "==", userId),
    orderBy("created_at", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as CampaignIssue[];
}
