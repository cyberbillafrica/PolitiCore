"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import type {
  OrganizationalAssignment,
  OrganizationalPosition,
  ScopeType,
} from "@/types";

/*
 * ============================================================
 * FIRESTORE COLLECTION
 * ============================================================
 */

const COLLECTION = "organizational_assignments";

/*
 * ============================================================
 * FIRESTORE → APPLICATION MAPPER
 * ============================================================
 */

function mapAssignment(
  id: string,
  data: Record<string, unknown>,
): OrganizationalAssignment {
  return {
    id,
    tenant_id: String(data.tenant_id ?? ""),
    user_id: String(data.user_id ?? ""),
    position: data.position as OrganizationalPosition,
    scope_type: data.scope_type as ScopeType,
    scope_id: String(data.scope_id ?? ""),
    status: data.status as OrganizationalAssignment["status"],
    assigned_by: String(data.assigned_by ?? ""),
    assigned_at: data.assigned_at,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/*
 * ============================================================
 * GET ALL ASSIGNMENTS FOR A USER
 * ============================================================
 */

export async function getUserOrganizationalAssignments(
  userId: string,
): Promise<OrganizationalAssignment[]> {
  if (!userId) {
    return [];
  }

  const assignmentsRef = collection(db, COLLECTION);

  const q = query(
    assignmentsRef,
    where("user_id", "==", userId),
    orderBy("created_at", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((assignmentDoc) =>
    mapAssignment(assignmentDoc.id, assignmentDoc.data()),
  );
}

/*
 * ============================================================
 * GET ACTIVE ASSIGNMENTS ONLY
 * ============================================================
 */

export async function getActiveOrganizationalAssignments(
  userId: string,
): Promise<OrganizationalAssignment[]> {
  if (!userId) {
    return [];
  }

  const assignmentsRef = collection(db, COLLECTION);

  const q = query(
    assignmentsRef,
    where("user_id", "==", userId),
    where("status", "==", "active"),
    orderBy("created_at", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((assignmentDoc) =>
    mapAssignment(assignmentDoc.id, assignmentDoc.data()),
  );
}

/*
 * ============================================================
 * GET A SINGLE ASSIGNMENT
 * ============================================================
 */

export async function getOrganizationalAssignment(
  assignmentId: string,
): Promise<OrganizationalAssignment | null> {
  if (!assignmentId) {
    return null;
  }

  const assignmentRef = doc(db, COLLECTION, assignmentId);

  const snapshot = await getDoc(assignmentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapAssignment(snapshot.id, snapshot.data());
}

/*
 * ============================================================
 * FIND ASSIGNMENTS BY POSITION
 * ============================================================
 */

export async function getUserAssignmentsByPosition(
  userId: string,
  position: OrganizationalPosition,
): Promise<OrganizationalAssignment[]> {
  if (!userId) {
    return [];
  }

  const assignmentsRef = collection(db, COLLECTION);

  const q = query(
    assignmentsRef,
    where("user_id", "==", userId),
    where("position", "==", position),
    where("status", "==", "active"),
    orderBy("created_at", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((assignmentDoc) =>
    mapAssignment(assignmentDoc.id, assignmentDoc.data()),
  );
}

/*
 * ============================================================
 * FIND ASSIGNMENTS BY SCOPE
 * ============================================================
 */

export async function getUserAssignmentsByScope(
  userId: string,
  scopeType: ScopeType,
  scopeId: string,
): Promise<OrganizationalAssignment[]> {
  if (!userId || !scopeId) {
    return [];
  }

  const assignmentsRef = collection(db, COLLECTION);

  const q = query(
    assignmentsRef,
    where("user_id", "==", userId),
    where("scope_type", "==", scopeType),
    where("scope_id", "==", scopeId),
    where("status", "==", "active"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((assignmentDoc) =>
    mapAssignment(assignmentDoc.id, assignmentDoc.data()),
  );
}
