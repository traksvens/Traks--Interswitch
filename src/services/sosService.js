import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";

export const triggerSOS = async (user, location) => {
  try {
    await addDoc(collection(db, "sos_alerts"), {
      reporterId: user.uid,
      reporterName: user.displayName, // Always real name for SOS
      location: location, // { lat, lng }
      status: "Active",
      timestamp: serverTimestamp(),
      resolvedAt: null,
    });
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
