import { useState } from 'react'
import axios from 'axios'
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  ArrowLeft,
  Clock,
  FileCheck
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://doc-tracker-backend-production.up.railway.app'

function App() {
  const [page, setPage] = useState('upload') // 'upload' or 'results'
  const [file1, setFile1] = useState(null)
  const [file2, setFile2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0]
    if (file && file.name.endsWith('.docx')) {
      setFile(file)
      setError(null)
    } else {
      setError('Vui lòng chọn file .docx')
    }
  }

  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError('Vui lòng chọn cả hai file')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file_v1', file1)
    formData.append('file_v2', file2)
    formData.append('document_type', 'contract')

    try {
      const response = await axios.post(`${API_URL}/api/compare`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResults(response.data)
      setPage('results')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi so sánh tài liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPage('upload')
    setFile1(null)
    setFile2(null)
    setResults(null)
    setError(null)
  }

  if (page === 'upload') {
    return <UploadPage 
      file1={file1}
      file2={file2}
      loading={loading}
      error={error}
      onFile1Change={(e) => handleFileChange(e, setFile1)}
      onFile2Change={(e) => handleFileChange(e, setFile2)}
      onCompare={handleCompare}
    />
  }

  return <ResultsPage 
    results={results}
    onReset={handleReset}
  />
}

// ============================================================
// UPLOAD PAGE
// ============================================================

function UploadPage({ file1, file2, loading, error, onFile1Change, onFile2Change, onCompare }) {
  return (
    <div className="container">
      <header className="header">
        <FileCheck size={40} className="logo-icon" />
        <h1>So Sánh Tài Liệu</h1>
        <p className="subtitle">Phát hiện và phân loại sự thay đổi giữa hai phiên bản của tài liệu Word (.docx)</p>
      </header>

      <div className="upload-section">
        <div className="upload-grid">
          {/* File 1 - Original */}
          <div className="upload-box">
            <label className="upload-label">
              <input 
                type="file" 
                accept=".docx" 
                onChange={onFile1Change}
                disabled={loading}
              />
              <div className="upload-content">
                <Upload size={32} />
                <span className="upload-title">Tài liệu gốc</span>
                {file1 ? (
                  <span className="file-name">{file1.name}</span>
                ) : (
                  <span className="upload-hint">Chọn file .docx</span>
                )}
              </div>
            </label>
          </div>

          {/* File 2 - Modified */}
          <div className="upload-box">
            <label className="upload-label">
              <input 
                type="file" 
                accept=".docx" 
                onChange={onFile2Change}
                disabled={loading}
              />
              <div className="upload-content">
                <Upload size={32} />
                <span className="upload-title">Tài liệu mới</span>
                {file2 ? (
                  <span className="file-name">{file2.name}</span>
                ) : (
                  <span className="upload-hint">Chọn file .docx</span>
                )}
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <button 
          className="compare-button"
          onClick={onCompare}
          disabled={!file1 || !file2 || loading}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <FileText size={20} />
              Bắt đầu so sánh
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// RESULTS PAGE
// ============================================================

function ResultsPage({ results, onReset }) {
  const { summary, changes, processing_time_ms } = results

  // Group changes by impact
  const criticalChanges = changes.filter(c => c.impact === 'critical')
  const mediumChanges = changes.filter(c => c.impact === 'medium')
  const lowChanges = changes.filter(c => c.impact === 'low')

  return (
    <div className="container results-container">
      {/* Header */}
      <header className="results-header">
        <button className="back-button" onClick={onReset}>
          <ArrowLeft size={20} />
          So sánh mới
        </button>
        <div className="header-info">
          <Clock size={16} />
          <span>Thời gian xử lý: {processing_time_ms}ms</span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="summary-section">
        <h2>Tổng quan thay đổi</h2>
        <div className="summary-cards">
          <div className="summary-card total">
            <span className="summary-number">{summary.total}</span>
            <span className="summary-label">Tổng thay đổi</span>
          </div>
          <div className="summary-card critical">
            <AlertTriangle size={24} />
            <span className="summary-number">{summary.critical}</span>
            <span className="summary-label">Nghiêm trọng</span>
          </div>
          <div className="summary-card medium">
            <AlertCircle size={24} />
            <span className="summary-number">{summary.medium}</span>
            <span className="summary-label">Trung bình</span>
          </div>
          <div className="summary-card low">
            <CheckCircle size={24} />
            <span className="summary-number">{summary.low}</span>
            <span className="summary-label">Thấp</span>
          </div>
        </div>
      </div>

      {/* Changes List */}
      <div className="changes-section">
        <h2>Chi tiết thay đổi</h2>
        
        {/* Critical Changes */}
        {criticalChanges.length > 0 && (
          <div className="changes-group">
            <h3 className="group-title critical">
              <AlertTriangle size={18} />
              Nghiêm trọng ({criticalChanges.length})
            </h3>
            {criticalChanges.map(change => (
              <ChangeCard key={change.change_id} change={change} />
            ))}
          </div>
        )}

        {/* Medium Changes */}
        {mediumChanges.length > 0 && (
          <div className="changes-group">
            <h3 className="group-title medium">
              <AlertCircle size={18} />
              Trung bình ({mediumChanges.length})
            </h3>
            {mediumChanges.map(change => (
              <ChangeCard key={change.change_id} change={change} />
            ))}
          </div>
        )}

        {/* Low Changes */}
        {lowChanges.length > 0 && (
          <div className="changes-group">
            <h3 className="group-title low">
              <CheckCircle size={18} />
              Thấp ({lowChanges.length})
            </h3>
            {lowChanges.map(change => (
              <ChangeCard key={change.change_id} change={change} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// DIFF HIGHLIGHTING UTILITIES
// ============================================================

// Compute word-level diff using Longest Common Subsequence
function computeWordDiff(original, modified) {
  if (!original && !modified) return { originalParts: [], modifiedParts: [] }
  if (!original) return { originalParts: [], modifiedParts: [{ text: modified, type: 'added' }] }
  if (!modified) return { originalParts: [{ text: original, type: 'removed' }], modifiedParts: [] }

  const originalWords = original.split(/(\s+)/)
  const modifiedWords = modified.split(/(\s+)/)

  // Build LCS table
  const m = originalWords.length
  const n = modifiedWords.length
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (originalWords[i - 1] === modifiedWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find diff
  const originalParts = []
  const modifiedParts = []
  let i = m, j = n

  const originalStack = []
  const modifiedStack = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalWords[i - 1] === modifiedWords[j - 1]) {
      originalStack.push({ text: originalWords[i - 1], type: 'unchanged' })
      modifiedStack.push({ text: modifiedWords[j - 1], type: 'unchanged' })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      modifiedStack.push({ text: modifiedWords[j - 1], type: 'added' })
      j--
    } else {
      originalStack.push({ text: originalWords[i - 1], type: 'removed' })
      i--
    }
  }

  // Reverse stacks and merge consecutive same-type parts
  const mergeParts = (stack) => {
    const reversed = stack.reverse()
    const merged = []
    for (const part of reversed) {
      if (merged.length > 0 && merged[merged.length - 1].type === part.type) {
        merged[merged.length - 1].text += part.text
      } else {
        merged.push({ ...part })
      }
    }
    return merged
  }

  return {
    originalParts: mergeParts(originalStack),
    modifiedParts: mergeParts(modifiedStack)
  }
}

// Render highlighted text
function HighlightedText({ parts, mode }) {
  return (
    <span className="diff-text">
      {parts.map((part, index) => {
        if (part.type === 'unchanged') {
          return <span key={index}>{part.text}</span>
        } else if (part.type === 'removed' && mode === 'original') {
          return <span key={index} className="diff-removed">{part.text}</span>
        } else if (part.type === 'added' && mode === 'modified') {
          return <span key={index} className="diff-added">{part.text}</span>
        }
        return <span key={index}>{part.text}</span>
      })}
    </span>
  )
}

// ============================================================
// CHANGE CARD COMPONENT
// ============================================================

function ChangeCard({ change }) {
  const [expanded, setExpanded] = useState(false)

  const impactLabels = {
    critical: 'Nghiêm trọng',
    medium: 'Trung bình',
    low: 'Thấp'
  }

  const changeTypeLabels = {
    modified: 'Sửa đổi',
    added: 'Thêm mới',
    deleted: 'Xóa bỏ'
  }

  // Compute diff when both original and modified exist
  const diff = computeWordDiff(change.original, change.modified)

  return (
    <div className={`change-card ${change.impact}`}>
      <div className="change-header" onClick={() => setExpanded(!expanded)}>
        <div className="change-info">
          <span className={`impact-badge ${change.impact}`}>
            {impactLabels[change.impact]}
          </span>
          <span className="change-type">
            {changeTypeLabels[change.change_type] || change.change_type}
          </span>
          <span className="change-location">{change.location}</span>
        </div>
        <button className="expand-button">
          {expanded ? '−' : '+'}
        </button>
      </div>

      {expanded && (
        <div className="change-details">
          {/* Diff Display with Highlighting */}
          <div className="diff-section">
            {change.original && (
              <div className="diff-block original">
                <span className="diff-label">Gốc:</span>
                <HighlightedText parts={diff.originalParts} mode="original" />
              </div>
            )}
            {change.modified && (
              <div className="diff-block modified">
                <span className="diff-label">Mới:</span>
                <HighlightedText parts={diff.modifiedParts} mode="modified" />
              </div>
            )}
          </div>

          {/* Reasoning & Risk */}
          <div className="analysis-section">
            <div className="analysis-item">
              <strong>Lý do:</strong> {change.reasoning}
            </div>
            <div className="analysis-item">
              <strong>Rủi ro:</strong> {change.risk_analysis}
            </div>
            <div className="analysis-item source">
              <span>Phát hiện bởi: {change.classification_source === 'rule-based' ? 'Quy tắc' : 'AI'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
