import { useState, useRef } from 'react'

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt']

interface UploadZoneProps {
  onUpload: (file: File) => void
  loading: boolean
}

export default function UploadZone({ onUpload, loading }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isValidFile = (f: File) => {
    const name = f.name.toLowerCase()
    return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
  }

  const handleFile = (f: File) => {
    if (!isValidFile(f)) {
      alert('Please upload a PDF, DOCX, or TXT file.')
      return
    }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
  }

  const handleSubmit = () => {
    if (file && !loading) onUpload(file)
  }

  const containerStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '48px 32px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
  }

  const dropzoneStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '48px',
    borderRadius: '12px',
    border: '2px dashed',
    borderColor: dragging ? '#667eea' : '#cbd5e1',
    backgroundColor: dragging ? 'rgba(102, 126, 234, 0.05)' : '#f8f9fa',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative' as const,
  }

  const fileChipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '6px',
    color: '#667eea',
    fontSize: '13px',
    fontWeight: '600',
    marginTop: '8px',
  }

  const buttonStyle = (disabled: boolean): React.CSSProperties => ({
    marginTop: '24px',
    width: '100%',
    padding: '14px 24px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '15px',
    color: '#fff',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled
      ? '#cbd5e1'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.3s',
    boxShadow: disabled ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
  })

  return (
    <div style={containerStyle}>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        style={dropzoneStyle}
      >
        <div style={{ fontSize: '56px', animation: dragging ? 'float 0.6s ease-in-out infinite' : 'none' }}>
          📄
        </div>

        <div style={{ textAlign: 'center' }}>
          {file ? (
            <>
              <p style={{ color: '#2d3748', fontWeight: '600', margin: '0 0 8px 0', fontSize: '16px' }}>
                Ready to analyze
              </p>
              <div style={fileChipStyle}>
                ✓ {file.name}
              </div>
            </>
          ) : (
            <>
              <p style={{ color: '#2d3748', fontWeight: '600', margin: '0 0 8px 0', fontSize: '16px' }}>
                Drag &amp; drop your resume here
              </p>
              <p style={{ color: '#718096', margin: 0, fontSize: '14px' }}>
                or <span style={{ color: '#667eea', fontWeight: '600', cursor: 'pointer' }}>click to browse</span>
              </p>
            </>
          )}
        </div>

        <p style={{ color: '#a0aec0', fontSize: '12px', margin: '8px 0 0 0' }}>
          PDF, DOCX, or TXT • Max 10 MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        style={buttonStyle(!file || loading)}
        onMouseEnter={(e) => {
          if (file && !loading) {
            (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'
          }
        }}
        onMouseLeave={(e) => {
          if (file && !loading) {
            (e.target as HTMLButtonElement).style.transform = 'translateY(0)'
          }
        }}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
            Analyzing your resume...
          </span>
        ) : (
          <>🚀 Analyze Resume</>
        )}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
