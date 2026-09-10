import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./config";
import { CURRENT_TENANT_ID } from "./tenants";
import { getAllLGAs } from "@/lib/constants";
import { getCoveredWardIds } from "@/lib/organization";

import type {
  OrganizationalAssignment,
  UserProfile,
  MembershipType,
  Role,
  LGA,
} from "@/types";

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
 * GET ALL CAMPAIGN MEMBERS FOR TENANT
 * ============================================================
 */

export async function getAllCampaignMembersForTenant(
  tenantId: string = CURRENT_TENANT_ID,
): Promise<ScopedCampaignMember[]> {
  const membersQuery = query(
    collection(db, "users"),
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

/*
 * ============================================================
 * GET SCOPED CAMPAIGN MEMBERS WITH HIERARCHICAL RESOLUTION
 * ============================================================
 */

export async function getScopedCampaignMembers(
  assignment: OrganizationalAssignment | null,
  lgasData?: LGA[],
): Promise<ScopedCampaignMembersResult> {
  // If no assignment provided (e.g. for non-admin), return empty
  if (!assignment) {
    return {
      members: [],
      scopeSupported: true,
    };
  }

  /*
   * CAMPAIGN & STATE & ZONE
   */
  if (
    assignment.scope_type === "campaign" ||
    assignment.scope_type === "state" ||
    assignment.scope_type === "senatorial_zone"
  ) {
    const all = await getAllCampaignMembersForTenant();
    return {
      members: all,
      scopeSupported: true,
    };
  }

  /*
   * POLLING UNIT
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
   * WARD
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
   * LGA
   */
  if (assignment.scope_type === "lga") {
    const lgas = lgasData || (await getAllLGAs());
    const coveredWardIds = getCoveredWardIds([assignment], lgas);

    const allMembers = await getAllCampaignMembersForTenant();

    const filtered = allMembers.filter((m) =>
      m.lga_id === assignment.scope_id ||
      (m.ward_id && coveredWardIds.includes(m.ward_id))
    );

    return {
      members: filtered,
      scopeSupported: true,
    };
  }

  return {
    members: [],
    scopeSupported: false,
    message: "Scope type not supported.",
  };
}

/*
 * ============================================================
 * GET USER PROFILE BY ID
 * ============================================================
 */

export async function getCampaignMemberById(
  memberId: string,
): Promise<ScopedCampaignMember | null> {
  const memberDoc = await getDoc(doc(db, "users", memberId));

  if (!memberDoc.exists()) {
    return null;
  }

  return {
    id: memberDoc.id,
    ...memberDoc.data(),
  } as ScopedCampaignMember;
}

/*
 * ============================================================
 * UPDATE MEMBER PROFILE
 * ============================================================
 */

export async function updateCampaignMemberProfile(
  memberId: string,
  data: Partial<UserProfile>,
): Promise<void> {
  const memberRef = doc(db, "users", memberId);

  await updateDoc(memberRef, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

/*
 * ============================================================
 * UPDATE MEMBERSHIP TYPES
 * ============================================================
 */

export async function updateMemberMembershipTypes(
  memberId: string,
  membershipTypes: MembershipType[],
): Promise<void> {
  const memberRef = doc(db, "users", memberId);

  await updateDoc(memberRef, {
    membership_types: membershipTypes,
    updated_at: serverTimestamp(),
  });
}

/*
 * ============================================================
 * UPDATE ACCESS ROLE
 * ============================================================
 */

export async function updateMemberAccessRole(
  memberId: string,
  accessRole: Role,
): Promise<void> {
  const memberRef = doc(db, "users", memberId);

  await updateDoc(memberRef, {
    access_role: accessRole,
    updated_at: serverTimestamp(),
  });
}
