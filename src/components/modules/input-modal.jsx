import { useState } from "react";
import ControlButton from "../elements/button";

const CodeInputModal = ({ isOpen, onClose, onSubmit }) => {
  const [code, setCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(code);
    setCode('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Paste Your JavaScript Code</h2>
        <p className="text-gray-400 text-sm mb-4">
          Supported: console.log(), Promise.resolve().then(), setTimeout(), queueMicrotask()
        </p>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="console.log('Start');&#10;Promise.resolve().then(() => console.log('Promise'));&#10;setTimeout(() => console.log('Timeout'), 0);&#10;console.log('End');"
          className="w-full h-64 bg-gray-900 text-white font-mono text-sm p-4 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex gap-3 mt-4">
          <ControlButton onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Parse & Visualize
          </ControlButton>
          <ControlButton onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
            Cancel
          </ControlButton>
        </div>
      </div>
    </div>
  );
};

export default CodeInputModal;