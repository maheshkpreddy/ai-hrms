'use client'

import { useState, useRef, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Sparkles,
  Clock,
  Trash2,
  Plus,
  Bot,
  User,
  Calendar,
  FileText,
  IndianRupee,
  ClipboardList,
  Search,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useHRMSStore } from '@/lib/store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages: ChatMessage[]
}

// ─── AI Response Simulation ───────────────────────────────────────────────────

const aiResponses: Record<string, string> = {
  leave: `You have 12 Casual Leaves, 7 Sick Leaves, and 5 Earned Leaves remaining for this year.\n\nWould you like me to help you apply for leave or check the leave policy?`,
  attendance: `🕐 **Attendance Summary**\n\n**This Month (May 2026):**\n• Present: 18 days\n• Absent: 0 days\n• Late Check-in: 2 days\n• Work From Home: 3 days\n\n**Today's Status:** ✅ Checked in at 9:12 AM\n\nWould you like to see a detailed attendance report?`,
  payslip: `💰 **Latest Payslip - April 2026**\n\n• Basic: ₹75,000\n• HRA: ₹30,000\n• Special Allowance: ₹20,000\n• **Gross:** ₹1,25,000\n• TDS: ₹15,000\n• PF: ₹9,000\n• **Net Pay:** ₹1,01,000\n\nWould you like to download the detailed payslip?`,
  policy: `📄 **Company Policies**\n\nHere are the key policies:\n\n1. **Working Hours:** 9:30 AM - 6:30 PM (Flexi 30 min)\n2. **Dress Code:** Business Casuals (Mon-Thu), Casual (Fri)\n3. **WFH Policy:** 2 days/week with manager approval\n4. **Probation:** 3-6 months based on role\n5. **Notice Period:** 30 days\n\nWant details on any specific policy?`,
  recruitment: `🎯 **Recruitment Status**\n\n**Active Requisitions:**\n• Senior Developer - Engineering (3 positions)\n• Marketing Lead - Marketing (1 position)\n• Financial Analyst - Finance (2 positions)\n\n**Pipeline:**\n• Total Candidates: 47\n• Shortlisted: 12\n• Interviews Scheduled: 5\n• Offers Pending: 2\n\nNeed help with any specific position?`,
  apply_leave: `To apply for leave:\n1. Go to Leave Management > My Leaves\n2. Click 'Apply for Leave'\n3. Select leave type, dates, and reason\n4. Submit for approval\n\nYour manager will be notified automatically.\n\nWould you like me to take you to the Leave Management module?`,
  default: `Thank you for your query! I'm here to help with anything related to HRMS. Here are some things I can assist with:\n\n• 📋 Leave balance & applications\n• 🕐 Attendance queries\n• 💰 Payslip & payroll info\n• 📄 Company policies\n• 🎯 Recruitment status\n\nPlease ask me anything!`,
}

function getAIResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('leave balance') || lower.includes('how much leave') || lower.includes('remaining leave')) return aiResponses.leave
  if (lower.includes('apply') && lower.includes('leave')) return aiResponses.apply_leave
  if (lower.includes('leave') || lower.includes('holiday') || lower.includes('time off')) return aiResponses.leave
  if (lower.includes('attendance') || lower.includes('check-in') || lower.includes('clock') || lower.includes('present')) return aiResponses.attendance
  if (lower.includes('payslip') || lower.includes('salary') || lower.includes('pay') || lower.includes('compensation')) return aiResponses.payslip
  if (lower.includes('policy') || lower.includes('rule') || lower.includes('guideline') || lower.includes('handbook')) return aiResponses.policy
  if (lower.includes('recruit') || lower.includes('hir') || lower.includes('job') || lower.includes('position') || lower.includes('candidate')) return aiResponses.recruitment
  return aiResponses.default
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()
}

function isWithinLast7Days(date: Date): boolean {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return date >= sevenDaysAgo && !isToday(date) && !isYesterday(date)
}

function formatGroupDate(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIChatbot() {
  const { activeSubItem, setActiveSubItem } = useHRMSStore()
  const [sessions, setSessions] = useState<ChatSession[]>([
    // Today
    {
      id: 's1', title: "What's my leave balance?", lastMessage: 'You have 12 Casual Leaves...', timestamp: new Date(),
      messages: [
        { id: 'm1', role: 'user', content: "What's my leave balance?", timestamp: new Date(new Date().setHours(10, 30)) },
        { id: 'm2', role: 'assistant', content: aiResponses.leave, timestamp: new Date(new Date().setHours(10, 31)) },
      ],
    },
    {
      id: 's2', title: 'How do I apply for leave?', lastMessage: 'To apply for leave...', timestamp: new Date(new Date().setHours(9, 15)),
      messages: [
        { id: 'm3', role: 'user', content: 'How do I apply for leave?', timestamp: new Date(new Date().setHours(9, 14)) },
        { id: 'm4', role: 'assistant', content: aiResponses.apply_leave, timestamp: new Date(new Date().setHours(9, 15)) },
      ],
    },
    // Yesterday
    {
      id: 's3', title: 'Attendance Question', lastMessage: 'Your attendance summary is ready', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
      messages: [
        { id: 'm5', role: 'user', content: 'Show my attendance for this month', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
        { id: 'm6', role: 'assistant', content: aiResponses.attendance, timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
      ],
    },
    // Previous 7 days
    {
      id: 's4', title: 'Payslip Request', lastMessage: 'Your payslip has been generated', timestamp: new Date(new Date().setDate(new Date().getDate() - 3)),
      messages: [
        { id: 'm7', role: 'user', content: 'I need my latest payslip', timestamp: new Date(new Date().setDate(new Date().getDate() - 3)) },
        { id: 'm8', role: 'assistant', content: aiResponses.payslip, timestamp: new Date(new Date().setDate(new Date().getDate() - 3)) },
      ],
    },
    {
      id: 's5', title: 'Company Policies', lastMessage: 'Here are the key policies', timestamp: new Date(new Date().setDate(new Date().getDate() - 5)),
      messages: [
        { id: 'm9', role: 'user', content: 'What are the company policies?', timestamp: new Date(new Date().setDate(new Date().getDate() - 5)) },
        { id: 'm10', role: 'assistant', content: aiResponses.policy, timestamp: new Date(new Date().setDate(new Date().getDate() - 5)) },
      ],
    },
  ])
  const [activeSessionId, setActiveSessionId] = useState<string | null>('s1')
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeSession = sessions.find(s => s.id === activeSessionId) || null

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeSession?.messages, isTyping])

  // Group sessions by time
  const todaySessions = sessions.filter(s => isToday(s.timestamp))
  const yesterdaySessions = sessions.filter(s => isYesterday(s.timestamp))
  const previousSessions = sessions.filter(s => isWithinLast7Days(s.timestamp))
  const olderSessions = sessions.filter(s => !isToday(s.timestamp) && !isYesterday(s.timestamp) && !isWithinLast7Days(s.timestamp))

  function createNewChat() {
    const newSession: ChatSession = {
      id: `s${Date.now()}`,
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      messages: [
        {
          id: `m${Date.now()}`,
          role: 'assistant',
          content: "Hello! 👋 I'm your eh2r AI assistant. How can I help you today?\n\nYou can ask me about:\n• 📋 Leave balance & applications\n• 🕐 Attendance queries\n• 💰 Payslip information\n• 📄 Company policies\n• 🎯 Recruitment status",
          timestamp: new Date(),
        },
      ],
    }
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setInputValue('')
    inputRef.current?.focus()
  }

  function handleSend() {
    if (!inputValue.trim()) return

    let sessionId = activeSessionId
    if (!sessionId) {
      const newSession: ChatSession = {
        id: `s${Date.now()}`,
        title: inputValue.slice(0, 35) + (inputValue.length > 35 ? '...' : ''),
        lastMessage: inputValue,
        timestamp: new Date(),
        messages: [],
      }
      sessionId = newSession.id
      setSessions(prev => [newSession, ...prev])
      setActiveSessionId(sessionId)
    }

    const userMessage: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    const currentInput = inputValue
    setSessions(prev => prev.map(s => s.id === sessionId ? {
      ...s,
      title: s.messages.length <= 1 ? currentInput.slice(0, 35) + (currentInput.length > 35 ? '...' : '') : s.title,
      lastMessage: currentInput,
      timestamp: new Date(),
      messages: [...s.messages, userMessage],
    } : s))
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response with 500-1500ms delay
    const delay = 500 + Math.random() * 1000
    const responseText = getAIResponse(currentInput)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      }
      setSessions(prev => prev.map(s => s.id === sessionId ? {
        ...s,
        lastMessage: responseText.slice(0, 50) + '...',
        messages: [...s.messages, aiMessage],
      } : s))
      setIsTyping(false)
    }, delay)
  }

  function handleDeleteSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSessionId === id) setActiveSessionId(null)
  }

  // Respond to sub-item navigation from sidebar
  useEffect(() => {
    if (activeSubItem) {
      switch (activeSubItem) {
        case 'chat':
          // Focus on current chat or start a new one
          if (!activeSessionId) createNewChat()
          inputRef.current?.focus()
          break
        case 'conversation-history':
          // Ensure sidebar is open to show history
          setSidebarOpen(true)
          break
        default:
          break
      }
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  const suggestedQueries = [
    { icon: Calendar, label: "What's my leave balance?", query: "What's my leave balance?" },
    { icon: Clock, label: 'Check attendance', query: 'Show my attendance for this month' },
    { icon: IndianRupee, label: 'View payslip', query: 'I need my latest payslip' },
    { icon: FileText, label: 'Company policies', query: 'Tell me about company policies' },
    { icon: ClipboardList, label: 'Recruitment status', query: 'What is the current recruitment status?' },
  ]

  function renderSessionGroup(title: string, groupSessions: ChatSession[]) {
    if (groupSessions.length === 0) return null
    return (
      <div className="mb-3">
        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <div className="space-y-0.5">
          {groupSessions.map(session => (
            <button
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`w-full text-left rounded-lg px-2.5 py-2 transition-colors group ${activeSessionId === session.id ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-muted/50 border border-transparent'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${activeSessionId === session.id ? 'text-emerald-700' : ''}`}>{session.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{session.lastMessage || 'New chat'}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-red-500"
                  onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id) }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                AI Assistant
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI Powered
                </Badge>
              </h1>
              <p className="text-muted-foreground text-sm">Your intelligent HR companion</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
          {/* Sidebar - Chat History */}
          {sidebarOpen && (
            <Card className="w-72 shrink-0 hidden sm:flex flex-col">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Chat History</CardTitle>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={createNewChat} title="New chat">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-2 pt-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                  {renderSessionGroup('Today', todaySessions)}
                  {renderSessionGroup('Yesterday', yesterdaySessions)}
                  {renderSessionGroup('Previous 7 Days', previousSessions)}
                  {renderSessionGroup('Older', olderSessions)}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Main Chat Area */}
          <Card className="flex-1 flex flex-col">
            {!activeSession ? (
              /* Welcome Screen */
              <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">eh2r AI Assistant</h2>
                <p className="text-muted-foreground text-sm text-center max-w-md mb-8">
                  Ask me anything about leaves, attendance, payslips, policies, or recruitment. I&apos;m here to help!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl w-full">
                  {suggestedQueries.map((query) => (
                    <button
                      key={query.label}
                      onClick={() => { setInputValue(query.query); inputRef.current?.focus() }}
                      className="flex items-center gap-2 rounded-lg border p-3 text-left hover:bg-emerald-50 hover:border-emerald-200 transition-colors group"
                    >
                      <query.icon className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-sm font-medium">{query.label}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto group-hover:text-emerald-600" />
                    </button>
                  ))}
                </div>
                <Button onClick={createNewChat} className="mt-6 gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4" /> Start New Chat
                </Button>
              </div>
            ) : (
              /* Chat View */
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{activeSession.title}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> AI Assistant · Online
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-red-500" onClick={() => handleDeleteSession(activeSessionId)}>
                      <Trash2 className="h-3 w-3" /> Clear
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {activeSession.messages.map(message => (
                      <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.role === 'assistant' && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mt-1">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-sky-600 text-white' : 'bg-muted'}`}>
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                          <p className={`text-[10px] mt-1.5 ${message.role === 'user' ? 'text-sky-200' : 'text-muted-foreground'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 mt-1">
                            <User className="h-4 w-4 text-sky-700" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 mt-1">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Suggested Query Chips */}
                {!isTyping && activeSession.messages.length <= 2 && (
                  <div className="border-t px-4 py-2">
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-3xl mx-auto">
                      {suggestedQueries.map(q => (
                        <button
                          key={q.label}
                          onClick={() => { setInputValue(q.query); inputRef.current?.focus() }}
                          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 hover:border-emerald-200 transition-colors shrink-0"
                        >
                          <q.icon className="h-3 w-3 text-emerald-600" />
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t px-4 py-3">
                  <div className="flex gap-2 max-w-3xl mx-auto">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                      placeholder="Ask me anything about HR..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping} className="bg-emerald-600 hover:bg-emerald-700 px-3">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
