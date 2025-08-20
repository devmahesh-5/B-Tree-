import { useState } from "react";

export const Controls = ({ onInsert }: { onInsert: (key: number) => void }) => {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <input
        type="number"
        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        placeholder="Enter a key"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={() => {
          if (inputValue) {
            onInsert(parseInt(inputValue));
            setInputValue("");
          }
        }}
      >
        Insert
      </button>
    </div>
  );
};