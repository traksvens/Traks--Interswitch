import { db } from "./firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

const DEFAULT_BVN_SIMULATION = "12345678901";

const normalizeUserPayload = (user) => ({
  displayName: user.displayName ?? "Anonymous User",
  email: user.email ?? null,
  photoURL: user.photoURL ?? null,
  isVerified: false,
  joinedAt: serverTimestamp(),
  bvnSimulation: DEFAULT_BVN_SIMULATION,
});

export const upsertUserProfile = async (user) => {
  if (!user?.uid) {
    throw new Error("Cannot create user profile without a valid uid.");
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return { created: false, profile: userSnap.data() };
  }

  const payload = normalizeUserPayload(user);
  await setDoc(userRef, payload);

  return { created: true, profile: payload };
};

const getRequiredEnv = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const sendSOSEmail = async ({ reporterName, reporterId, location }) => {
  const endpoint = import.meta.env.VITE_SOS_EMAIL_ENDPOINT;

  // Keep the SOS flow operational even when email service is not configured.
  if (!endpoint) {
    return { delivered: false, skipped: true, reason: "missing_endpoint" };
  }

  const apiKey = getRequiredEnv("VITE_SOS_EMAIL_API_KEY");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      reporterName,
      reporterId,
      location,
      triggeredAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to dispatch SOS email notification (${response.status}): ${errorBody}`
    );
  }

  return { delivered: true, skipped: false };
};
