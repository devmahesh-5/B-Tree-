import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BTree } from '../../utils/btree';
import type { BTreeNode, AnimationStep } from '../../interfaces/interfaces';

export const BTreeDisplay = () => {
  const [btree] = useState(new BTree(2)); // Order=2 (2-3-4 tree)
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Handle auto-play
  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 1000 / speed);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, steps.length, speed]);

  const handleInsert = (key: number) => {
    const newSteps = btree.insert(key);
    setSteps(newSteps);
    setCurrentStep(0);
  };

  const renderNode = (node: BTreeNode, highlight: boolean = false) => {
    return (
      <motion.div
        key={node.id}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          boxShadow: highlight ? '0 0 10px 2px rgba(234, 179, 8, 0.8)' : 'none'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`flex flex-col items-center p-3 m-1 rounded-lg border-2 ${
          highlight ? 'bg-yellow-100 border-yellow-400' : 'bg-white border-gray-300'
        }`}
      >
        {/* Keys */}
        <div className="flex gap-2 mb-1">
          {node.keys.map((key, i) => (
            <motion.div
              key={`${node.id}-key-${i}`}
              layout
              className="px-3 py-1 bg-blue-100 rounded-md shadow-sm font-medium"
              whileHover={{ scale: 1.1 }}
            >
              {key}
            </motion.div>
          ))}
        </div>

        {/* Children */}
        {node.children && (
          <div className="flex gap-4 mt-2">
            {node.children.map((child) => renderNode(child, steps[currentStep]?.highlight?.includes(child.id!)))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#6c53b6]">B-Tree Visualization</h1>
        
        {/* Controls */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              type="number"
              placeholder="Enter a key"
              className="px-4 py-2 border rounded-lg flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  handleInsert(parseInt(e.currentTarget.value));
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={() => {
                const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                if (input?.value) {
                  handleInsert(parseInt(input.value));
                  input.value = '';
                }
              }}
            >
              Insert Key
            </button>
          </div>

          {/* Animation Controls */}
          {steps.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <button
                className="px-3 py-1 bg-gray-200 rounded-lg"
                onClick={() => setCurrentStep(0)}
                disabled={currentStep === 0}
              >
                ↞ Start
              </button>
              <button
                className="px-3 py-1 bg-gray-200 rounded-lg"
                onClick={() => setCurrentStep(p => Math.max(p - 1, 0))}
                disabled={currentStep === 0}
              >
                ← Previous
              </button>
              <button
                className="px-4 py-1 bg-green-500 text-white rounded-lg"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                className="px-3 py-1 bg-gray-200 rounded-lg"
                onClick={() => setCurrentStep(p => Math.min(p + 1, steps.length - 1))}
                disabled={currentStep === steps.length - 1}
              >
                Next →
              </button>
              <button
                className="px-3 py-1 bg-gray-200 rounded-lg"
                onClick={() => setCurrentStep(steps.length - 1)}
                disabled={currentStep === steps.length - 1}
              >
                End ↠
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span>Speed:</span>
                <select 
                  className="border rounded px-2 py-1"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Tree Visualization */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-auto">
          <AnimatePresence mode="wait">
            {steps.length > 0 ? (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                {renderNode(steps[currentStep].tree)}
              </motion.div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-lg">Insert keys to visualize the B-Tree</p>
                <p className="text-sm mt-2">Try entering numbers like 10, 20, 30...</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Operation Info */}
        {steps.length > 0 && (
          <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Current Operation:</h3>
            <p className="text-blue-700">{steps[currentStep].message}</p>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};