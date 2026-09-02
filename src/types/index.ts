// ============================================================
// SYSTEM ACCESS ROLES
// ============================================================
//
// These are application-level access roles.
// DO NOT use this for Ward/LGA/Zone/State positions.
//
// Organizational positions are handled separately through
// OrganizationalAssignment.
//

export type Role =
  | "admin"
  | "member"
  | "election_officer"
  | "tenant_super_admin"
  | "platform_super_admin";

// ============================================================
// MEMBERSHIP TYPES
// ============================================================

export type MembershipType = "campaign_member" | "social_member";

// ============================================================
// ORGANIZATIONAL POSITIONS
// ============================================================

export type OrganizationalPosition =
  | "campaign_member"
  | "ward_coordinator"
  | "lga_coordinator"
  | "zone_coordinator"
  | "state_coordinator"
  | "campaign_manager"
  | "council_chairman";

// ============================================================
// ORGANIZATIONAL SCOPE
// ============================================================

export type ScopeType =
  | "polling_unit"
  | "ward"
  | "lga"
  | "senatorial_zone"
  | "state"
  | "campaign";

// ============================================================
// ASSIGNMENT STATUS
// ============================================================

export type OrganizationalAssignmentStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "expired";

// ============================================================
// ORGANIZATIONAL ASSIGNMENT
// ============================================================

export interface OrganizationalAssignment {
  id: string;

  tenant_id: string;

  user_id: string;

  position: OrganizationalPosition;

  scope_type: ScopeType;

  scope_id: string;

  status: OrganizationalAssignmentStatus;

  assigned_by: string;

  assigned_at?: unknown;

  starts_at?: unknown;
  ends_at?: unknown;

  created_at?: unknown;
  updated_at?: unknown;
}

// ============================================================
// PERMISSIONS
// ============================================================

export type Permission =
  // General
  | "view_dashboard"
  | "view_area"

  // Members
  | "view_members"
  | "view_member_contacts"
  | "manage_members"

  // Campaign assignments
  | "view_assignments"
  | "create_assignment"
  | "assign_task"
  | "review_assignment"

  // Campaign activities
  | "view_activities"
  | "create_activity"
  | "manage_activity"
  | "view_activity_reports"

  // Field reporting
  | "submit_field_report"
  | "review_field_report"

  // Issues
  | "report_issue"
  | "manage_issue"

  // Communications
  | "view_notices"
  | "send_notice"

  // Documents
  | "view_documents"
  | "manage_documents"

  // Analytics
  | "view_analytics"

  // Organization
  | "manage_organization"
  | "manage_permissions"

  // Campaign administration
  | "manage_campaign_settings"

  // Election
  | "submit_election_pu_report"
  | "submit_election_incident"
  | "upload_election_result"
  | "view_election_dashboard"
  | "manage_election_settings"

  // Donations
  | "view_private_donations"
  | "manage_private_donations"
  | "view_public_donations"
  | "manage_public_donations";

// ============================================================
// PERMISSION GRANT
// ============================================================

export interface PermissionGrant {
  id: string;

  tenant_id: string;

  user_id: string;

  permission: Permission;

  granted: boolean;

  scope_type?: ScopeType | null;
  scope_id?: string | null;

  granted_by: string;

  created_at?: unknown;
  updated_at?: unknown;
}

// ============================================================
// CAMPAIGN ACTIVITIES
// ============================================================

export type CampaignActivityType =
  | "meeting"
  | "rally"
  | "community_engagement"
  | "training"
  | "coordination"
  | "stakeholder_meeting"
  | "other";

export type CampaignActivityStatus =
  | "scheduled"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface CampaignActivity {
  id: string;

  tenant_id: string;

  title: string;
  description?: string;

  activity_type: CampaignActivityType;
  status: CampaignActivityStatus;

  date: string;
  start_time?: string;
  end_time?: string;

  venue?: string;

  scope_type: ScopeType;
  scope_id: string;

  organizer_id: string;
  organizer_name?: string;

  expected_attendance?: number;

  created_at?: unknown;
  updated_at?: unknown;
}

// ============================================================
// TENANT
// ============================================================

export interface Tenant {
  id: string;

  name: string;

  candidate_name?: string;

  state_id?: string;

  campaign_active?: boolean;

  election_mode_enabled?: boolean;

  created_at?: unknown;
  updated_at?: unknown;
}

// ============================================================
// USER PROFILE
// ============================================================

export interface UserProfile {
  id?: string;

  // Tenant ownership
  tenant_id?: string;

  // Personal information
  full_name: string;
  email: string;
  phone: string;
  gender: string;

  // Registered electoral location
  ward_id: string;
  polling_unit_id: string;

  // Social media identity
  facebook_name?: string;
  facebook_profile_url?: string;

  instagram_name?: string;
  instagram_profile_url?: string;

  x_name?: string;
  x_profile_url?: string;

  tiktok_name?: string;
  tiktok_profile_url?: string;

  // System access
  access_role: Role;

  // Membership
  membership_types: MembershipType[];

  // Social points
  points: number;
  rank: string;

  created_at?: unknown;
  updated_at?: unknown;
}
