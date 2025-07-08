// QuizGenerator.jsx
import React, { useState } from "react";
import axios from "axios";
import { FaQuestion } from 'react-icons/fa';
const QuizGenerator = ({ quizData }) => {
  const [quiz, setQuiz] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    setFeedback("");
    setSelected(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/generate_quiz`, {
        transcript : quizData.transcript,
        code_snippet : quizData.code_snippet,
        video_url : quizData.video_url
      });

      if (response.data.error) {
        setFeedback(response.data.error);
        setQuiz(null);
      } else {
        setQuiz(response.data);
      }
    } catch (error) {
      setFeedback("❌ Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selected === null) {
      setFeedback("⚠️ Please select an option.");
      return;
    }

    if (selected === quiz.correct_option) {
      setFeedback("✅ Correct! Great job!");
    } else {
      setFeedback(`❌ Incorrect. The correct answer was option ${quiz.correct_option}.`);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md text-black w-full max-w-xl mx-auto">
      <button
      className="group relative bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white px-5 py-3 rounded-xl shadow-lg transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/20"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></span>
      <FaQuestion size={18} />
      Generate Quiz
    </button>

      {quiz && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">📘 Question:</h3>
          <p className="mb-3">{quiz.question}</p>

          <div className="space-y-2">
            {quiz.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="quiz"
                  value={idx + 1}
                  checked={selected === idx + 1}
                  onChange={() => setSelected(idx + 1)}
                />
                <label>{opt}</label>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit Answer
          </button>
        </div>
      )}

      {feedback && (
        <div className="mt-4 p-2 bg-gray-100 border rounded text-black">
          <strong>🧠 Result:</strong> {feedback}
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
