import React, { useState, useEffect } from "react";
import { FaPlay } from "react-icons/fa";


export default function RunCode({ code }) {
  const [pyodide, setPyodide] = useState(null);
  const [output, setOutput] = useState("");

  useEffect(() => {
    const initPyodide = async () => {
      const pyodideInstance = await loadPyodide();
      setPyodide(pyodideInstance);
    };
    initPyodide();
  }, []);

  const runPythonCode = async () => {
    if (!pyodide) return;

    try {
      // Redirect stdout to a Python string
      await pyodide.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = sys.stdout
      `);

      // Run user code
      await pyodide.runPythonAsync(code);

      // Get what was printed
      const result = pyodide.runPython("sys.stdout.getvalue()");
      setOutput(result);
    } catch (error) {
      setOutput(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="mt-4">
      <button
      className="group relative bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-5 py-3 rounded-xl shadow-lg transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-center gap-2 backdrop-blur-sm border border-white/20"
    >
      <span className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></span>
      <FaPlay size={18} />
      Run Code
    </button>

      {output && (
        <pre className="mt-4 bg-black text-white p-4 rounded-md text-sm whitespace-pre-wrap overflow-auto">
          {output}
        </pre>
      )}
    </div>
  );
}
