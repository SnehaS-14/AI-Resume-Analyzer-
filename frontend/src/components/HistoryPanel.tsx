import type { ResumeRecord } from '../types'

interface HistoryPanelProps {
  history: ResumeRecord[]
  loading: boolean
  onViewItem: (item: ResumeRecord) => void
}

export default function HistoryPanel({ history, loading, onViewItem }: HistoryPanelProps) {
  const cardStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s',
  }

  const badgeStyle = (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    marginRight: '8px',
    background: color === 'green' ? '#c6f6d5' : '#bee3f8',
    color: color === 'green' ? '#22543d' : '#2c5aa0',
  })

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#718096' }}>Loading your history...</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '16px', color: '#718096', margin: '0' }}>
          No analyses yet. Upload a resume to get started!
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {history.map((item) => (
        <div key={item.id} style={cardStyle}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0', color: '#2d3748' }}>
              {item.filename}
            </h3>
            <p style={{ fontSize: '12px', color: '#718096', margin: '0 0 12px 0' }}>
              Uploaded: {new Date(item.uploaded_at).toLocaleDateString()} at{' '}
              {new Date(item.uploaded_at).toLocaleTimeString()}
            </p>
            <div>
              <span style={badgeStyle('blue')}>Overall: {item.overall_score}%</span>
              <span style={badgeStyle('green')}>ATS: {item.ats_score}%</span>
              {item.rewritten_text && (
                <span style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: '#feebc8',
                  color: '#7c2d12',
                }}>
                  ✓ Rewritten
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onViewItem(item)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginLeft: '16px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            👁️ View
          </button>
        </div>
      ))}
    </div>
  )
}
