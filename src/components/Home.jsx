  import { useEffect, useState } from 'react';
import { FaPlay, FaHeart, FaComment, FaShareAlt, FaBars, FaTimes, FaRegHeart, FaRegComment, FaPaperPlane, FaUserCircle, FaCode, FaRobot } from 'react-icons/fa';
import { Link } from "react-router-dom";
import axios from 'axios';
import { getAuth } from "firebase/auth";
import RunCode from './RunCode';
import QuizGenerator from './QuizGenerator';

const auth = getAuth();
const currentUserUid = auth.currentUser?.uid;

const ExplainButton = ({ videoData }) => {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleExplainClick = async () => {
    if (!videoData?.video_url) {
      setError("No video URL provided");
      return;
    }
    
    setIsOpen(true);
    if (explanation) return; // Already explained
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        "https://d5e7-34-148-200-164.ngrok-free.app/transcribe_video", 
        {
          video_url: videoData.video_url,
          code_snippet: videoData.code_snippet || "",  
          video_id: "tempVid123"
        },
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          }
        }
      );
      
      if (response.data?.explanation) {
        setExplanation(response.data.explanation);
      } else {
        setError("No explanation received from server");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.detail || error.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExplainClick}
        className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2 font-medium"
      >
        <FaRobot size={18} />
        {loading ? 'Processing...' : 'AI Explanation'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-700/50">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">AI Explanation</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                  <p className="text-gray-400 mt-4">Generating explanation...</p>
                </div>
              ) : error ? (
                <div className="bg-red-900/30 border border-red-800 p-4 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="markdown-content whitespace-pre-wrap text-gray-300">
                    {explanation.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [snaps, setSnaps] = useState([]);
  const [activeCommentSnapId, setActiveCommentSnapId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Enhanced fetch with loading state
  useEffect(() => {
    
    const fetchSnaps = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://127.0.0.1:8000/fetch_snaps/");
        setSnaps(res.data);
      } catch (err) {
        console.error("Failed to fetch snaps", err);
      } finally {
        setLoading(false);
      }
    };
    
  
    fetchSnaps();
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  
  const handleLike = async (snapId) => {
    const uid = localStorage.getItem('uid');
    const username = localStorage.getItem('username');
    
    try {
      const response = await axios.post(`http://127.0.0.1:8000/like_snap/${snapId}`, {
        uid,
        username,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data.message === "Snap liked successfully!") {
        setSnaps(prev =>
          prev.map(s => s.id === snapId ? { ...s, likes: s.likes + 1, liked: true } : s)
        );
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error("Failed to like snap", err);
    }
  };

  const fetchComments = async (snapId) => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/comments/${snapId}`);
      setComments(prev => ({ ...prev, [snapId]: res.data.comments }));
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };
  
  const toggleComments = (snapId) => {
    if (activeCommentSnapId === snapId) {
      setActiveCommentSnapId(null);
    } else {
      setActiveCommentSnapId(snapId);
      fetchComments(snapId);
    }
  };
  
  const postComment = async (snapId) => {
    if (!newComment.trim()) return;
    
    const uid = localStorage.getItem('uid');
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');
    
    try {
      await axios.post(`http://127.0.0.1:8000/comment_snap/${snapId}`, {
        comment: newComment,
        uid,
        email,
        username,
      });
      
      setNewComment("");
      fetchComments(snapId);
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  // Filter snaps based on search query
  const filteredSnaps = snaps.filter(snap => 
    snap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snap.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md shadow-lg border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/Home" className="flex items-center gap-2 group">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text tracking-wide transition-transform group-hover:scale-105">
                DevTok
              </span>
              <span className="text-xs bg-gradient-to-r from-purple-400 to-pink-500 px-2 py-0.5 rounded-full font-medium opacity-80">BETA</span>
            </a>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-900/70 border border-gray-700 focus:border-purple-500 text-white rounded-full px-4 py-1.5 pr-10 w-64 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search absolute right-3 top-2 text-gray-500" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </div>
              
              <Link to="/Home" className="hover:text-purple-400 transition-all relative group">
                <span>Home</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/upload_snap" className="hover:text-purple-400 transition-all relative group">
                <span>Upload</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/Profile" className="hover:text-purple-400 transition-all relative group">
                <span>Profile</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </nav>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu} 
              className="md:hidden text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 animate-slide-down">
              <div className="flex flex-col space-y-3 pb-4">
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-900/70 border border-gray-700 focus:border-purple-500 text-white rounded-full px-4 py-1.5 pr-10 w-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search absolute right-3 top-2 text-gray-500" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </div>
                
                <Link to="/Home" className="hover:text-purple-400 transition-all py-2" onClick={toggleMobileMenu}>Home</Link>
                <Link to="/upload_snap" className="hover:text-purple-400 transition-all py-2" onClick={toggleMobileMenu}>Upload</Link>
                <Link to="/Profile" className="hover:text-purple-400 transition-all py-2" onClick={toggleMobileMenu}>Profile</Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Greeting */}
        {user && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
              Welcome back, {user.username}!
            </h1>
            <p className="text-gray-400 mt-1">Explore coding tutorials from our community</p>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Skeleton Loader
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-800/80 rounded-3xl overflow-hidden shadow-lg animate-pulse">
                <div className="aspect-video bg-gray-700/50 rounded-t-3xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                  <div className="h-32 bg-gray-700 rounded"></div>
                  <div className="flex gap-4 pt-4">
                    <div className="h-8 bg-gray-700 rounded-full w-20"></div>
                    <div className="h-8 bg-gray-700 rounded-full w-20"></div>
                    <div className="h-8 bg-gray-700 rounded-full w-20"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredSnaps.length > 0 ? (
            filteredSnaps.map((snap) => (
              <div
                key={snap.id}
                className="bg-gray-800/80 hover:bg-gray-800/90 rounded-3xl overflow-hidden shadow-2xl hover:shadow-purple-700/20 transition-all duration-500 transform hover:-translate-y-1 border border-gray-700/50"
              >
                {/* Video Player */}
                <div className="relative aspect-video rounded-t-3xl overflow-hidden group">
                  <video
                    src={snap.video_url}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    controls
                    playsInline
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()}
                    onError={(e) => {
                      console.error("Video loading error:", e);
                      console.log("Video URL:", snap.video_url);
                    }}
                    onLoadedData={() => {
                      console.log("Video loaded successfully:", snap.video_url);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                      <FaPlay className="text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-bold text-white tracking-wide line-clamp-2">{snap.title}</h2>
                  <p className="text-gray-400 text-sm line-clamp-2">{snap.description}</p>
                  
                  {/* Code Snippet Preview */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCode className="text-green-400" />
                      <span className="text-gray-400 text-sm">Code Snippet</span>
                    </div>
                    <pre className="bg-black/50 text-green-400 p-3 rounded-xl overflow-x-auto text-xs font-mono border border-gray-700/50 max-h-32">
                      {snap.code_snippet}
                    </pre>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <RunCode code={snap.code_snippet} />
                    <ExplainButton videoData={{video_url: snap.video_url, code_snippet: snap.code_snippet}} />
                    <QuizGenerator quizData={{transcript: "", code_snippet: snap.code_snippet, video_url: snap.video_url}} />
                  </div>
                  
                  {/* Likes & Comments */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleLike(snap.id)} 
                        className={`flex items-center gap-1 transition-all ${snap.liked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}
                        aria-label="Like"
                      >
                        {snap.liked ? <FaHeart className="text-pink-500 fill-current" /> : <FaRegHeart />}
                        <span>{snap.likes || 0}</span>
                      </button>
                      
                      <button 
                        onClick={() => toggleComments(snap.id)} 
                        className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-all"
                        aria-label="Comment"
                      >
                        <FaRegComment />
                        <span>{snap.comments_count || 0}</span>
                      </button>
                    </div>
                    
                    <button 
                      className="text-gray-400 hover:text-purple-400 transition-all"
                      aria-label="Share"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-file-earmark-code text-gray-600 mb-4" viewBox="0 0 16 16">
                <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                <path d="M8.646 6.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 8 8.646 6.354a.5.5 0 0 1 0-.708zm-2.5 0a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0 0 .708l2 2a.5.5 0 0 0 .708-.708L5.293 8 6.94 6.354a.5.5 0 0 0 0-.708z"/>
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-1">No videos found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
        
        {/* Empty State */}
        {!loading && filteredSnaps.length === 0 && searchQuery && (
          <div className="mt-8 text-center py-12">
            <h3 className="text-xl font-semibold text-gray-400">No results found</h3>
            <p className="text-gray-500 mt-2">Try searching for something else</p>
            <div className="mt-4">
              <button 
                onClick={() => setSearchQuery("")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                DevTok
              </span>
              <span className="text-xs bg-gradient-to-r from-purple-400 to-pink-500 px-2 py-0.5 rounded-full font-medium opacity-80">BETA</span>
            </div>
            <p className="text-gray-500 text-sm text-center">
              © {new Date().getFullYear()} DevTok. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Comments Modal */}
      {activeCommentSnapId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl border border-gray-800 animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white">Comments</h3>
              <button 
                onClick={() => setActiveCommentSnapId(null)}
                className="text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Close"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {comments[activeCommentSnapId]?.length ? (
                comments[activeCommentSnapId].map((comment, index) => (
                  <div key={index} className="flex gap-3 animate-fade-in-up">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {comment.username.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="bg-gray-800/70 rounded-lg p-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-purple-400 text-sm">{comment.username}</span>
                        <span className="text-gray-500 text-xs">· {new Date(comment.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-chat-dots mb-2" viewBox="0 0 16 16">
                    <path d="M5 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                    <path d="m2.165 15.803.02-.004c1.83-.363 2.948-.842 3.468-1.105A9.06 9.06 0 0 0 8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6a10.457 10.457 0 0 1-.524 2.318l-.003.011a.846.846 0 0 0 .004.042.85.85 0 0 0 .268.445l.004.005.013.012a.824.824 0 0 0 .35.226 1.458 1.458 0 0 0 .342.06.828.828 0 0 0 .793-.516c.166-.386.356-1.044.524-1.85.204-.961.222-2.13.06-3.024a.8.8 0 0 0-.24-.41z"/>
                  </svg>
                  <p>No comments yet</p>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-800 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow px-4 py-2 rounded-full bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  onKeyDown={(e) => e.key === 'Enter' && postComment(activeCommentSnapId)}
                />
                <button
                  onClick={() => postComment(activeCommentSnapId)}
                  disabled={!newComment.trim()}
                  className={`bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-4 py-2 rounded-full shadow transition ${
                    !newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style>
  {`
    @keyframes scale-in {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fade-in-up {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out forwards;
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out forwards;
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.2s ease-out forwards;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #1f2937;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #8b5cf6;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #7c3aed;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `}
</style>
    </div>
  );
}




