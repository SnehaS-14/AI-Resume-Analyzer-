import type { AnalysisResult } from '../types'

interface ResultPanelProps {
  result: AnalysisResult
  rewritten: string | null
  onRewrite: () => Promise<void>
  onDownload: () => void
  rewriting: boolean
  downloading?: boolean
}

function ScoreRing({ score, label, color }: {
  score: number
  label: string
  color: 'blue' | 'green'
}) {
  const CIRCUMFERENCE = 251.3
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE

  const ringColor = {
    blue:  { stroke: '#667eea' },
    green: { stroke: '#48bb78' },
  }[color]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width="140" height="140" viewBox="0 0 110 110" style={{ animation: 'rotate 20s linear infinite' }}>
        <defs>
          <style>{`@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </defs>
        <circle cx="55" cy="55" r="40" fill="none"
          stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="55" cy="55" r="40" fill="none"
          stroke={ringColor.stroke} strokeWidth="10"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text x="55" y="55" textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: '28px', fontWeight: 700, fill: '#2d3748' }}>
          {score}
        </text>
      </svg>
      <span style={{ color: '#718096', fontSize: '14px', fontWeight: '500' }}>{label}</span>
    </div>
  )
}

function Section({ title, items, color }: {
  title: string
  items: string[]
  color: 'green' | 'red' | 'blue'
}) {
  const colorMap = {
    green: { text: '#48bb78', dot: '#48bb78' },
    red: { text: '#f56565', dot: '#f56565' },
    blue: { text: '#667eea', dot: '#667eea' },
  }

  if (!items || items.length === 0) return null
  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: colorMap[color].text }}>{title}</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#4a5568', fontSize: '13px', marginBottom: '8px', lineHeight: '1.6' }}>
            <span style={{ marginTop: '3px', width: '6px', height: '6px', borderRadius: '50%', background: colorMap[color].dot, flexShrink: 0 }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ResultPanel({ result, rewritten, onRewrite, onDownload, rewriting, downloading = false }: ResultPanelProps) {
  const {
    overall_score, ats_score,
    strengths, weaknesses, action_items, summary,
  } = result

  const cardStyle: React.CSSProperties = {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  }

  const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => ({
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ...(variant === 'primary' ? {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    } : {
      background: '#f0f1f5',
      color: '#2d3748',
      border: '1px solid #e2e8f0',
    })
  })

  return (
    <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Score Overview */}
      <div style={{ ...cardStyle }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '32px', textAlign: 'center', color: '#2d3748' }}>📊 Score Overview</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
          <ScoreRing score={overall_score} label="Overall Score" color="blue" />
          <ScoreRing score={ats_score}     label="ATS Score"     color="green" />
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div style={{ ...cardStyle, borderLeft: '4px solid #667eea', paddingLeft: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#2d3748' }}>✨ Summary</h3>
          <p style={{ color: '#4a5568', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{summary}</p>
        </div>
      )}

      {/* Strengths, Weaknesses, Action Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        <div style={{ ...cardStyle }}>
          <Section title="✅ Strengths" items={strengths} color="green" />
        </div>
        <div style={{ ...cardStyle }}>
          <Section title="⚠️ Weaknesses" items={weaknesses} color="red" />
        </div>
        <div style={{ ...cardStyle }}>
          <Section title="🎯 Action Items" items={action_items} color="blue" />
        </div>
      </div>

      {/* Rewrite Button */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={onRewrite}
          disabled={rewriting}
          style={{
            ...buttonStyle('primary'),
            opacity: rewriting ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!rewriting) {
              (e.currentTarget as any).style.transform = 'translateY(-2px)'
            }
          }}
          onMouseLeave={(e) => {
            if (!rewriting) {
              (e.currentTarget as any).style.transform = 'translateY(0)'
            }
          }}
        >
          {rewriting ? '⏳ Rewriting...' : '✏️ Rewrite My Resume'}
        </button>
      </div>

      {/* Rewritten Resume */}
      {rewritten && (
        <div style={{ ...cardStyle, background: 'rgba(72, 187, 120, 0.05)', border: '1px solid rgba(72, 187, 120, 0.2)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#48bb78' }}>✨ Your Rewritten Resume</h3>
          <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '16px', maxHeight: '300px', overflow: 'auto', fontFamily: 'monospace', fontSize: '12px', color: '#2d3748', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordWrap: 'break-word', border: '1px solid #e2e8f0' }}>
            {rewritten}
          </div>
          <button
            onClick={onDownload}
            disabled={downloading}
            style={{...buttonStyle('primary'), width: '100%', opacity: downloading ? 0.7 : 1, cursor: downloading ? 'not-allowed' : 'pointer'}}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement
              if (!downloading) btn.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement
              if (!downloading) btn.style.transform = 'translateY(0)'
            }}
          >
            {downloading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Downloading...
              </span>
            ) : (
              '📄 Download as PDF'
            )}
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </button>
        </div>
      )}
    </div>
  )
}
