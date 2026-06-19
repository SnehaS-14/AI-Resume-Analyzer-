import { useState, useEffect } from 'react'
import axios from 'axios'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import UploadZone from './components/UploadZone'
import ResultPanel from './components/ResultPanel'
import HistoryPanel from './components/HistoryPanel'
import type { AnalysisResult, ResumeRecord } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-resume-analyzer-svry.onrender.com'

type Tab = 'analyze' | 'history'
type AuthPage = 'login' | 'signup'

// Production deployment

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
  const [downloading, setDownloading] = useState(false)
  const [history, setHistory] = useState<ResumeRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ResumeRecord | null>(null)

  const handleLogin = (userId: string, _email: string, name: string) => {
    setUserId(userId)
    setUserName(name)
    setIsLoggedIn(true)
    localStorage.setItem('auth', JSON.stringify({ userId, userName: name }))
  }

  const handleSignup = (userId: string, _email: string, name: string) => {
    handleLogin(userId, _email, name)
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

  const handleRewriteHistory = async () => {
    if (!selectedHistoryItem?.id || !userId) return
    setRewriting(true)
    setError(null)

    try {
      const response = await axios.post(`${API_URL}/rewrite/${selectedHistoryItem.id}?user_id=${userId}`)
      setSelectedHistoryItem({
        ...selectedHistoryItem,
        rewritten_text: response.data.rewritten_text
      })
    } catch (err) {
      const detail = (err as any).response?.data?.detail || 'Rewrite failed'
      setError(detail)
    } finally {
      setRewriting(false)
    }
  }

  const handleDownload = async (analysisId?: string) => {
    const id = analysisId || result?.id
    if (!id || !userId) {
      setError('Missing resume or user information')
      return
    }

    try {
      setDownloading(true)
      setError(null)
      const downloadUrl = `${API_URL}/rewrite/${id}/download?user_id=${userId}`

      // Fetch the PDF file as blob
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
        headers: { 'Accept': 'application/pdf' }
      })

      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `resume_rewritten.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const detail = (err as any).response?.data?.detail || 'PDF download failed. Please try again.'
      setError(detail)
      console.error('Download error:', err)
    } finally {
      setDownloading(false)
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
        apiUrl={API_URL}
      />
    ) : (
      <SignupPage
        onSignup={handleSignup}
        onSwitchToLogin={() => setAuthPage('login')}
        apiUrl={API_URL}
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
        padding: 'clamp(12px, 4vw, 16px) clamp(16px, 5vw, 32px)',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.25)',
        borderBottom: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(12px, 3vw, 32px)', flexWrap: 'wrap' }}>
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 14px)', flex: 1, minWidth: '200px' }}>
              {/* Icon */}
              <div style={{
                fontSize: 'clamp(24px, 5vw, 32px)',
                lineHeight: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'clamp(40px, 8vw, 48px)',
                height: 'clamp(40px, 8vw, 48px)',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
                📄
              </div>

              {/* Brand Info */}
              <div style={{ minWidth: '0' }}>
                <h1 style={{
                  fontSize: 'clamp(20px, 6vw, 24px)',
                  fontWeight: '800',
                  margin: '0',
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                  wordBreak: 'break-word',
                }}>
                  Resume AI
                </h1>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  margin: '2px 0 0 0',
                  fontSize: 'clamp(9px, 2vw, 11px)',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  display: window.innerWidth < 480 ? 'none' : 'block',
                }}>
                  Powered by Groq
                </p>
              </div>
            </div>

            {/* Right Section - User & Logout */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(10px, 2vw, 18px)',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}>
              {/* User Info */}
              <div style={{ textAlign: 'right', display: window.innerWidth < 480 ? 'none' : 'block' }}>
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
                  fontSize: 'clamp(12px, 3vw, 14px)',
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
                  padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 18px)',
                  borderRadius: '8px',
                  fontSize: 'clamp(11px, 2.5vw, 12px)',
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(20px, 5vw, 40px) clamp(12px, 4vw, 20px)' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', marginBottom: 'clamp(20px, 5vw, 32px)', flexWrap: 'wrap' }}>
          {(['analyze', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: 'clamp(10px, 2vw, 12px) clamp(16px, 4vw, 24px)',
                borderRadius: '8px',
                border: 'none',
                fontSize: 'clamp(13px, 2.5vw, 14px)',
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
                  onRewrite={handleRewriteHistory}
                  onDownload={() => handleDownload(selectedHistoryItem?.id)}
                  rewriting={rewriting}
                  downloading={downloading}
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
                    downloading={downloading}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          <HistoryPanel
            history={history}
            loading={historyLoading}
            onViewItem={(item) => {
              setSelectedHistoryItem(item)
              setActiveTab('analyze')
            }}
          />
        )}
      </div>
    </div>
  )
}
