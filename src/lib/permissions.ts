import type {
  OrganizationalAssignment,
  OrganizationalPosition,
  Permission,
  PermissionGrant,
  ScopeType,
  UserProfile,
  LGA,
} from "@/types";

import { nkanuWestElectoralData } from "@/data/electoral";

export interface PermissionScope {
  scope_type?: ScopeType;
  scope_id?: string;
}

export interface PermissionContext {
  profile: UserProfile | null;
  assignments: OrganizationalAssignment[];
  grants: PermissionGrant[];
  lgasData?: LGA[];
}

/*
 * ============================================================
 * DEFAULT PERMISSIONS PER ORGANIZATIONAL POSITION
 * ============================================================
 *
 * Single source of truth for what each organizational position
 * grants.
 *
 * Consumed by:
 *   1. hasPermission() in this file
 *   2. writeAssignmentIndex() in organizationalAssignments.ts
 *   3. writeUserAccessIndex() in permissionGrants.ts
 *
 * campaign_manager and council_chairman intentionally grant no
 * permissions here. Those positions imply administrative authority
 * and should use access_role: "admin" on the user profile instead
 * of an organizational assignment.
 */

export const POSITION_DEFAULT_PERMISSIONS: Record<
  OrganizationalPosition,
  Permission[]
> = {
  campaign_member: [
    "view_dashboard",
    "view_area",
    "view_assignments",
    "view_activities",
    "create_activity",
    "submit_field_report",
    "report_issue",
    "view_notices",
    "view_documents",
  ],

  ward_coordinator: [
    "view_dashboard",
    "view_area",
    "view_members",
    "view_member_contacts",
    "view_assignments",
    "create_assignment",
    "assign_task",
    "review_assignment",
    "view_activities",
    "create_activity",
    "manage_activity",
    "view_activity_reports",
    "submit_field_report",
    "review_field_report",
    "report_issue",
    "manage_issue",
    "view_notices",
    "send_notice",
    "view_documents",
    "manage_documents",
    "view_analytics",
  ],

  lga_coordinator: [
    "view_dashboard",
    "view_area",
    "view_members",
    "view_member_contacts",
    "view_assignments",
    "create_assignment",
    "assign_task",
    "review_assignment",
    "view_activities",
    "create_activity",
    "manage_activity",
    "view_activity_reports",
    "submit_field_report",
    "review_field_report",
    "report_issue",
    "manage_issue",
    "view_notices",
    "send_notice",
    "view_documents",
    "manage_documents",
    "view_analytics",
  ],

  zone_coordinator: [
    "view_dashboard",
    "view_area",
    "view_members",
    "view_member_contacts",
    "view_assignments",
    "create_assignment",
    "assign_task",
    "review_assignment",
    "view_activities",
    "create_activity",
    "manage_activity",
    "view_activity_reports",
    "submit_field_report",
    "review_field_report",
    "report_issue",
    "manage_issue",
    "view_notices",
    "send_notice",
    "view_documents",
    "manage_documents",
    "view_analytics",
  ],

  state_coordinator: [
    "view_dashboard",
    "view_area",
    "view_members",
    "view_member_contacts",
    "manage_members",
    "view_assignments",
    "create_assignment",
    "assign_task",
    "review_assignment",
    "view_activities",
    "create_activity",
    "manage_activity",
    "view_activity_reports",
    "submit_field_report",
    "review_field_report",
    "report_issue",
    "manage_issue",
    "view_notices",
    "send_notice",
    "view_documents",
    "manage_documents",
    "view_analytics",
    "manage_organization",
    "manage_permissions",
  ],

  campaign_manager: [],

  council_chairman: [],
};

/*
 * ============================================================
 * ACTIVE ASSIGNMENTS
 * ============================================================
 */

export function getActiveAssignments(
  assignments: OrganizationalAssignment[],
): OrganizationalAssignment[] {
  return assignments.filter((assignment) => assignment.status === "active");
}

/*
 * ============================================================
 * MEMBERSHIP PREDICATES
 * ============================================================
 */

export function isCampaignMember(profile: UserProfile | null): boolean {
  return profile?.membership_types?.includes("campaign_member") ?? false;
}

export function isSocialMember(profile: UserProfile | null): boolean {
  return profile?.membership_types?.includes("social_member") ?? false;
}

export function isAdminUser(profile: UserProfile | null): boolean {
  if (!profile) return false;

  return (
    profile.access_role === "admin" ||
    profile.access_role === "tenant_super_admin" ||
    profile.access_role === "platform_super_admin"
  );
}

export function isCampaignMemberAdmin(profile: UserProfile | null): boolean {
  return isAdminUser(profile) && isCampaignMember(profile);
}

/*
 * ============================================================
 * CAMPAIGN ASSIGNMENTS
 * ============================================================
 */

export function getCampaignAssignments(
  assignments: OrganizationalAssignment[],
): OrganizationalAssignment[] {
  return getActiveAssignments(assignments).filter(
    (assignment) =>
      assignment.position === "campaign_member" ||
      assignment.position === "ward_coordinator" ||
      assignment.position === "lga_coordinator" ||
      assignment.position === "zone_coordinator" ||
      assignment.position === "state_coordinator" ||
      assignment.position === "campaign_manager" ||
      assignment.position === "council_chairman",
  );
}

export function hasPosition(
  assignments: OrganizationalAssignment[],
  position: OrganizationalAssignment["position"],
): boolean {
  return getActiveAssignments(assignments).some(
    (assignment) => assignment.position === position,
  );
}

/*
 * ============================================================
 * HIERARCHY RESOLVER
 * ============================================================
 *
 * Hierarchy:
 *
 *   State ("state", "enugu-state") / Campaign ("campaign")
 *     └── Senatorial Zone ("senatorial_zone")
 *           └── LGA ("lga")
 *                 └── Ward ("ward")
 *                       └── Polling Unit ("polling_unit")
 */

export function isScopeDescendant(
  sourceScope: PermissionScope,
  targetScope: PermissionScope,
  lgasData?: LGA[],
): boolean {
  if (!sourceScope.scope_type || !targetScope.scope_type) return false;

  const sourceType = sourceScope.scope_type;
  const sourceId = sourceScope.scope_id;
  const targetType = targetScope.scope_type;
  const targetId = targetScope.scope_id;

  // 1. Campaign & State cover everything in the state
  if (sourceType === "campaign" || sourceType === "state") {
    return true;
  }

  // 2. Senatorial Zone
  if (sourceType === "senatorial_zone") {
    if (targetType === "senatorial_zone") {
      return sourceId === targetId;
    }
    return true;
  }

  const lgasList =
    lgasData && lgasData.length > 0
      ? lgasData
      : [
          {
            id: "nkanu-west",
            code: "NW",
            name: "Nkanu West",
            wards: nkanuWestElectoralData,
          },
        ];

  // 3. LGA
  if (sourceType === "lga") {
    if (targetType === "lga") {
      return sourceId === targetId;
    }

    if (!sourceId) return false;

    const matchedLga = lgasList.find(
      (lga) =>
        lga.id === sourceId || lga.id.toLowerCase() === sourceId.toLowerCase(),
    );

    if (!matchedLga) {
      if (targetId && targetId.startsWith(sourceId)) {
        return true;
      }
      return false;
    }

    if (targetType === "ward") {
      return matchedLga.wards.some((w) => w.id === targetId);
    }

    if (targetType === "polling_unit") {
      return matchedLga.wards.some((w) =>
        w.pollingUnits.some((pu) => pu.id === targetId),
      );
    }

    return false;
  }

  // 4. Ward
  if (sourceType === "ward") {
    if (targetType === "ward") {
      return sourceId === targetId;
    }

    if (targetType === "polling_unit") {
      if (!sourceId || !targetId) return false;

      for (const lga of lgasList) {
        const ward = lga.wards.find((w) => w.id === sourceId);
        if (ward) {
          return ward.pollingUnits.some((pu) => pu.id === targetId);
        }
      }

      return targetId.startsWith(sourceId);
    }

    return false;
  }

  // 5. Polling Unit
  if (sourceType === "polling_unit") {
    return targetType === "polling_unit" && sourceId === targetId;
  }

  return false;
}

export function assignmentCoversScope(
  assignment: OrganizationalAssignment,
  scope?: PermissionScope,
  lgasData?: LGA[],
): boolean {
  if (!scope?.scope_type || !scope.scope_id) {
    return true;
  }

  const assignmentScope: PermissionScope = {
    scope_type: assignment.scope_type,
    scope_id: assignment.scope_id,
  };

  if (
    assignment.scope_type === scope.scope_type &&
    assignment.scope_id === scope.scope_id
  ) {
    return true;
  }

  return isScopeDescendant(assignmentScope, scope, lgasData);
}

/*
 * ============================================================
 * EXPLICIT GRANTS
 * ============================================================
 */

function hasExplicitGrant(
  grants: PermissionGrant[],
  permission: Permission,
  scope?: PermissionScope,
  lgasData?: LGA[],
): boolean | null {
  const matching = grants.filter(
    (grant) =>
      grant.permission === permission &&
      (grant.scope_type == null ||
        (grant.scope_type === scope?.scope_type &&
          grant.scope_id === scope?.scope_id)),
  );

  if (matching.some((grant) => grant.granted === false)) {
    return false;
  }

  if (matching.some((grant) => grant.granted === true)) {
    return true;
  }

  return null;
}

/*
 * ============================================================
 * POSITION DEFAULT CHECK
 * ============================================================
 */

function positionHasPermission(
  assignments: OrganizationalAssignment[],
  permission: Permission,
  scope?: PermissionScope,
  lgasData?: LGA[],
): boolean {
  const activeAssignments = getActiveAssignments(assignments);

  return activeAssignments.some((assignment) => {
    if (!assignmentCoversScope(assignment, scope, lgasData)) {
      return false;
    }

    const permitted = POSITION_DEFAULT_PERMISSIONS[assignment.position] ?? [];

    return permitted.includes(permission);
  });
}

/*
 * ============================================================
 * CENTRAL PERMISSION RESOLVER
 * ============================================================
 *
 * Rules:
 *
 * 1. Admin users (access_role "admin" / "tenant_super_admin" /
 *    "platform_super_admin") have complete administrative
 *    authority globally, without requiring an OrganizationalAssignment.
 *
 * 2. Election officers have a fixed election-only permission set.
 *
 * 3. Explicit grants/denials in PermissionGrant are evaluated next.
 *
 * 4. Position defaults are evaluated last.
 */

export function hasPermission(
  context: PermissionContext,
  permission: Permission,
  scope?: PermissionScope,
): boolean {
  const { profile, assignments, grants, lgasData } = context;

  if (!profile) return false;

  if (isAdminUser(profile)) {
    return true;
  }

  if (profile.access_role === "election_officer") {
    return [
      "view_dashboard",
      "submit_election_pu_report",
      "submit_election_incident",
      "upload_election_result",
      "view_election_dashboard",
    ].includes(permission);
  }

  const explicit = hasExplicitGrant(grants, permission, scope, lgasData);
  if (explicit !== null) {
    return explicit;
  }

  return positionHasPermission(assignments, permission, scope, lgasData);
}

/*
 * ============================================================
 * CAMPAIGN COUNCIL MEMBER
 * ============================================================
 */

export function isCampaignCouncilMember(
  profile: UserProfile | null,
  assignments: OrganizationalAssignment[],
): boolean {
  if (!profile) return false;

  if (isAdminUser(profile)) {
    return true;
  }

  if (!isCampaignMember(profile)) {
    return false;
  }

  return getCampaignAssignments(assignments).length > 0;
}
