import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

export const useSOS = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Query: Only Active alerts, sorted by newest
    const q = query(
      collection(db, "sos_alerts"),
      where("status", "==", "Active"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlerts(data);
    });

    return () => unsubscribe();
  }, []);

  return { activeAlerts: alerts };
};
