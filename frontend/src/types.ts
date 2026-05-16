export interface AnalysisResult {
  id: string
  filename?: string
  overall_score: number
  ats_score: number
  strengths: string[]
  weaknesses: string[]
  action_items: string[]
  summary: string
}

export interface ResumeRecord extends AnalysisResult {
  uploaded_at: string
  rewritten_text?: string
}

export interface HistoryItem {
  id: string
  filename: string
  uploaded_at: string
  overall_score: number
  ats_score: number
  strengths: string[]
  weaknesses: string[]
  action_items: string[]
  summary: string
  rewritten_text?: string
}
