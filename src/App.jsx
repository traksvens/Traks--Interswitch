import { useState } from "react";

// CONTEXT
import { AuthProvider, useAuth } from "./context/AuthContext";

// SERVICES
import { signInWithGoogle, logout } from "./services/firebase";

// HOOKS
import { usePosts } from "./hooks/usePosts";
import { useSOS } from "./hooks/useSOS";

// COMPONENTS
import VerificationGate from "./components/Auth/VerificationGate";
import PostCard from "./components/Feed/PostCard";
import CreatePostModal from "./components/Input/CreatePostModal";
import SOSButton from "./components/Feed/SOSButton";
import SOSBanner from "./components/Feed/SOSBanner";
import SecurityMap from "./components/Feed/SecurityMap";

// --- INTERNAL DASHBOARD COMPONENT ---
const Dashboard = () => {
  const { user, profile } = useAuth();

  // DATA HOOKS
  const { posts, loading } = usePosts();
  const { activeAlerts } = useSOS();

  // LOCAL UI STATE
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'map'

  // 1. LOGIN SCREEN (If no user)
  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Traks.</h1>
          <p className="text-gray-600">Secure Regional Security Tracker</p>
        </div>
        <button
          onClick={signInWithGoogle}
          className="bg-white text-gray-700 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="G"
            className="w-6 h-6"
          />
          Sign In with Google
        </button>
      </div>
    );
  }

  // 2. MAIN DASHBOARD
  return (
    <div className="relative min-h-screen bg-gray-50 pb-24">
      {/* --- THE PANIC BUTTON (Fixed Bottom Left) --- */}
      <SOSButton />

      {/* --- HEADER --- */}
      <header className="bg-white shadow-sm sticky top-0 z-40 px-4 py-3">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo & Badge */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <h1 className="text-2xl font-bold text-green-900 tracking-tighter">
              Traks
            </h1>
            <div className="flex items-center gap-2">
              {profile?.isVerified && (
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                  <span>🛡️</span> Verified
                </span>
              )}
              <button
                onClick={logout}
                className="text-xs text-red-500 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>

          {/* View Toggle (List vs Map) */}
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1 w-full md:w-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 md:flex-none px-6 py-1.5 rounded-md text-sm font-medium transition duration-200 ${
                viewMode === "list"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex-1 md:flex-none px-6 py-1.5 rounded-md text-sm font-medium transition duration-200 ${
                viewMode === "map"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Live Map
            </button>
          </div>
        </div>
      </header>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-2xl mx-auto mt-4 px-4">
        {/* A. SOS BANNERS (Always show first, regardless of view) */}
        {activeAlerts.map((alert) => (
          <SOSBanner key={alert.id} alert={alert} />
        ))}

        {/* B. MAIN CONTENT */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : viewMode === "list" ? (
          // LIST VIEW
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p>No reports in your area yet.</p>
                <p className="text-sm">Be the first to report.</p>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        ) : (
          // MAP VIEW
          <div className="mt-2">
            <SecurityMap posts={posts} activeAlerts={activeAlerts} />
          </div>
        )}
      </div>

      {/* --- FLOATING REPORT BUTTON (Bottom Right) --- */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-green-900 text-white p-4 rounded-full shadow-xl hover:bg-green-800 transition hover:scale-105 z-50 flex items-center justify-center gap-2"
      >
        <span className="text-2xl">+</span>
        <span className="font-bold pr-1 hidden md:inline">Report</span>
      </button>

      {/* --- MODAL --- */}
      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onSuccess={() => alert("Post Live! Verifying with Gemini...")}
        />
      )}
    </div>
  );
};

// --- ROOT APP COMPONENT ---
function App() {
  return (
    <AuthProvider>
      <VerificationGate>
        <Dashboard />
      </VerificationGate>
    </AuthProvider>
  );
}

export default App;
