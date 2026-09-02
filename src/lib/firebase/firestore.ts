import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./config";

// ============================================================
// ORGANIZATIONAL ASSIGNMENTS
// ============================================================

import type { OrganizationalAssignment } from "@/types";

/**
 * Get all active organizational assignments for a user.
 *
 * Security rules already ensure that a normal user can only
 * read assignments belonging to themselves.
 */
export async function getUserOrganizationalAssignments(
  userId: string,
): Promise<OrganizationalAssignment[]> {
  const q = query(
    collection(db, "organizational_assignments"),
    where("user_id", "==", userId),
    where("status", "==", "active"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as OrganizationalAssignment[];
}

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export async function getAllUsers() {
  const q = query(collection(db, "users"), orderBy("created_at", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function getUserProfile(userId: string) {
  const snap = await getDoc(doc(db, "users", userId));

  return snap.exists()
    ? {
        id: snap.id,
        ...snap.data(),
      }
    : null;
}

export async function updateUserProfile(
  userId: string,
  data: Record<string, unknown>,
) {
  await updateDoc(doc(db, "users", userId), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

// ─────────────────────────────────────────────
// Tasks
// ─────────────────────────────────────────────

export async function getActiveTasks() {
  const q = query(
    collection(db, "tasks"),
    where("status", "==", "active"),
    orderBy("created_at", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function getAllTasks() {
  const q = query(collection(db, "tasks"), orderBy("created_at", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function createTask(taskData: Record<string, unknown>) {
  const docRef = await addDoc(collection(db, "tasks"), {
    ...taskData,
    status: "active",
    created_at: serverTimestamp(),
  });

  return docRef.id;
}

// ─────────────────────────────────────────────
// Task submissions
// ─────────────────────────────────────────────

/**
 * Creates a single submission for a member/task combination.
 *
 * IMPORTANT:
 * The document ID is deterministic:
 *
 *     {taskId}_{userId}
 *
 * This matches the Firestore Security Rules and prevents a member
 * from submitting the same task multiple times.
 *
 * Proof URL:
 * - Like       → not required
 * - Comment    → not required
 * - Share      → required
 * - Make post  → required
 */
export async function submitTaskCompletion(
  taskId: string,
  userId: string,
  proofUrl?: string,
) {
  const submissionId = `${taskId}_${userId}`;

  const submissionRef = doc(db, "task_submissions", submissionId);

  await setDoc(submissionRef, {
    task_id: taskId,
    user_id: userId,
    proof_url: proofUrl?.trim() || null,
    status: "pending",
    submitted_at: serverTimestamp(),
  });
}

/**
 * Gets all submissions for a specific task.
 *
 * Admin use only.
 *
 * Firestore has no joins, so we resolve each submitter's profile
 * individually.
 */
export async function getSubmissionsForTaskWithUsers(taskId: string) {
  const q = query(
    collection(db, "task_submissions"),
    where("task_id", "==", taskId),
    orderBy("submitted_at", "desc"),
  );

  const snap = await getDocs(q);

  const submissions = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as {
    id: string;
    user_id: string;
    [key: string]: unknown;
  }[];

  const withUsers = await Promise.all(
    submissions.map(async (submission) => {
      const user = await getUserProfile(submission.user_id);

      return {
        ...submission,
        user,
      };
    }),
  );

  return withUsers;
}

/**
 * Gets the current user's task submissions.
 */
export async function getUserTaskSubmissions(userId: string) {
  const q = query(
    collection(db, "task_submissions"),
    where("user_id", "==", userId),
    orderBy("submitted_at", "desc"),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/**
 * Verifies a task submission and awards the task points.
 *
 * Everything happens inside one Firestore transaction so that:
 *
 * 1. A submission cannot be verified twice.
 * 2. Points are only awarded once.
 * 3. The submission and user's points stay synchronized.
 */
export async function verifyTaskSubmission(
  submissionId: string,
  adminId: string,
) {
  await runTransaction(db, async (transaction) => {
    const submissionRef = doc(db, "task_submissions", submissionId);

    const submissionSnap = await transaction.get(submissionRef);

    if (!submissionSnap.exists()) {
      throw new Error("Submission not found");
    }

    const submissionData = submissionSnap.data();

    // Prevent double verification / double points.
    if (submissionData.status === "verified") {
      throw new Error("Submission has already been verified");
    }

    const taskId = submissionData.task_id;
    const userId = submissionData.user_id;

    if (!taskId || !userId) {
      throw new Error("Submission is missing task or user information");
    }

    const taskRef = doc(db, "tasks", taskId);

    const taskSnap = await transaction.get(taskRef);

    if (!taskSnap.exists()) {
      throw new Error("Task not found");
    }

    const taskData = taskSnap.data();
    const points = Number(taskData.points ?? 0);

    if (points <= 0) {
      throw new Error("This task does not have valid points assigned");
    }

    const userRef = doc(db, "users", userId);

    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) {
      throw new Error("Member profile not found");
    }

    // Mark submission verified.
    transaction.update(submissionRef, {
      status: "verified",
      verified_at: serverTimestamp(),
      verified_by: adminId,
    });

    // Award points exactly once.
    transaction.update(userRef, {
      points: increment(points),
      updated_at: serverTimestamp(),
    });
  });
}

// ─────────────────────────────────────────────
// Leaderboard
// ─────────────────────────────────────────────

export async function getLeaderboard(topN: number = 50) {
  const q = query(
    collection(db, "users"),
    orderBy("points", "desc"),
    limit(topN),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ─────────────────────────────────────────────
// News
// ─────────────────────────────────────────────

export async function getPublishedNews() {
  const q = query(
    collection(db, "news"),
    where("published", "==", true),
    orderBy("created_at", "desc"),
    limit(10),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────

export async function getUpcomingEvents() {
  const today = new Date().toISOString().split("T")[0];

  const q = query(
    collection(db, "events"),
    where("date", ">=", today),
    orderBy("date", "asc"),
    limit(5),
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

// ─────────────────────────────────────────────
// Election results
// ─────────────────────────────────────────────

export interface ElectionResult {
  party: string;
  votes: number;
}

/**
 * Submits a polling unit's election results as a SINGLE document,
 * keyed by a deterministic ID derived from ward_id + polling_unit_id.
 *
 * Document ID:
 *
 *     {ward_id}__{polling_unit_id}
 *
 * Firestore Security Rules prevent a second submission for the
 * same polling unit.
 */
export async function submitElectionResult(
  pollingUnitId: string,
  wardId: string,
  results: ElectionResult[],
  userId: string,
) {
  const resultDocId = `${wardId}__${pollingUnitId}`;

  const resultRef = doc(db, "election_results", resultDocId);

  await setDoc(resultRef, {
    ward_id: wardId,
    polling_unit_id: pollingUnitId,
    results,
    submitted_by: userId,
    verified: false,
    created_at: serverTimestamp(),
  });
}
