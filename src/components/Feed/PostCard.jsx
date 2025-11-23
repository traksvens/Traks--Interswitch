import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns"; // You might need: npm install date-fns

const PostCard = ({ post }) => {
  const { user } = useAuth();
  const [voting, setVoting] = useState(false);

  // 1. Calculate Trust Score Dynamically
  const totalVotes = post.confirmCount + post.refuteCount;
  const trustScore =
    totalVotes === 0 ? 0 : Math.round((post.confirmCount / totalVotes) * 100);

  // 2. Determine Badge Color based on Severity
  const severityColor =
    {
      High: "bg-red-100 text-red-800 border-red-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Low: "bg-gray-100 text-gray-800 border-gray-200",
    }[post.severity] || "bg-gray-100 text-gray-800";

  // 3. Check if current user already voted
  const userVote = post.ratedBy?.[user.uid]; // 'confirm' | 'refute' | undefined

  // 4. Handle Voting
  const handleVote = async (type) => {
    if (voting || userVote) return; // Prevent double voting or spamming

    setVoting(true);
    const postRef = doc(db, "posts", post.id);

    try {
      // Atomic Update: Increment count AND track user ID
      await updateDoc(postRef, {
        [`${type}Count`]: increment(1),
        [`ratedBy.${user.uid}`]: type,
      });
    } catch (error) {
      console.error("Voting failed:", error);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 transition hover:shadow-md">
      {/* Header: User Info & Trust Score */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar Logic */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              post.isAnonymous ? "bg-gray-200" : "bg-blue-100"
            }`}
          >
            {post.isAnonymous ? (
              <span className="text-xl">👻</span>
            ) : (
              <img
                src={post.photoURL || "https://via.placeholder.com/40"}
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
            )}
          </div>

          <div>
            <p className="font-bold text-gray-900">
              {post.isAnonymous ? "Anonymous Reporter" : post.displayName}
            </p>
            <p className="text-xs text-gray-500">
              {post.timestamp
                ? formatDistanceToNow(post.timestamp.toDate()) + " ago"
                : "Just now"}
            </p>
          </div>
        </div>

        {/* Dynamic Trust Badge */}
        <div
          className={`px-2 py-1 rounded text-xs font-bold ${
            trustScore >= 80
              ? "bg-green-100 text-green-800"
              : trustScore >= 50
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {totalVotes === 0 ? "New Report" : `${trustScore}% Trust`}
        </div>
      </div>

      {/* Content & AI Tags */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded border ${severityColor}`}
          >
            {post.severity} Risk
          </span>
          <span className="text-xs px-2 py-0.5 rounded border bg-blue-50 text-blue-800 border-blue-100">
            {post.incidentType}
          </span>
        </div>
        <p className="text-gray-800 leading-relaxed">{post.content}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-3 mt-2">
        {/* CONFIRM BUTTON */}
        <button
          onClick={() => handleVote("confirm")}
          disabled={!!userVote}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition ${
            userVote === "confirm"
              ? "bg-green-600 text-white"
              : userVote
              ? "opacity-30"
              : "hover:bg-green-50 text-gray-600"
          }`}
        >
          <span>✅ Confirm</span>
          <span>{post.confirmCount}</span>
        </button>

        {/* REFUTE BUTTON */}
        <button
          onClick={() => handleVote("refute")}
          disabled={!!userVote}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition ${
            userVote === "refute"
              ? "bg-red-600 text-white"
              : userVote
              ? "opacity-30"
              : "hover:bg-red-50 text-gray-600"
          }`}
        >
          <span>❌ Refute</span>
          <span>{post.refuteCount}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
