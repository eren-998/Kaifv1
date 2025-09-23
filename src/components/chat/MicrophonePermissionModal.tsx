import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MicOff, Lock } from 'lucide-react';
import { Button } from '../ui/Button';

interface MicrophonePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({ isOpen, onClose, darkMode }) => {
  const instructionSteps = [
    { text: 'Click the lock icon in the address bar.', icon: <Lock className="w-4 h-4 mr-2 flex-shrink-0" /> },
    { text: "Find 'Microphone' in the permissions list.", icon: <MicOff className="w-4 h-4 mr-2 flex-shrink-0" /> },
    { text: "Select 'Allow' from the dropdown menu.", icon: null },
    { text: 'You may need to reload the page for the changes to take effect.', icon: null },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-2xl shadow-2xl z-50 overflow-hidden`}
          >
            <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Microphone Access Denied
              </h2>
              <Button onClick={onClose} variant="outline" size="sm" className={`${darkMode ? 'border-gray-600 text-gray-300' : ''}`}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
                  <MicOff className={`w-6 h-6 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    To send voice messages, KaifV1 needs access to your microphone. It seems permission has been denied in your browser settings.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>How to Enable Microphone Access:</h3>
                <ol className="space-y-2 text-sm">
                  {instructionSteps.map((step, index) => (
                    <li key={index} className={`flex items-center p-2 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <span className={`flex-shrink-0 w-5 h-5 text-xs rounded-full flex items-center justify-center mr-3 ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                        {index + 1}
                      </span>
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{step.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} text-right`}>
              <Button onClick={onClose} variant="primary">
                Got it
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
