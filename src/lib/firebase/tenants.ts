/**
 * Current campaign tenant.
 *
 * Keep this as the single source of truth for tenant-aware
 * Firestore records until the application supports selecting
 * between multiple campaigns/tenants dynamically.
 */
export const CURRENT_TENANT_ID = "ifeanyi-2027";
// src/lib/firebase/tenants.ts

import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";

/**
 * Current campaign tenant.
 * Keep this as the single source of truth for tenant-aware
 * Firestore records until the application supports selecting
 * between multiple campaigns/tenants dynamically.
 */

/**
 * Get the current tenant context.
 * For now, returns the static tenant. Later, this will resolve
 * from subdomain or user context.
 */
export async function getCurrentTenant(): Promise<{ id: string; name: string }> {
  // For now, return the static tenant
  // Later: resolve from subdomain, user profile, or session
  
  // Optionally, fetch tenant data from Firestore
  try {
    const ref = doc(db, "tenants", CURRENT_TENANT_ID);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: CURRENT_TENANT_ID,
        name: data.name || "Ifeanyi 2027",
      };
    }
  } catch (error) {
    console.error("Error fetching tenant:", error);
  }
  
  return {
    id: CURRENT_TENANT_ID,
    name: "Ifeanyi 2027",
  };
}

/**
 * Get tenant by subdomain (for future multi-tenant support)
 */
export async function getTenantBySubdomain(subdomain: string): Promise<{ id: string; name: string } | null> {
  try {
    // Query tenants collection by subdomain
    // This assumes you have a 'subdomain' field in tenant documents
    // For now, this is a placeholder
    const ref = doc(db, "tenants", subdomain);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        name: data.name || subdomain,
      };
    }
  } catch (error) {
    console.error("Error fetching tenant by subdomain:", error);
  }
  
  return null;
}