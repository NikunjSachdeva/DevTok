import React, { useState } from 'react';

const UploadSnap = () => {
  const [videoPreview, setVideoPreview] = useState(null);
  const username = localStorage.getItem('username');

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideoPreview(videoUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("title", e.target.title.value);
    formData.append("description", e.target.description.value);
    formData.append("codeSnippet", e.target.codeSnippet.value);
    formData.append("hashtags", e.target.hashtags.value);
    formData.append("video", e.target.video.files[0]);
    formData.append("username", localStorage.getItem('username'));

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/upload_snap/`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      alert(data.message || "Upload successful!");
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
            Upload a Code Snap
          </h2>
          <p className="text-gray-400">Share your coding hacks with the world!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Python List Slicing Trick"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Brief explanation..."
              rows="3"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          {/* Video Upload */}
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-300 mb-1">
              Upload Video
            </label>
            <input
              type="file"
              id="video"
              name="video"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
            />
            <small className="text-gray-500 mt-1 block">Supported: MP4, WebM, MOV</small>
          </div>

          {/* Video Preview */}
          {videoPreview && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Video Preview</label>
              <video src={videoPreview} controls className="w-full rounded-lg border border-gray-600 shadow-md" />
            </div>
          )}

          {/* Code Snippet */}
          <div>
            <label htmlFor="codeSnippet" className="block text-sm font-medium text-gray-300 mb-1">
              Code Snippet
            </label>
            <textarea
              id="codeSnippet"
              name="codeSnippet"
              placeholder="Paste your code here..."
              rows="6"
              className="w-full px-4 py-2 rounded-lg bg-black text-green-400 border border-gray-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          {/* Hashtags */}
          <div>
            <label htmlFor="hashtags" className="block text-sm font-medium text-gray-300 mb-1">
              Hashtags
            </label>
            <input
              type="text"
              id="hashtags"
              name="hashtags"
              placeholder="e.g., react, flask, python"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
          >
            🚀 Post Snap
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadSnap;
