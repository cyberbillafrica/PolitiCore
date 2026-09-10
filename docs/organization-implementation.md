# Organizational Hierarchy Resolution and Admin Access Implementation Report

**Project:** `PolitiCore` — Campaign Platform for 2027 Campaign and election
**Author:** Google Jules (Autonomous Coding Agent)
**Date:** May 2024

---

## Executive Summary

The organizational hierarchy resolution layer of the PolitiCore campaign platform has been fully upgraded and centralized. This architectural refinement addresses two core requirements:
1. **Admin Global Access:** Authenticated administrators (`admin`, `tenant_super_admin`, `platform_super_admin`) now possess complete state-wide campaign authority without requiring an `OrganizationalAssignment` record. All misleading blocking messages ("No organizational assignment") have been removed for admins.
2. **Electoral Hierarchy Scope Inheritance:** Non-admin campaign coordinators now inherit authority over subordinate electoral areas. Scope checking automatically resolves descendants according to the application's authoritative Enugu State electoral data structure:
   $$\text{State / Campaign} \longrightarrow \text{Senatorial Zone} \longrightarrow \text{LGA} \longrightarrow \text{Ward} \longrightarrow \text{Polling Unit}$$

No hard-coded locations or parallel role abstractions were introduced, preserving the existing `access_role` vs `OrganizationalAssignment` architecture.

---

## 1. Files Changed & Summary of Modifications

| File Path | Description of Changes |
| :--- | :--- |
| `src/lib/permissions.ts` | Centralized hierarchy resolver (`isScopeDescendant`, `assignmentCoversScope`) added. Updated `hasPermission()` and `isCampaignCouncilMember()` to grant Admin global access without requiring an assignment. |
| `src/lib/organization.ts` | Added `getCoveredWardIds()` and `getCoveredPollingUnitIds()` to dynamically expand higher-level scopes (e.g. LGA) into subordinate wards and polling units. |
| `src/lib/firebase/campaignMembers.ts` | Refactored `getScopedCampaignMembers()` to handle LGA scope resolution dynamically using electoral ward lists. |
| `src/hooks/useScopedCampaignMembers.ts` | Updated hook to check `isAdminUser(profile)` and bypass assignment requirements for admins by fetching all campaign members globally. |
| `src/lib/firebase/campaignReports.ts` | Added `getAllCampaignReportsForTenant()` for admin state-wide report review. |
| `src/lib/firebase/campaignIssues.ts` | Added `getAllCampaignIssues()` and updated `getScopedCampaignIssues()` to handle global/state-level scope resolution. |
| `src/app/portal/campaign/area/page.tsx` | Updated area overview page to render an administrative state-wide view for Admin without assignment warnings while preserving scoped views for coordinators. |
| `src/app/portal/campaign/members/page.tsx` | Updated directory to show state-wide member directory for Admin and resolve subordinate ward members for LGA/Zone/State coordinators. |
| `src/app/portal/campaign/activities/page.tsx` | Preserved global activity management for Admin (`getAllCampaignActivities`) while retaining scoped filtering for coordinators. |
| `src/app/portal/campaign/reports/page.tsx` | Granted Admin state-wide report review visibility (`getAllCampaignReportsForTenant`) without requiring an assignment. |
| `src/app/portal/campaign/issues/page.tsx` | Removed misleading "No organizational scope assigned" warning for Admin; loads all issues globally for admins. |
| `src/app/portal/campaign/assignments/page.tsx` | Preserved global assignment administration for Admin (`getAllCampaignAssignments`). |
| `src/components/dashboard/CampaignDashboard.tsx` | Cleaned up stale links and UI cards referencing permanently removed modules (Communications, Documents, Calendar). |

---

## 2. How Hierarchy Resolution Works

Hierarchy resolution is centralized in `src/lib/permissions.ts` via `assignmentCoversScope(assignment, scope, lgasData?)` and `isScopeDescendant(sourceScope, targetScope, lgasData?)`.

### Scope Expansion Algorithm
When evaluating whether a coordinator assigned to a `sourceScope` has authority over a `targetScope`:
1. **Direct Match:** Returns `true` if `sourceScope.type === targetScope.type` and `sourceScope.id === targetScope.id`.
2. **State / Campaign Level:** Returns `true` for any `targetScope` within Enugu State.
3. **Senatorial Zone Level:** Returns `true` for all LGAs, Wards, and Polling Units within the zone.
4. **LGA Level:** Looks up the LGA in `lgasData` (or static fallback `nkanuWestElectoralData`). Returns `true` if `targetScope` is a Ward or Polling Unit belonging to that LGA.
5. **Ward Level:** Looks up the Ward in `lgasData`. Returns `true` if `targetScope` is a Polling Unit contained within that Ward.
6. **Polling Unit Level:** Returns `true` only for exact Polling Unit matches.

---

## 3. How Admin Global Access Works

In `src/lib/permissions.ts`, `hasPermission()` evaluates system access roles before checking explicit grants or position defaults:

```ts
if (isAdminUser(profile)) {
  return true;
}
```

* **No Assignment Required:** Admin users bypass assignment requirements across all campaign operational views (`/portal/campaign/area`, `/portal/campaign/members`, `/portal/campaign/activities`, `/portal/campaign/reports`, `/portal/campaign/issues`, `/portal/campaign/assignments`).
* **Clean UI:** Blockers such as *"No organizational assignment yet"* or *"No organizational scope assigned"* are rendered only for non-admin users who genuinely lack an assignment.

---

## 4. Ward / LGA / Zone / State Scope Inheritance

In `src/lib/organization.ts`, two helper functions map assignments into descendant lists:
* `getCoveredWardIds(assignments, lgas)`: Extracts all Ward IDs subordinate to active LGA, Zone, State, or Campaign assignments.
* `getCoveredPollingUnitIds(assignments, lgas)`: Extracts all Polling Unit IDs subordinate to active Ward, LGA, Zone, State, or Campaign assignments.

These helpers allow services like `getScopedCampaignMembers()` to query members across all wards under an LGA coordinator's scope in a single operation without hard-coding any IDs.

---

## 5. Firestore Rules & Security Index

Firestore rules in `firestore.rules` were verified and remain strictly enforced server-side:
* **Admin Global Access:** `isAdmin()` function (`callerRole() == "admin"`) grants full read/write access across `campaign_activities`, `campaign_assignments`, `campaign_field_reports`, `issues`, and `users`.
* **Scoped Access:** Non-admin users are restricted to documents where `resource.data.submitted_by == request.auth.uid` or via `hasAccess()` index checks.
* No rules were weakened; client-side hierarchy resolution operates within these server-side security boundaries.

---

## 6. Test Cases Performed & Results

| Case | Scenario | Expected Outcome | Result |
| :--- | :--- | :--- | :--- |
| **Case 1** | Admin without assignment | Accesses Area, Members, Activities, Reports, Issues, and Assignments globally without warnings. | **PASS** |
| **Case 2** | Ward assignment | Ward Coordinator for Ward 01 accesses Ward 01 and its PUs; Ward 02 is inaccessible. | **PASS** |
| **Case 3** | LGA assignment | LGA Coordinator for Nkanu West accesses all 14 wards and PUs under Nkanu West; Aninri LGA is inaccessible. | **PASS** |
| **Case 4** | Senatorial Zone assignment | Zone Coordinator accesses all subordinate LGAs, wards, and PUs in Enugu East Senatorial Zone. | **PASS** |
| **Case 5** | State assignment | State Coordinator accesses the full 17 LGA electoral hierarchy in Enugu State. | **PASS** |
| **Case 6** | Polling Unit assignment | PU Agent accesses assigned PU only; parent ward/LGA resources outside PU remain inaccessible. | **PASS** |
| **Case 7** | Cross-boundary negative test | User assigned to LGA A cannot access LGA B or wards/PUs belonging to LGA B. | **PASS** |

---

## 7. Build, Type-Check, and Lint Results

* **TypeScript Compilation:** `npx tsc --noEmit` executed with **0 errors**.
* **Linting:** ESLint completed cleanly.
* **Production Build:** `npm run build` compiled successfully in Next.js Turbopack runtime.

---

## 8. Remaining Architectural Notes

* **Dynamic Data Synchronization:** In offline/unseeded environments, `getAllLGAs()` gracefully falls back to `nkanuWestElectoralData`, ensuring zero downtime or blank views when Firestore is empty.
* **Permanently Removed Modules:** Dead references to Communications, Documents, and Calendar were purged from `CampaignDashboard.tsx` and sidebar navigation layouts. No code or permissions were re-added for these modules.
