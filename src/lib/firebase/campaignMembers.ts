import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "./config";

import { CURRENT_TENANT_ID } from "./tenants";

import type { OrganizationalAssignment, UserProfile } from "@/types";

/*
 * ============================================================
 * SCOPED CAMPAIGN MEMBER
 * ============================================================
 */

export interface ScopedCampaignMember extends UserProfile {
  id: string;
}

/*
 * ============================================================
 * RESULT
 * ============================================================
 */

export interface ScopedCampaignMembersResult {
  members: ScopedCampaignMember[];
  scopeSupported: boolean;
  message?: string;
}

/*
 * ============================================================
 * GET SCOPED CAMPAIGN MEMBERS
 * ============================================================
 *
 * IMPORTANT:
 *
 * We deliberately use the member's registered electoral
 * location for Ward / Polling Unit scopes.
 *
 * We do NOT confuse the user's personal electoral location
 * with their organizational assignment.
 *
 * The assignment tells us WHAT AREA the coordinator controls.
 * The user profile tells us WHERE that member is registered.
 *
 * Higher geographic scopes (LGA / Zone / State) require the
 * electoral hierarchy resolver before we query them safely.
 * ============================================================
 */

export async function getAllCampaignMembersForTenant(
  tenantId: string = CURRENT_TENANT_ID,
): Promise<ScopedCampaignMember[]> {
  const membersQuery = query(
    collection(db, "users"),
    where("tenant_id", "==", tenantId),
    where("membership_types", "array-contains", "campaign_member"),
  );

  const snapshot = await getDocs(membersQuery);

  const documents = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as ScopedCampaignMember[];

  return documents.sort((a, b) => {
    const left = a.full_name ?? a.email ?? "";
    const right = b.full_name ?? b.email ?? "";
    return left.localeCompare(right);
  });
}

export async function getScopedCampaignMembers(
  assignment: OrganizationalAssignment,
): Promise<ScopedCampaignMembersResult> {
  /*
   * ----------------------------------------------------------
   * CAMPAIGN-WIDE
   * ----------------------------------------------------------
   */

  if (assignment.scope_type === "campaign") {
    const membersQuery = query(
      collection(db, "users"),
      where("membership_types", "array-contains", "campaign_member"),
    );

    const snapshot = await getDocs(membersQuery);

    return {
      members: snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as ScopedCampaignMember[],
      scopeSupported: true,
    };
  }

  /*
   * ----------------------------------------------------------
   * POLLING UNIT
   * ----------------------------------------------------------
   */

  if (assignment.scope_type === "polling_unit") {
    const membersQuery = query(
      collection(db, "users"),
      where("membership_types", "array-contains", "campaign_member"),
      where("polling_unit_id", "==", assignment.scope_id),
    );

    const snapshot = await getDocs(membersQuery);

    return {
      members: snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as ScopedCampaignMember[],
      scopeSupported: true,
    };
  }

  /*
   * ----------------------------------------------------------
   * WARD
   * ----------------------------------------------------------
   */

  if (assignment.scope_type === "ward") {
    const membersQuery = query(
      collection(db, "users"),
      where("membership_types", "array-contains", "campaign_member"),
      where("ward_id", "==", assignment.scope_id),
    );

    const snapshot = await getDocs(membersQuery);

    return {
      members: snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      })) as ScopedCampaignMember[],
      scopeSupported: true,
    };
  }

  /*
   * ----------------------------------------------------------
   * HIGHER ORGANIZATIONAL LEVELS
   * ----------------------------------------------------------
   *
   * We intentionally do not guess here.
   *
   * UserProfile currently has:
   *
   *     ward_id
   *     polling_unit_id
   *
   * but does not contain:
   *
   *     lga_id
   *     senatorial_zone_id
   *     state_id
   *
   * Therefore an LGA/Zone/State query requires the electoral
   * hierarchy to resolve:
   *
   *     LGA
   *       ↓
   *     Wards
   *       ↓
   *     Polling Units
   *
   * before querying members.
   * ----------------------------------------------------------
   */

  return {
    members: [],
    scopeSupported: false,
    message:
      "This organizational scope requires the electoral hierarchy resolver before members can be loaded safely.",
  };
}
