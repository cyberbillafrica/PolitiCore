import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./config";

import type { Permission, PermissionGrant, ScopeType } from "@/types";

const COLLECTION = "permission_grants";

// ============================================================
// GET USER GRANTS
// ============================================================

export async function getUserPermissionGrants(
  userId: string,
): Promise<PermissionGrant[]> {
  const q = query(collection(db, COLLECTION), where("user_id", "==", userId));

  const snap = await getDocs(q);

  return snap.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as PermissionGrant[];
}

// ============================================================
// CREATE GRANT
// ============================================================

export async function createPermissionGrant(data: {
  tenant_id: string;

  user_id: string;

  permission: Permission;

  granted: boolean;

  scope_type?: ScopeType | null;
  scope_id?: string | null;

  granted_by: string;
}) {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,

    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return ref.id;
}
