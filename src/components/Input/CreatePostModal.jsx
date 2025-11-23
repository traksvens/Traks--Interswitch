import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { analyzeSecurityReport } from "../../services/gemini";

const CreatePostModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, locating, analyzing, saving

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    try {
      // 1. Get Location
      setStatus("📍 Acquiring GPS...");
      const location = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) reject("Geolocation not supported");
        navigator.geolocation.getCurrentPosition(
          (position) =>
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }),
          (error) => reject(error)
        );
      });

      // 2. AI Analysis
      setStatus("🤖 Analyzing Threat...");
      const analysis = await analyzeSecurityReport(content);

      // 3. Save to Firestore
      setStatus("💾 Posting...");
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        displayName: user.displayName, // We store real name
        isAnonymous: isAnonymous, // But flag it if hidden
        content: content,
        location: location, // { lat, lng }
        incidentType: analysis.incidentType,
        severity: analysis.severity,
        confirmCount: 0,
        refuteCount: 0,
        ratedBy: {},
        timestamp: serverTimestamp(),
      });

      setContent("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Post Error:", error);
      alert(
        "Error: Could not get location or analysis. Ensure GPS is allowed."
      );
    } finally {
      setLoading(false);
      setStatus("idle");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Report Incident</h2>

        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full border p-3 rounded h-32 mb-4 focus:ring-2 focus:ring-green-500"
            placeholder="What is happening? (e.g. Accident at ABUAD gate...)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="anon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="anon" className="text-gray-700 text-sm">
              Post Anonymously
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? status : "Post Alert"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
