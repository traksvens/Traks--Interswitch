import { db } from "./firebase";
import { sendSOSEmail } from "./db";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

export const triggerSOS = async (user, location) => {
  const hasValidCoordinates =
    typeof location?.lat === "number" && typeof location?.lng === "number";

  if (!user?.uid || !hasValidCoordinates) {
    console.error("SOS Error: Missing required user or location payload.");
    return false;
  }

  try {
    const alertRef = await addDoc(collection(db, "sos_alerts"), {
      reporterId: user.uid,
      reporterName: user.displayName ?? "Anonymous User",
      location,
      status: "Active",
      timestamp: serverTimestamp(),
      resolvedAt: null,
      emailStatus: "pending",
    });

    try {
      const result = await sendSOSEmail({
        reporterId: user.uid,
        reporterName: user.displayName ?? "Anonymous User",
        location,
      });

      await updateDoc(alertRef, {
        emailStatus: result.delivered ? "sent" : "skipped",
      });
    } catch (emailError) {
      console.error("SOS Email Error:", emailError);
      await updateDoc(alertRef, {
        emailStatus: "failed",
        emailError: emailError.message,
      });
    }

    return true;
  } catch (error) {
    console.error("SOS Error:", error);
    return false;
  }
};

export const resolveSOS = async (alertId) => {
  const alertRef = doc(db, "sos_alerts", alertId);
  await updateDoc(alertRef, {
    status: "Resolved",
    resolvedAt: serverTimestamp(),
  });
};
