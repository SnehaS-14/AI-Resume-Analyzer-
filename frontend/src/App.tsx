import { useState, useEffect } from 'react'
import axios from 'axios'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import UploadZone from './components/UploadZone'
import ResultPanel from './components/ResultPanel'
import HistoryPanel from './components/HistoryPanel'
import type { AnalysisResult, ResumeRecord } from './types'

const API_URL = 'http://localhost:9000'

type Tab = 'analyze' | 'history'
type AuthPage = 'login' | 'signup'

export default function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [authPage, setAuthPage] = useState<AuthPage>('login')

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const { userId, userName } = JSON.parse(stored)
        setUserId(userId)
        setUserName(userName)
        setIsLoggedIn(true)
      } catch {
        localStorage.removeItem('auth')
      }
    }
  }, [])

  // App state
  const [activeTab, setActiveTab] = useState<Tab>('analyze')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rewritten, setRewritten] = useState<string | null>(null)
  const [rewriting, setRewriting] = useState(false)
  const [history, setHistory] = useState<ResumeRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ResumeRecord | null>(null)

  const handleLogin = (userId: string, email: string, name: string) => {
    setUserId(userId)
    setUserName(name)
    setIsLoggedIn(true)
    localStorage.setItem('auth', JSON.stringify({ userId, userName: name }))
  }

  const handleSignup = (userId: string, email: string, name: string) => {
    handleLogin(userId, email, name)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserId(null)
    setUserName(null)
    localStorage.removeItem('auth')
    setResult(null)
    setRewritten(null)
    setHistory([])
    setSelectedHistoryItem(null)
  }

  const handleUpload = async (file: File) => {
    if (!userId) return

    setLoading(true)
    setError(null)
    setResult(null)
    setRewritten(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${API_URL}/analyze?user_id=${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(response.data)
      setActiveTab('analyze')
    } catch (err) {
      const detail = (err as any).response?.data?.detail || 'An unexpected error occurred.'
      setError(detail)
    } finally {
      setLoading(false)
    }
  }

  const handleRewrite = async () => {
    if (!result?.id || !userId) return
    setRewriting(true)
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/rewrite/${result.id}?user_id=${userId}`)
      setRewritten(response.data.rewritten_text)
    } catch (err) {
      const detail = (err as any).response?.data?.detail || 'Rewrite failed'
      setError(detail)
    } finally {
      setRewriting(false)
    }
  }

  const handleDownload = () => {
    if (result?.id && userId) {
      window.open(`${API_URL}/rewrite/${result.id}/download?user_id=${userId}`, '_blank')
    }
  }

  const loadHistory = async () => {
    if (!userId) return

    setHistoryLoading(true)
    try {
      const response = await axios.get(`${API_URL}/history?user_id=${userId}`)
      setHistory(response.data.analyses)
    } catch (err) {
      setError('Failed to load history')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history' && isLoggedIn) {
      loadHistory()
    }
  }, [activeTab, isLoggedIn])

  // Auth pages
  if (!isLoggedIn) {
    return authPage === 'login' ? (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToSignup={() => setAuthPage('signup')}
      />
    ) : (
      <SignupPage
        onSignup={handleSignup}
        onSwitchToLogin={() => setAuthPage('login')}
      />
    )
  }

  // Main app
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f8f9fa, #f0f1f5)',
      color: '#1a202c',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        padding: '16px 32px',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.25)',
        borderBottom: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              {/* Icon */}
              <div style={{
                fontSize: '32px',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                📄
              </div>

              {/* Brand Info */}
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  margin: '0',
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                }}>
                  Resume AI
                </h1>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  margin: '2px 0 0 0',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                }}>
                  Powered by Groq
                </p>
              </div>
            </div>

            {/* Right Section - User & Logout */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
            }}>
              {/* User Info */}
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  margin: '0 0 2px 0',
                  fontSize: '10px',
                  opacity: 0.85,
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}>
                  Welcome
                </p>
                <p style={{
                  margin: '0',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'white',
                }}>
                  {userName}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  color: 'white',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          {(['analyze', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                background: activeTab === tab
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#fff',
                color: activeTab === tab ? 'white' : '#4a5568',
                boxShadow: activeTab === tab
                  ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {tab === 'analyze' ? '📤 Analyze' : '📋 History'}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fed7d7',
            border: '1px solid #fc8181',
            color: '#c53030',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '500',
          }}>
            {error}
          </div>
        )}

        {/* Content */}
        {activeTab === 'analyze' ? (
          <div>
            {selectedHistoryItem ? (
              // View selected history item
              <div style={{
                marginTop: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}>
                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#f0f1f5',
                    color: '#2d3748',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  ← Back to Upload
                </button>
                <ResultPanel
                  result={selectedHistoryItem as AnalysisResult}
                  rewritten={selectedHistoryItem.rewritten_text || null}
                  onRewrite={() => {}}
                  onDownload={() => {}}
                  rewriting={false}
                />
              </div>
            ) : (
              <>
                <UploadZone onUpload={handleUpload} loading={loading} />
                {result && (
                  <ResultPanel
                    result={result}
                    rewritten={rewritten}
                    onRewrite={handleRewrite}
                    onDownload={handleDownload}
                    rewriting={rewriting}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <HistoryPanel
            history={history}
            loading={historyLoading}
            onViewItem={(item) => setSelectedHistoryItem(item)}
          />
        )}
      </div>
    </div>
  )
}
