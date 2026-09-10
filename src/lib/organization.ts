import type {
  OrganizationalAssignment,
  OrganizationalPosition,
  ScopeType,
  LGA,
} from "@/types";

export type OrganizationalScope = {
  assignment: OrganizationalAssignment | null;

  position: OrganizationalPosition | null;

  scopeType: ScopeType | null;

  scopeId: string | null;

  label: string;
};

/**
 * Human-readable organizational position.
 */
export function formatOrganizationalPosition(
  position: OrganizationalPosition | null,
): string {
  if (!position) return "Campaign Member";

  switch (position) {
    case "campaign_member":
      return "Campaign Council Member";

    case "ward_coordinator":
      return "Ward Coordinator";

    case "lga_coordinator":
      return "LGA Coordinator";

    case "zone_coordinator":
      return "Zone Coordinator";

    case "state_coordinator":
      return "State Coordinator";

    case "campaign_manager":
      return "Campaign Manager";

    case "council_chairman":
      return "Council Chairman";

    default:
      return "Campaign Member";
  }
}

/**
 * Human-readable scope type.
 */
export function formatScopeType(scopeType: ScopeType | null): string {
  if (!scopeType) return "Campaign";

  switch (scopeType) {
    case "polling_unit":
      return "Polling Unit";

    case "ward":
      return "Ward";

    case "lga":
      return "LGA";

    case "senatorial_zone":
      return "Senatorial Zone";

    case "state":
      return "State";

    case "campaign":
      return "Campaign";

    default:
      return "Campaign";
  }
}

/**
 * Select the user's primary active organizational assignment.
 */
export function getPrimaryOrganizationalAssignment(
  assignments: OrganizationalAssignment[],
): OrganizationalAssignment | null {
  if (!assignments.length) return null;

  const priority: OrganizationalPosition[] = [
    "council_chairman",
    "campaign_manager",
    "state_coordinator",
    "zone_coordinator",
    "lga_coordinator",
    "ward_coordinator",
    "campaign_member",
  ];

  for (const position of priority) {
    const match = assignments.find(
      (assignment) =>
        assignment.position === position && assignment.status === "active",
    );

    if (match) return match;
  }

  return assignments[0] ?? null;
}

/**
 * Resolve the dashboard's organizational scope.
 */
export function getPrimaryOrganizationalScope(
  assignments: OrganizationalAssignment[],
): OrganizationalScope {
  const assignment = getPrimaryOrganizationalAssignment(assignments);

  if (!assignment) {
    return {
      assignment: null,
      position: null,
      scopeType: null,
      scopeId: null,
      label: "Campaign Member",
    };
  }

  return {
    assignment,
    position: assignment.position,
    scopeType: assignment.scope_type,
    scopeId: assignment.scope_id,
    label: formatOrganizationalPosition(assignment.position),
  };
}

/**
 * Given an assignment (or active assignments list), return all ward IDs
 * covered under that assignment's scope (e.g. LGA scope returning all ward IDs in that LGA).
 */
export function getCoveredWardIds(
  assignments: OrganizationalAssignment[],
  lgas: LGA[],
): string[] {
  const active = assignments.filter((a) => a.status === "active");
  if (!active.length) return [];

  const wardIds = new Set<string>();

  for (const a of active) {
    if (a.scope_type === "campaign" || a.scope_type === "state" || a.scope_type === "senatorial_zone") {
      // Covers all wards in all LGAs
      for (const lga of lgas) {
        for (const ward of lga.wards) {
          wardIds.add(ward.id);
        }
      }
    } else if (a.scope_type === "lga") {
      const lga = lgas.find((l) => l.id === a.scope_id || l.id.toLowerCase() === a.scope_id.toLowerCase());
      if (lga) {
        for (const ward of lga.wards) {
          wardIds.add(ward.id);
        }
      }
    } else if (a.scope_type === "ward") {
      if (a.scope_id) {
        wardIds.add(a.scope_id);
      }
    }
  }

  return Array.from(wardIds);
}

/**
 * Given an assignment (or active assignments list), return all polling unit IDs
 * covered under that assignment's scope.
 */
export function getCoveredPollingUnitIds(
  assignments: OrganizationalAssignment[],
  lgas: LGA[],
): string[] {
  const active = assignments.filter((a) => a.status === "active");
  if (!active.length) return [];

  const puIds = new Set<string>();

  for (const a of active) {
    if (a.scope_type === "campaign" || a.scope_type === "state" || a.scope_type === "senatorial_zone") {
      for (const lga of lgas) {
        for (const ward of lga.wards) {
          for (const pu of ward.pollingUnits) {
            puIds.add(pu.id);
          }
        }
      }
    } else if (a.scope_type === "lga") {
      const lga = lgas.find((l) => l.id === a.scope_id || l.id.toLowerCase() === a.scope_id.toLowerCase());
      if (lga) {
        for (const ward of lga.wards) {
          for (const pu of ward.pollingUnits) {
            puIds.add(pu.id);
          }
        }
      }
    } else if (a.scope_type === "ward") {
      for (const lga of lgas) {
        const ward = lga.wards.find((w) => w.id === a.scope_id);
        if (ward) {
          for (const pu of ward.pollingUnits) {
            puIds.add(pu.id);
          }
        }
      }
    } else if (a.scope_type === "polling_unit") {
      if (a.scope_id) {
        puIds.add(a.scope_id);
      }
    }
  }

  return Array.from(puIds);
}
