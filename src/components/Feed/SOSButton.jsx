import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { triggerSOS } from "../../services/sosService";

const SOSButton = () => {
  const { user } = useAuth();
  const [step, setStep] = useState("idle"); // idle, confirm, sending, sent

  const handleSOS = async () => {
    if (step === "idle") {
      setStep("confirm");
      // Auto-reset if they don't confirm in 3 seconds
      setTimeout(() => setStep("idle"), 3000);
      return;
    }

    if (step === "confirm") {
      setStep("sending");

      // Get Location instantly
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const success = await triggerSOS(user, loc);
          if (success) {
            setStep("sent");
            setTimeout(() => setStep("idle"), 5000);
          }
        },
        (err) => {
          alert("GPS Required for SOS!");
          setStep("idle");
        }
      );
    }
  };

  // Visual States
  const styles = {
    idle: "bg-red-600 hover:bg-red-700",
    confirm: "bg-red-800 animate-pulse ring-4 ring-red-300",
    sending: "bg-gray-500 cursor-wait",
    sent: "bg-green-600",
  };

  const labels = {
    idle: "SOS",
    confirm: "CONFIRM?",
    sending: "SENDING...",
    sent: "ALERT SENT",
  };

  return (
    <button
      onClick={handleSOS}
      className={`fixed bottom-6 left-6 z-50 w-20 h-20 rounded-full text-white font-black shadow-2xl border-4 border-white flex items-center justify-center text-xs transition-all duration-200 transform hover:scale-105 ${styles[step]}`}
    >
      {labels[step]}
    </button>
  );
};

export default SOSButton;
