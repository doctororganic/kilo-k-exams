import React, { useState } from 'react'
import { parseHTMLContent } from '../utils/htmlParser'
import { importParsedExamsToSupabase } from '../utils/importer'

export default function Import() {
  const [html, setHtml] = useState('')
  const [grade, setGrade] = useState<'10' | '11'>('10')
  const [status, setStatus] = useState('')
  const [importing, setImporting] = useState(false)

  const handleImport = async () => {
    setImporting(true)
    setStatus('')
    try {
      const parsed = parseHTMLContent(html)
      const inserted = await importParsedExamsToSupabase(parsed, grade)
      setStatus(`Imported ${inserted.length} exams for grade ${grade}`)
    } catch (e: any) {
      setStatus(e?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">استيراد أسئلة من HTML</h1>
      <div className="flex items-center gap-3">
        <label className="text-gray-700">الصف</label>
        <select value={grade} onChange={(e) => setGrade(e.target.value as '10' | '11')} className="border rounded px-3 py-2">
          <option value="10">الصف العاشر</option>
          <option value="11">الصف الحادي عشر</option>
        </select>
      </div>
      <textarea
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        rows={12}
        className="w-full border rounded p-3"
        placeholder="ألصق محتوى HTML هنا"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleImport}
          disabled={importing}
          className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {importing ? 'جارٍ الاستيراد...' : 'استيراد'}
        </button>
        {status && <span className="text-gray-700">{status}</span>}
      </div>
    </div>
  )
}

