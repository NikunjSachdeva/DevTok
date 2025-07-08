import React, { useState, useEffect } from "react";
import axios from "axios";


import {
  FaThLarge,
  FaHeart,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function App() {
  const [activeTab, setActiveTab] = useState("snaps");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [allSnaps, setAllSnaps] = useState([]);
  const username = localStorage.getItem('username');
  const uid = localStorage.getItem('uid');
  const [editMode, setEditMode] = useState(false);
  
  const [bio, setBio] = useState("");
  const [updateMessage, setUpdateMessage] = useState(null);
  const [email, setEmail] = localStorage.getItem("email");  // fetch from backend/localStorage as needed



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/update_profile/", {
        uid,
        username,
        email,
        bio
      });

      alert("✅ Profile updated!");
      setEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error("Update failed:", err);
      alert("❌ " + (err.response?.data?.detail || "Update failed"));
    }
  };
  useEffect(() => {
    const fetchSnaps = async () => {
      try {
        const response = await axios.get("http://localhost:8000/fetch_snaps");
        setAllSnaps(response.data);
      } catch (err) {
        console.error("❌ Error fetching snaps:", err);
      }
    };
    fetchSnaps();
  }, []);

  const userSnaps = allSnaps.filter(snap => snap.username === username);
  const likedSnaps = allSnaps.filter(snap => snap.liked_users?.includes(uid));

  const snapsToDisplay = activeTab === "snaps" ? userSnaps : likedSnaps;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <div className="text-white font-bold text-xl select-none">DevTok</div>
          {/* Desktop Navi */}
          <nav className="hidden md:flex space-x-8 text-gray-300">
            <a
              href="#snaps"
              className="flex items-center gap-1 border-b-2 border-transparent hover:border-purple-600 cursor-pointer transition"
              onClick={() => setActiveTab("snaps")}
            >
              <FaThLarge className="text-purple-600" />
              <span className={activeTab === "snaps" ? "text-purple-600 font-semibold" : ""}>Snaps</span>
            </a>
            <a
              href="#liked"
              className="flex items-center gap-1 border-b-2 border-transparent hover:border-purple-600 cursor-pointer transition"
              onClick={() => setActiveTab("liked")}
            >
              <FaHeart className="text-gray-400" />
              <span className={activeTab === "liked" ? "text-purple-600 font-semibold" : ""}>Liked</span>
            </a>
          </nav>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-3 space-y-2 text-gray-300">
            
            <a
              href="#snaps-mobile"
              className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md ${
                activeTab === "snaps" ? "bg-purple-700 text-purple-300 font-semibold" : "hover:bg-gray-700"
              }`}
              onClick={() => {
                setActiveTab("snaps");
                setMobileMenuOpen(false);
              }}
            >
              <FaThLarge />
              Snaps
            </a>
            <a
              href="#liked-mobile"
              className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md ${
                activeTab === "liked" ? "bg-purple-700 text-purple-300 font-semibold" : "hover:bg-gray-700"
              }`}
              onClick={() => {
                setActiveTab("liked");
                setMobileMenuOpen(false);
              }}
            >
              <FaHeart />
              Liked
            </a>
          </nav>
          
        )}
      </header>
<div>
      {/* Main Content */}
      <main className="flex-grow flex justify-center items-start pt-12 px-4">
        <section className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-w-3xl w-full text-gray-300 p-8 space-y-6">
          {/* Profile Header */}
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 rounded-full bg-purple-700 ring-4 ring-purple-500" />
            <div className="flex flex-col flex-grow">
              <h1 className="text-gray-100 font-semibold text-2xl select-text">{username}</h1>
              <p className="text-gray-400 text-sm leading-relaxed mt-1 max-w-md select-text">
                {/* Replace this with actual user bio if available */}
                {bio}
                
              </p>
              <div className="flex gap-6 mt-3 text-gray-300 text-sm select-text">
                <div>
                  <strong className="text-white">{userSnaps.length}</strong> Snaps
                </div>
                <div>
                  <strong className="text-white">{likedSnaps.length}</strong> Liked
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditMode(!editMode)}
                className="mt-4 w-max rounded bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </button>

  {editMode && (
<form onSubmit={handleSubmit} className="mt-4 space-y-3">
  <div>
    {/* <label className="block text-sm text-gray-400">New Username</label>
    <input
      type="text"
      // value={newUsername}
      // onChange={(e) => setNewUsername(e.target.value)}
      className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 mt-1 text-gray-200"
      required
    /> */}
  </div>
  <div>
    <label className="block text-sm text-gray-400">Bio</label>
    <textarea
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 mt-1 text-gray-200"
      rows={3}
      placeholder="Write a short bio"
    />
  </div>
  <button
    type="submit"
    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow transition"
  >
    Save Changes
  </button>
  {updateMessage && <p className="text-sm text-green-400 mt-2">{updateMessage}</p>}
</form>
)}
</div>
          </div>

          {/* Snaps Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            {snapsToDisplay.map((snap) => (
              <div key={snap.id} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg p-4">
                <video src={snap.video_url} controls className="w-full rounded-md mb-2" />
                <h3 className="text-lg font-semibold text-white">{snap.title}</h3>
                <p className="text-sm text-gray-400">{snap.description}</p>
                <div className="text-sm mt-1">
                  <span className="text-purple-400">#{snap.hashtags?.join(" #")}</span>
                </div>
                <div className="text-sm text-gray-400 mt-2">❤️ {snap.likes} likes</div>
              </div>
            ))}

            {snapsToDisplay.length === 0 && (
              <div className="text-center col-span-full text-gray-500">No snaps to display.</div>
            )}
          </div>
        </section>
      </main>

      {/* Footer (keep as-is) */}
    </div>



      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 text-gray-400 mt-auto">
        <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row items-center justify-between px-4 py-4 space-y-3 md:space-y-0 text-sm select-none">
          <div>© 2025 DevTok. All rights reserved.</div>
          <nav className="flex gap-6">
            <a
              href="#privacy"
              className="hover:text-purple-500 transition focus:outline-none focus:ring-2 focus:ring-purple-600 rounded"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              className="hover:text-purple-500 transition focus:outline-none focus:ring-2 focus:ring-purple-600 rounded"
            >
              Terms of Service
            </a>
            <a
              href="#contact"
              className="hover:text-purple-500 transition focus:outline-none focus:ring-2 focus:ring-purple-600 rounded"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

