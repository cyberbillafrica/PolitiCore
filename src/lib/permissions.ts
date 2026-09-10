import type {
  OrganizationalAssignment,
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

/**
 * Returns the user's active organizational assignments.
 */
export function getActiveAssignments(
  assignments: OrganizationalAssignment[],
): OrganizationalAssignment[] {
  return assignments.filter((assignment) => assignment.status === "active");
}

/**
 * Returns true when the user has an active campaign membership.
 */
export function isCampaignMember(profile: UserProfile | null): boolean {
  return profile?.membership_types?.includes("campaign_member") ?? false;
}

/**
 * Returns true when the user has social membership.
 */
export function isSocialMember(profile: UserProfile | null): boolean {
  return profile?.membership_types?.includes("social_member") ?? false;
}

/**
 * Returns true when an account carries administrative system privilege.
 */
export function isAdminUser(profile: UserProfile | null): boolean {
  if (!profile) return false;

  return (
    profile.access_role === "admin" ||
    profile.access_role === "tenant_super_admin" ||
    profile.access_role === "platform_super_admin"
  );
}

/**
 * Returns true when an admin account also carries a campaign membership.
 */
export function isCampaignMemberAdmin(profile: UserProfile | null): boolean {
  return isAdminUser(profile) && isCampaignMember(profile);
}

/**
 * Returns campaign organizational assignments.
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

/**
 * Find whether the user has a particular organizational position.
 */
export function hasPosition(
  assignments: OrganizationalAssignment[],
  position: OrganizationalAssignment["position"],
): boolean {
  return getActiveAssignments(assignments).some(
    (assignment) => assignment.position === position,
  );
}

/**
 * Centralized Electoral Hierarchy Resolver
 *
 * Checks whether targetScope falls within the descendant hierarchy of sourceScope.
 *
 * Hierarchy:
 * State ("state", "enugu-state") / Campaign ("campaign")
 *   └── Senatorial Zone ("senatorial_zone", e.g. "enugu-east-senatorial-zone")
 *         └── LGA ("lga", e.g. "nkanu-west")
 *               └── Ward ("ward", e.g. "nkanu-west-ward-01")
 *                     └── Polling Unit ("polling_unit", e.g. "nkanu-west-ward-01-pu-001")
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

  // 1. Campaign & State level covers everything in the state
  if (sourceType === "campaign" || sourceType === "state") {
    return true;
  }

  // 2. Senatorial Zone
  if (sourceType === "senatorial_zone") {
    if (targetType === "senatorial_zone") {
      return sourceId === targetId;
    }
    // All LGAs/Wards/PUs in current scope default under Enugu State / Zone if unspecified or matched
    return true;
  }

  // Helper to get LGAs list (use parameter or static fallback)
  const lgasList = lgasData && lgasData.length > 0
    ? lgasData
    : [{ id: "nkanu-west", code: "NW", name: "Nkanu West", wards: nkanuWestElectoralData }];

  // 3. LGA Level
  if (sourceType === "lga") {
    if (targetType === "lga") {
      return sourceId === targetId;
    }

    if (!sourceId) return false;

    const matchedLga = lgasList.find(
      (lga) => lga.id === sourceId || lga.id.toLowerCase() === sourceId.toLowerCase()
    );

    if (!matchedLga) {
      // Fallback matching by ID prefix (e.g. "nkanu-west" matches "nkanu-west-ward-01")
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
        w.pollingUnits.some((pu) => pu.id === targetId)
      );
    }

    return false;
  }

  // 4. Ward Level
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

      // Fallback prefix check (e.g. "nkanu-west-ward-01" matches "nkanu-west-ward-01-pu-001")
      return targetId.startsWith(sourceId);
    }

    return false;
  }

  // 5. Polling Unit Level
  if (sourceType === "polling_unit") {
    return targetType === "polling_unit" && sourceId === targetId;
  }

  return false;
}

/**
 * Determine whether an assignment covers a requested target scope,
 * including hierarchical inheritance (e.g., LGA assignment covering Wards & PUs).
 */
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

  // Direct exact match
  if (
    assignment.scope_type === scope.scope_type &&
    assignment.scope_id === scope.scope_id
  ) {
    return true;
  }

  // Hierarchical descendant check
  return isScopeDescendant(assignmentScope, scope, lgasData);
}

/**
 * Check an explicit permission grant.
 * Explicit denial wins over explicit grant.
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

/**
 * Default permissions attached to organizational positions.
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

    switch (assignment.position) {
      case "campaign_member":
        return [
          "view_dashboard",
          "view_area",
          "view_assignments",
          "assign_task",
          "view_activities",
          "create_activity",
          "submit_field_report",
          "report_issue",
          "view_notices",
          "view_documents",
        ].includes(permission);

      case "ward_coordinator":
      case "lga_coordinator":
      case "zone_coordinator":
        return [
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
        ].includes(permission);

      case "state_coordinator":
        return [
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
        ].includes(permission);

      case "campaign_manager":
      case "council_chairman":
        return true;

      default:
        return false;
    }
  });
}

/**
 * Central permission resolver.
 *
 * Rules:
 * 1. System Admin users have complete administrative authority globally
 *    WITHOUT requiring an OrganizationalAssignment.
 * 2. Non-admin users are scoped according to their OrganizationalAssignments
 *    and hierarchical electoral boundaries.
 */
export function hasPermission(
  context: PermissionContext,
  permission: Permission,
  scope?: PermissionScope,
): boolean {
  const { profile, assignments, grants, lgasData } = context;

  if (!profile) return false;

  /*
   * ADMIN GLOBAL AUTHORITY RULE:
   * Authenticated admins possess global administrative access without
   * needing an OrganizationalAssignment.
   */
  if (isAdminUser(profile)) {
    return true;
  }

  /*
   * Election Officer
   */
  if (profile.access_role === "election_officer") {
    return [
      "view_dashboard",
      "submit_election_pu_report",
      "submit_election_incident",
      "upload_election_result",
    ].includes(permission);
  }

  /*
   * Explicit grants/denials
   */
  const explicit = hasExplicitGrant(grants, permission, scope, lgasData);

  if (explicit !== null) {
    return explicit;
  }

  /*
   * Position defaults with hierarchical scope checking
   */
  return positionHasPermission(assignments, permission, scope, lgasData);
}

/**
 * Useful shortcut for determining whether the user has
 * any active campaign organizational assignment (or is Admin).
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
