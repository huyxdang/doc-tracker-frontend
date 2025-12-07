import { useState } from 'react'
import axios from 'axios'
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle,
  Download,
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

  const handleDownload = () => {
    if (results?.annotated_doc_id) {
      window.open(`${API_URL}/api/download/${results.annotated_doc_id}`, '_blank')
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
    onDownload={handleDownload}
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

function ResultsPage({ results, onDownload, onReset }) {
  const { summary, changes, processing_time_ms, annotated_doc_id } = results

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

      {/* Download Button */}
      {annotated_doc_id && (
        <div className="download-section">
          <button className="download-button" onClick={onDownload}>
            <Download size={20} />
            Tải xuống tài liệu có đánh dấu thay đổi
          </button>
          <p className="download-hint">
            File Word với các thay đổi được highlight và chú thích
          </p>
        </div>
      )}
    </div>
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
          {/* Diff Display */}
          <div className="diff-section">
            {change.original && (
              <div className="diff-block original">
                <span className="diff-label">Gốc:</span>
                <span className="diff-text">{change.original}</span>
              </div>
            )}
            {change.modified && (
              <div className="diff-block modified">
                <span className="diff-label">Mới:</span>
                <span className="diff-text">{change.modified}</span>
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
