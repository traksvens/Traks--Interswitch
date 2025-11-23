import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { resolveSOS } from "../../services/sosService";

const SOSBanner = ({ alert }) => {
  const { user } = useAuth();

  // Only the person who sent it (or an Admin) can resolve it
  const canResolve = user.uid === alert.reporterId;

  return (
    <div className="bg-red-600 text-white p-4 rounded-lg mb-4 shadow-lg animate-pulse border-l-8 border-red-900 flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          <h3 className="font-bold text-lg">EMERGENCY ALERT</h3>
        </div>
        <p className="text-sm mt-1">
          <span className="font-bold">{alert.reporterName}</span> requested
          immediate help!
        </p>
        <p className="text-xs text-red-200 mt-1">
          Location: {alert.location.lat.toFixed(4)},{" "}
          {alert.location.lng.toFixed(4)} •{" "}
          {alert.timestamp
            ? formatDistanceToNow(alert.timestamp.toDate())
            : "Just now"}
        </p>
      </div>

      {canResolve && (
        <button
          onClick={() => resolveSOS(alert.id)}
          className="bg-white text-red-600 px-4 py-2 rounded font-bold text-sm hover:bg-gray-100"
        >
          MARK SAFE
        </button>
      )}
    </div>
  );
};

export default SOSBanner;
