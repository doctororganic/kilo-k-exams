import React, { useState } from 'react'

interface PromotionalBoxProps {
  isVisible: boolean
  onClose: () => void
  onCompleteForm: () => void
}

export default function PromotionalBox({ isVisible, onClose, onCompleteForm }: PromotionalBoxProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white mb-3">
            📊
          </div>
          <h3 className="text-xl font-bold text-gray-800">احصل على كل البنك والامتحانات مع الإجابة والشرح</h3>
        </div>
        <p className="text-gray-700 text-sm mb-5 text-center">
          ✅ احصل على تقييم مستواك وتحسينه<br />
          ✅ تقرير تفصيلي بمستواك<br />
          ✅ توصيات مخصصة للتحسين
        </p>
        <button
          onClick={onCompleteForm}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-full"
        >
          قم بإملاء النموذج للإكمال
        </button>
        <button
          onClick={onClose}
          className="mt-3 text-gray-500 underline text-sm"
        >
          لاحقًا
        </button>
      </div>
    </div>
  )
}