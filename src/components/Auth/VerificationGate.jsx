import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { loadInterswitchScript } from "../../services/interswitch";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

const VerificationGate = ({ children }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInterswitchScript();
  }, []);

  // 1. If user is NOT verified, show the Paywall
  if (profile && !profile.isVerified) {
    const handlePayment = () => {
      if (!window.webpayCheckout) {
        alert("Payment system loading...");
        return;
      }

      setLoading(true);

      const paymentParams = {
        merchant_code: "MX153376", // TEST MODE
        pay_item_id: "5558761", // TEST MODE
        txn_ref: "TRAK-" + Date.now(), // Unique Ref
        amount: 5000, // 50.00 NGN in Kobo
        currency: 566, // Naira
        site_redirect_url: window.location.origin,
        onComplete: async (response) => {
          console.log("Payment Response:", response);
          // NOTE: In production, verifying response.resp_code === '00'
          // is best done on the backend. For Hackathon MVP, we do it here.

          if (response.resp_code === "00") {
            // SUCCESS! Unlock the Gate.
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              isVerified: true,
              verificationTxnRef: response.txn_ref,
              verifiedAt: serverTimestamp(),
            });
            alert("Identity Verified! Welcome to Traks.");
          } else {
            alert("Transaction Failed. Try again.");
          }
          setLoading(false);
        },
      };

      window.webpayCheckout(paymentParams);
    };

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Identity Unverified
          </h1>
          <p className="text-gray-600 mb-6">
            To ensure the safety of the Traks community, we require a one-time
            verification fee of
            <span className="font-bold"> ₦50</span>.
          </p>
          <div className="bg-blue-50 p-4 rounded mb-6 text-sm text-left">
            <p>
              <strong>Why?</strong> This confirms you have a valid Nigerian bank
              account and traceable identity.
            </p>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition"
          >
            {loading ? "Processing..." : "Pay ₦50 to Verify"}
          </button>

          <p className="mt-4 text-xs text-gray-400">Powered by Interswitch</p>
        </div>
      </div>
    );
  }

  // 2. If Verified (or not logged in yet), show the app
  return <>{children}</>;
};

export default VerificationGate;
