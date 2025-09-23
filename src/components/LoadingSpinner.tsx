import React from 'react'
import { BrainCircuit } from 'lucide-react'

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
          <BrainCircuit className="w-8 h-8 text-white" />
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
