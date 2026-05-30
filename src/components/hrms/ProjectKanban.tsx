'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useApi, apiPost, apiPatch, apiDelete } from '@/lib/useApi'
import { useHRMSStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FolderKanban, Plus, ChevronLeft, ChevronRight, Search, Loader2, X, MoreHorizontal, Calendar, User, Tag, MessageSquare, Trash2, LayoutList, Timeline, GanttChart } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface KanbanCardComment {
  id: string
  authorName: string
  content: string
  createdAt: string
}

interface KanbanCardData {
  id: string
  columnId: string
  title: string
  description: string | null
  priority: string
  position: number
  dueDate: string | null
  assigneeId: string | null
  tags: string | null
  coverColor: string | null
  createdAt: string
  comments?: KanbanCardComment[]
}

interface KanbanColumnData {
  id: string
  boardId: string
  title: string
  color: string
  position: number
  cards: KanbanCardData[]
}

interface KanbanBoardData {
  id: string
  name: string
  description: string | null
  projectId: string | null
  columns: KanbanColumnData[]
  project?: { id: string; name: string } | null
}

interface EmployeeData {
  id: string
  firstName: string
  lastName: string
  email: string
  designation?: string | null
  avatar?: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityConfig: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  low: { label: 'Low', bg: 'bg-slate-50 dark:bg-slate-900', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400', border: 'border-slate-200 dark:border-slate-700' },
  medium: { label: 'Medium', bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  high: { label: 'High', bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', border: 'border-orange-200 dark:border-orange-800' },
  urgent: { label: 'Urgent', bg: 'bg-rose-50 dark:bg-rose-950', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500', border: 'border-rose-200 dark:border-rose-800' },
}

function getPriority(priority: string) {
  return priorityConfig[priority] || priorityConfig.medium
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function isOverdue(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

function getInitials(firstName: string, lastName: string) {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || '?'
}

function parseTags(tags: string | null): string[] {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Column header color mapping for subtle background tinting
function getColumnBgStyle(color: string) {
  return { borderTopColor: color }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectKanban() {
  const { toast } = useToast()
  const { activeSubItem, setActiveSubItem } = useHRMSStore()

  // View mode state for sub-item navigation
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'timeline'>('kanban')

  // Handle sub-item navigation from sidebar
  useEffect(() => {
    if (activeSubItem) {
      switch (activeSubItem) {
        case 'kanban-board':
          setViewMode('kanban')
          break
        case 'project-list':
          setViewMode('list')
          break
        case 'timelines':
          setViewMode('timeline')
          break
      }
      setActiveSubItem(null)
    }
  }, [activeSubItem, setActiveSubItem])

  // ── Core State ─────────────────────────────────────────────────────────────
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Board dialog state
  const [addBoardOpen, setAddBoardOpen] = useState(false)
  const [boardForm, setBoardForm] = useState({ name: '', description: '', projectId: '' })
  const [savingBoard, setSavingBoard] = useState(false)

  // Card dialog state
  const [addCardOpen, setAddCardOpen] = useState(false)
  const [addCardColumnId, setAddCardColumnId] = useState<string | null>(null)
  const [cardForm, setCardForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '', tags: '' })
  const [savingCard, setSavingCard] = useState(false)

  // Card detail dialog
  const [cardDetailOpen, setCardDetailOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null)
  const [cardComment, setCardComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  // Column dialog state
  const [addColumnOpen, setAddColumnOpen] = useState(false)
  const [columnForm, setColumnForm] = useState({ title: '', color: '#6366f1' })
  const [savingColumn, setSavingColumn] = useState(false)

  // Rename column dialog
  const [renameColumnOpen, setRenameColumnOpen] = useState(false)
  const [renameColumnId, setRenameColumnId] = useState<string | null>(null)
  const [renameColumnTitle, setRenameColumnTitle] = useState('')

  // ── API Hooks ──────────────────────────────────────────────────────────────

  const { data: boardsData, loading: boardsLoading, error: boardsError, refetch: refetchBoards } = useApi<{
    boards: KanbanBoardData[]
  }>({
    baseUrl: '/api/kanban/boards',
  })

  const { data: projectsData } = useApi<{
    projects: { id: string; name: string; status: string }[]
  }>({
    baseUrl: '/api/projects',
    params: { limit: 50 },
  })

  const { data: employeesData } = useApi<{
    employees: EmployeeData[]
    pagination: { total: number }
  }>({
    baseUrl: '/api/employees',
    params: { limit: 100, status: 'active' },
  })

  const boards = boardsData?.boards ?? []
  const projects = projectsData?.projects ?? []
  const employees = employeesData?.employees ?? []

  // Employee lookup map
  const employeeMap = useMemo(() => {
    const map = new Map<string, EmployeeData>()
    employees.forEach(e => map.set(e.id, e))
    return map
  }, [employees])

  // Active board & columns
  const activeBoard = useMemo(() => {
    if (!activeBoardId && boards.length > 0) return boards[0]
    return boards.find(b => b.id === activeBoardId) || boards[0] || null
  }, [boards, activeBoardId])

  const columns = useMemo(() => {
    if (!activeBoard?.columns) return []
    return [...activeBoard.columns].sort((a, b) => a.position - b.position)
  }, [activeBoard])

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const allCards = boards.flatMap(b => b.columns?.flatMap(c => c.cards || []) || [])
    const inProgressCols = columns.filter(c =>
      c.title.toLowerCase().includes('progress') || c.title.toLowerCase().includes('in progress')
    )
    const doneCols = columns.filter(c =>
      c.title.toLowerCase().includes('done') || c.title.toLowerCase().includes('complete')
    )
    const inProgressCards = inProgressCols.flatMap(c => c.cards || [])
    const completedCards = doneCols.flatMap(c => c.cards || [])
    return {
      totalBoards: boards.length,
      totalCards: allCards.length,
      inProgress: inProgressCards.length,
      completed: completedCards.length,
    }
  }, [boards, columns])

  // ── Search filter ──────────────────────────────────────────────────────────

  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) return columns
    const q = searchQuery.toLowerCase()
    return columns.map(col => ({
      ...col,
      cards: col.cards.filter(card =>
        card.title.toLowerCase().includes(q) ||
        card.description?.toLowerCase().includes(q) ||
        parseTags(card.tags).some(t => t.toLowerCase().includes(q))
      ),
    }))
  }, [columns, searchQuery])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreateBoard = useCallback(async () => {
    if (!boardForm.name.trim()) return
    setSavingBoard(true)
    try {
      await apiPost('/api/kanban/boards', {
        name: boardForm.name.trim(),
        description: boardForm.description.trim() || null,
        projectId: boardForm.projectId === 'none' ? null : (boardForm.projectId || null),
      })
      toast({ title: 'Board Created', description: `"${boardForm.name}" created successfully.` })
      setAddBoardOpen(false)
      setBoardForm({ name: '', description: '', projectId: '' })
      refetchBoards()
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to create board', variant: 'destructive' })
    } finally {
      setSavingBoard(false)
    }
  }, [boardForm, refetchBoards, toast])

  const handleDeleteBoard = useCallback(async (id: string) => {
    if (!confirm('Delete this board and all its columns and cards?')) return
    try {
      await apiDelete(`/api/kanban/boards/${id}`)
      toast({ title: 'Board Deleted' })
      setActiveBoardId(null)
      refetchBoards()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete board', variant: 'destructive' })
    }
  }, [refetchBoards, toast])

  const handleAddCard = useCallback(async () => {
    if (!cardForm.title.trim() || !addCardColumnId) return
    setSavingCard(true)
    try {
      await apiPost('/api/kanban/cards', {
        columnId: addCardColumnId,
        title: cardForm.title.trim(),
        description: cardForm.description.trim() || null,
        priority: cardForm.priority,
        dueDate: cardForm.dueDate || null,
        assigneeId: cardForm.assigneeId === 'none' ? null : (cardForm.assigneeId || null),
        tags: cardForm.tags.trim() ? JSON.stringify(cardForm.tags.split(',').map(t => t.trim()).filter(Boolean)) : null,
      })
      toast({ title: 'Card Added', description: `"${cardForm.title}" added successfully.` })
      setAddCardOpen(false)
      setCardForm({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '', tags: '' })
      refetchBoards()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add card', variant: 'destructive' })
    } finally {
      setSavingCard(false)
    }
  }, [cardForm, addCardColumnId, refetchBoards, toast])

  const handleMoveCard = useCallback(async (cardId: string, targetColumnId: string) => {
    try {
      await apiPatch(`/api/kanban/cards/${cardId}`, { columnId: targetColumnId })
      refetchBoards()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to move card', variant: 'destructive' })
    }
  }, [refetchBoards, toast])

  const handleDeleteCard = useCallback(async (cardId: string) => {
    if (!confirm('Delete this card?')) return
    try {
      await apiDelete(`/api/kanban/cards/${cardId}`)
      toast({ title: 'Card Deleted' })
      setCardDetailOpen(false)
      setSelectedCard(null)
      refetchBoards()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete card', variant: 'destructive' })
    }
  }, [refetchBoards, toast])

  const handleAddComment = useCallback(async () => {
    if (!cardComment.trim() || !selectedCard) return
    setPostingComment(true)
    try {
      await apiPost(`/api/kanban/cards/${selectedCard.id}/comments`, {
        content: cardComment.trim(),
        authorName: 'HR Admin',
        authorId: 'current-user',
      })
      setCardComment('')
      refetchBoards()
      toast({ title: 'Comment Added' })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add comment', variant: 'destructive' })
    } finally {
      setPostingComment(false)
    }
  }, [cardComment, selectedCard, refetchBoards, toast])

  const handleAddColumn = useCallback(async () => {
    if (!columnForm.title.trim() || !activeBoard) return
    setSavingColumn(true)
    try {
      await apiPost('/api/kanban/columns', {
        boardId: activeBoard.id,
        title: columnForm.title.trim(),
        color: columnForm.color,
      })
      toast({ title: 'Column Added', description: `"${columnForm.title}" added to board.` })
      setAddColumnOpen(false)
      setColumnForm({ title: '', color: '#6366f1' })
      refetchBoards()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add column', variant: 'destructive' })
    } finally {
      setSavingColumn(false)
    }
  }, [columnForm, activeBoard, refetchBoards, toast])

  const handleDeleteColumn = useCallback(async (columnId: string) => {
    if (!confirm('Delete this column and all its cards?')) return
    try {
      await apiDelete(`/api/kanban/columns/${columnId}`)
      toast({ title: 'Column Deleted' })
      refetchBoards()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete column', variant: 'destructive' })
    }
  }, [refetchBoards, toast])

  const handleRenameColumn = useCallback(async () => {
    if (!renameColumnId || !renameColumnTitle.trim()) return
    try {
      await apiPatch(`/api/kanban/columns/${renameColumnId}`, { title: renameColumnTitle.trim() })
      toast({ title: 'Column Renamed' })
      setRenameColumnOpen(false)
      setRenameColumnId(null)
      setRenameColumnTitle('')
      refetchBoards()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to rename column', variant: 'destructive' })
    }
  }, [renameColumnId, renameColumnTitle, refetchBoards, toast])

  const openCardDetail = useCallback((card: KanbanCardData) => {
    setSelectedCard(card)
    setCardDetailOpen(true)
  }, [])

  const moveCardLeft = useCallback((card: KanbanCardData, colIndex: number) => {
    if (colIndex <= 0) return
    const targetCol = columns[colIndex - 1]
    if (targetCol) handleMoveCard(card.id, targetCol.id)
  }, [columns, handleMoveCard])

  const moveCardRight = useCallback((card: KanbanCardData, colIndex: number) => {
    if (colIndex >= columns.length - 1) return
    const targetCol = columns[colIndex + 1]
    if (targetCol) handleMoveCard(card.id, targetCol.id)
  }, [columns, handleMoveCard])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 shadow-sm">
              <FolderKanban className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Project Kanban</h1>
              <p className="text-muted-foreground text-sm">Visualize and manage project tasks with Kanban boards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggles */}
            <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setViewMode('kanban')}
              >
                <FolderKanban className="h-3.5 w-3.5" /> Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-3.5 w-3.5" /> List
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setViewMode('timeline')}
              >
                <Calendar className="h-3.5 w-3.5" /> Timeline
              </Button>
            </div>
            <Button onClick={() => setAddBoardOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 shadow-sm">
              <Plus className="h-4 w-4" /> New Board
            </Button>
          </div>
        </div>

        {/* ─── Stats Cards ─────────────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { label: 'Total Boards', value: stats.totalBoards, icon: FolderKanban, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
            { label: 'Total Cards', value: stats.totalCards, icon: Tag, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/50' },
            { label: 'In Progress', value: stats.inProgress, icon: Loader2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' },
            { label: 'Completed', value: stats.completed, icon: FolderKanban, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/50' },
          ].map((stat) => (
            <Card key={stat.label} className="overflow-hidden border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── Loading ─────────────────────────────────────────────────────── */}
        {boardsLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-muted-foreground text-sm">Loading boards...</p>
          </div>
        ) : boardsError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <p className="text-destructive text-sm">{boardsError}</p>
            <Button variant="outline" size="sm" onClick={refetchBoards}>Retry</Button>
          </div>
        ) : boards.length === 0 ? (
          /* ─── Empty State ───────────────────────────────────────────────── */
          <Card className="border-dashed">
            <CardContent className="p-12 text-center text-muted-foreground">
              <FolderKanban className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">No boards yet</p>
              <p className="text-sm mb-6">Create your first Kanban board to start managing tasks visually</p>
              <Button onClick={() => setAddBoardOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> Create Board
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* ─── Board Selector & Search ──────────────────────────────────── */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {boards.map((board) => (
                  <Button
                    key={board.id}
                    variant={activeBoard?.id === board.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveBoardId(board.id)}
                    className={cn(
                      'gap-1.5 shrink-0 transition-all',
                      activeBoard?.id === board.id
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'hover:bg-muted'
                    )}
                  >
                    <FolderKanban className="h-3.5 w-3.5" />
                    {board.name}
                    {board.project && (
                      <span className="text-[10px] opacity-70 ml-0.5">({board.project.name})</span>
                    )}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search cards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-48 pl-8 text-sm"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0.5 top-1/2 h-6 w-6 -translate-y-1/2"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Board Header ────────────────────────────────────────────── */}
            {activeBoard && viewMode === 'kanban' && (
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{activeBoard.name}</h2>
                  {activeBoard.description && (
                    <p className="text-sm text-muted-foreground">{activeBoard.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setAddColumnOpen(true)} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add Column
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteBoard(activeBoard.id)}
                    className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Board
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Kanban View ───────────────────────────────────────────── */}
            {viewMode === 'kanban' && (
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
                {filteredColumns.map((column, colIndex) => {
                  const cardCount = column.cards?.length || 0
                  return (
                    <div key={column.id} className="w-[300px] shrink-0">
                      {/* ── Column Header ─────────────────────────────────── */}
                      <div
                        className="mb-3 rounded-xl border-t-4 bg-muted/40 dark:bg-muted/20 shadow-sm"
                        style={getColumnBgStyle(column.color)}
                      >
                        <div className="px-3 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="size-3 rounded-full shadow-sm" style={{ backgroundColor: column.color }} />
                              <span className="text-sm font-semibold">{column.title}</span>
                              <Badge
                                variant="secondary"
                                className="h-5 min-w-[20px] justify-center px-1.5 text-[10px] font-bold"
                              >
                                {cardCount}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setAddCardColumnId(column.id)
                                  setCardForm({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '', tags: '' })
                                  setAddCardOpen(true)
                                }}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setRenameColumnId(column.id)
                                  setRenameColumnTitle(column.title)
                                  setRenameColumnOpen(true)
                                }}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── Cards ───────────────────────────────────────────── */}
                      <div className="space-y-2.5">
                        {column.cards?.sort((a, b) => a.position - b.position).map((card) => {
                          const pCfg = getPriority(card.priority)
                          const tags = parseTags(card.tags)
                          const assignee = card.assigneeId ? employeeMap.get(card.assigneeId) : null
                          return (
                            <Card
                              key={card.id}
                              className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group border-border/60"
                              onClick={() => openCardDetail(card)}
                            >
                              {/* Cover color strip */}
                              {card.coverColor && (
                                <div className="h-1.5 rounded-t-lg" style={{ backgroundColor: card.coverColor }} />
                              )}
                              <CardContent className="p-3 space-y-2">
                                {/* Title */}
                                <p className="text-sm font-medium leading-tight line-clamp-2">{card.title}</p>

                                {/* Description snippet */}
                                {card.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{card.description}</p>
                                )}

                                {/* Priority + Tags row */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border', pCfg.bg, pCfg.text, pCfg.border)}>
                                    <span className={cn('size-1.5 rounded-full', pCfg.dot)} />
                                    {pCfg.label}
                                  </span>
                                  {tags.slice(0, 2).map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {tags.length > 2 && (
                                    <span className="text-[10px] text-muted-foreground">+{tags.length - 2}</span>
                                  )}
                                </div>

                                {/* Footer: Date, Comments, Assignee */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {card.dueDate && (
                                      <span className={cn(
                                        'text-[10px] flex items-center gap-0.5',
                                        isOverdue(card.dueDate) ? 'text-rose-600 font-medium' : 'text-muted-foreground'
                                      )}>
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(card.dueDate)}
                                      </span>
                                    )}
                                    {(card.comments?.length ?? 0) > 0 && (
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                        <MessageSquare className="h-3 w-3" /> {card.comments?.length}
                                      </span>
                                    )}
                                  </div>
                                  {assignee && (
                                    <div
                                      className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800"
                                      title={`${assignee.firstName} ${assignee.lastName}`}
                                    >
                                      {getInitials(assignee.firstName, assignee.lastName)}
                                    </div>
                                  )}
                                </div>

                                {/* Move Buttons (visible on hover) */}
                                <div className="flex items-center gap-1 pt-1.5 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={colIndex === 0}
                                    onClick={(e) => { e.stopPropagation(); moveCardLeft(card, colIndex) }}
                                    title={colIndex > 0 ? `Move to ${columns[colIndex - 1].title}` : 'No column to left'}
                                  >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                  </Button>
                                  <span className="text-[10px] text-muted-foreground flex-1 text-center">Move</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    disabled={colIndex >= columns.length - 1}
                                    onClick={(e) => { e.stopPropagation(); moveCardRight(card, colIndex) }}
                                    title={colIndex < columns.length - 1 ? `Move to ${columns[colIndex + 1].title}` : 'No column to right'}
                                  >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}

                        {/* Empty column */}
                        {(!column.cards || column.cards.length === 0) && (
                          <div className="rounded-xl border-2 border-dashed p-6 text-center hover:border-muted-foreground/30 transition-colors">
                            <p className="text-xs text-muted-foreground mb-2">No cards yet</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs gap-1"
                              onClick={() => {
                                setAddCardColumnId(column.id)
                                setCardForm({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '', tags: '' })
                                setAddCardOpen(true)
                              }}
                            >
                              <Plus className="h-3 w-3" /> Add Card
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* ── Add Column Card ───────────────────────────────────────── */}
                <div className="w-[280px] shrink-0">
                  <button
                    onClick={() => setAddColumnOpen(true)}
                    className="w-full rounded-xl border-2 border-dashed p-6 text-center text-muted-foreground hover:border-emerald-400/50 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all"
                  >
                    <Plus className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">Add Column</span>
                  </button>
                </div>
              </div>
            </ScrollArea>
            )}

            {/* ─── List View ─────────────────────────────────────────────── */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredColumns.flatMap(col =>
                  (col.cards || []).map(card => ({ ...card, columnTitle: col.title, columnColor: col.color }))
                ).sort((a, b) => a.position - b.position).map(card => {
                  const pCfg = getPriority(card.priority)
                  const assignee = card.assigneeId ? employeeMap.get(card.assigneeId) : null
                  return (
                    <Card key={card.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => openCardDetail(card)}>
                      <CardContent className="p-3 flex items-center gap-4">
                        <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: card.columnColor }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{card.title}</p>
                          <p className="text-xs text-muted-foreground">{card.columnTitle}</p>
                        </div>
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border shrink-0', pCfg.bg, pCfg.text, pCfg.border)}>
                          <span className={cn('size-1.5 rounded-full', pCfg.dot)} />{pCfg.label}
                        </span>
                        {card.dueDate && (
                          <span className={cn('text-[10px] flex items-center gap-0.5 shrink-0', isOverdue(card.dueDate) ? 'text-rose-600 font-medium' : 'text-muted-foreground')}>
                            <Calendar className="h-3 w-3" />{formatDate(card.dueDate)}
                          </span>
                        )}
                        {assignee && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800" title={`${assignee.firstName} ${assignee.lastName}`}>
                            {getInitials(assignee.firstName, assignee.lastName)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
                {filteredColumns.every(col => !col.cards || col.cards.length === 0) && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <LayoutList className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No cards to display</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ─── Timeline View ──────────────────────────────────────────── */}
            {viewMode === 'timeline' && (
              <div className="space-y-4">
                {filteredColumns.flatMap(col =>
                  (col.cards || []).filter(c => c.dueDate).map(card => ({ ...card, columnTitle: col.title, columnColor: col.color }))
                ).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()).map(card => {
                  const pCfg = getPriority(card.priority)
                  const assignee = card.assigneeId ? employeeMap.get(card.assigneeId) : null
                  return (
                    <Card key={card.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => openCardDetail(card)}>
                      <CardContent className="p-3 flex items-center gap-4">
                        <div className="flex items-center gap-2 w-36 shrink-0">
                          <Calendar className={cn('h-4 w-4', isOverdue(card.dueDate) ? 'text-rose-500' : 'text-emerald-500')} />
                          <span className={cn('text-sm font-medium', isOverdue(card.dueDate) ? 'text-rose-600' : '')}>{formatDate(card.dueDate)}</span>
                        </div>
                        <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: card.columnColor }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{card.title}</p>
                          <p className="text-xs text-muted-foreground">{card.columnTitle}</p>
                        </div>
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border shrink-0', pCfg.bg, pCfg.text, pCfg.border)}>
                          <span className={cn('size-1.5 rounded-full', pCfg.dot)} />{pCfg.label}
                        </span>
                        {assignee && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800" title={`${assignee.firstName} ${assignee.lastName}`}>
                            {getInitials(assignee.firstName, assignee.lastName)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
                {filteredColumns.flatMap(col => (col.cards || []).filter(c => !c.dueDate)).length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">No due date</p>
                    <div className="space-y-2">
                      {filteredColumns.flatMap(col =>
                        (col.cards || []).filter(c => !c.dueDate).map(card => ({ ...card, columnTitle: col.title, columnColor: col.color }))
                      ).map(card => {
                        const pCfg = getPriority(card.priority)
                        return (
                          <Card key={card.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => openCardDetail(card)}>
                            <CardContent className="p-3 flex items-center gap-4">
                              <div className="w-36 shrink-0 text-sm text-muted-foreground">No date</div>
                              <div className="w-2 h-8 rounded-full shrink-0" style={{ backgroundColor: card.columnColor }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{card.title}</p>
                                <p className="text-xs text-muted-foreground">{card.columnTitle}</p>
                              </div>
                              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border shrink-0', pCfg.bg, pCfg.text, pCfg.border)}>
                                <span className={cn('size-1.5 rounded-full', pCfg.dot)} />{pCfg.label}
                              </span>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}
                {filteredColumns.every(col => !col.cards || col.cards.length === 0) && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground">
                      <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No cards with due dates</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Create Board Dialog ──────────────────────────────────────────── */}
      <Dialog open={addBoardOpen} onOpenChange={setAddBoardOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>Create a Kanban board with default columns (Backlog, To Do, In Progress, Done)</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Board Name *</Label>
              <Input
                id="board-name"
                value={boardForm.name}
                onChange={(e) => setBoardForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sprint 1, Product Roadmap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="board-desc">Description</Label>
              <Textarea
                id="board-desc"
                value={boardForm.description}
                onChange={(e) => setBoardForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="What is this board about?"
              />
            </div>
            <div className="space-y-2">
              <Label>Link to Project</Label>
              <Select value={boardForm.projectId} onValueChange={(v) => setBoardForm(f => ({ ...f, projectId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBoardOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBoard} disabled={savingBoard || !boardForm.name.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {savingBoard && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Card Dialog ──────────────────────────────────────────────── */}
      <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Card</DialogTitle>
            <DialogDescription>Add a new task card to this column</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="card-title">Title *</Label>
              <Input
                id="card-title"
                value={cardForm.title}
                onChange={(e) => setCardForm(f => ({ ...f, title: e.target.value }))}
                placeholder="What needs to be done?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-desc">Description</Label>
              <Textarea
                id="card-desc"
                value={cardForm.description}
                onChange={(e) => setCardForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Add more details..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={cardForm.priority} onValueChange={(v) => setCardForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-due">Due Date</Label>
                <Input
                  id="card-due"
                  type="date"
                  value={cardForm.dueDate}
                  onChange={(e) => setCardForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={cardForm.assigneeId} onValueChange={(v) => setCardForm(f => ({ ...f, assigneeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select assignee (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="card-tags">Tags (comma-separated)</Label>
              <Input
                id="card-tags"
                value={cardForm.tags}
                onChange={(e) => setCardForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="frontend, bug, feature"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCardOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCard} disabled={savingCard || !cardForm.title.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {savingCard && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Card Detail Dialog ───────────────────────────────────────────── */}
      <Dialog open={cardDetailOpen} onOpenChange={(open) => { setCardDetailOpen(open); if (!open) { setSelectedCard(null); setCardComment('') } }}>
        <DialogContent className="max-w-lg max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span className="truncate">{selectedCard?.title}</span>
              {selectedCard && (
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border', getPriority(selectedCard.priority).bg, getPriority(selectedCard.priority).text, getPriority(selectedCard.priority).border)}>
                  <span className={cn('size-1.5 rounded-full', getPriority(selectedCard.priority).dot)} />
                  {getPriority(selectedCard.priority).label}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <ScrollArea className="max-h-[60vh] pr-1">
              <div className="space-y-5 pr-2">
                {/* Description */}
                {selectedCard.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                    <p className="text-sm mt-1.5 whitespace-pre-wrap">{selectedCard.description}</p>
                  </div>
                )}

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedCard.dueDate && (
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Due Date</Label>
                      <p className={cn('text-sm mt-1.5 flex items-center gap-1.5', isOverdue(selectedCard.dueDate) && 'text-rose-600 font-medium')}>
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(selectedCard.dueDate)}
                        {isOverdue(selectedCard.dueDate) && <Badge variant="destructive" className="text-[9px] h-4 px-1 ml-1">Overdue</Badge>}
                      </p>
                    </div>
                  )}
                  {selectedCard.assigneeId && employeeMap.get(selectedCard.assigneeId) && (
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Assignee</Label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800">
                          {getInitials(
                            employeeMap.get(selectedCard.assigneeId)?.firstName || '',
                            employeeMap.get(selectedCard.assigneeId)?.lastName || ''
                          )}
                        </div>
                        <span className="text-sm">
                          {employeeMap.get(selectedCard.assigneeId)?.firstName} {employeeMap.get(selectedCard.assigneeId)?.lastName}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {parseTags(selectedCard.tags).length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Tags</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {parseTags(selectedCard.tags).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-[11px] gap-1">
                          <Tag className="h-2.5 w-2.5" />{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Move to column */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Move to Column</Label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {columns.filter(c => c.id !== selectedCard.columnId).map(c => (
                      <Button
                        key={c.id}
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveCard(selectedCard.id, c.id)}
                        className="gap-1.5"
                      >
                        <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.title}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t" />

                {/* Comments Section */}
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Comments ({selectedCard.comments?.length || 0})
                  </Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {selectedCard.comments?.map((comment) => (
                      <div key={comment.id} className="rounded-lg bg-muted/60 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{comment.authorName}</span>
                          <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-xs leading-relaxed">{comment.content}</p>
                      </div>
                    ))}
                    {(!selectedCard.comments || selectedCard.comments.length === 0) && (
                      <p className="text-xs text-muted-foreground text-center py-3">No comments yet</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Add a comment..."
                      value={cardComment}
                      onChange={(e) => setCardComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!cardComment.trim() || postingComment}
                      className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                    >
                      {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Delete */}
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteCard(selectedCard.id)}
                    className="gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Card
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Add Column Dialog ────────────────────────────────────────────── */}
      <Dialog open={addColumnOpen} onOpenChange={setAddColumnOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Column</DialogTitle>
            <DialogDescription>Add a new column to this board</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="col-title">Column Title *</Label>
              <Input
                id="col-title"
                value={columnForm.title}
                onChange={(e) => setColumnForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. In Testing, Blocked"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {['#6b7280', '#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#0ea5e9', '#14b8a6', '#f97316', '#84cc16'].map(c => (
                  <button
                    key={c}
                    className={cn(
                      'size-8 rounded-full border-2 transition-all shadow-sm',
                      columnForm.color === c ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-offset-background ring-foreground/30' : 'border-transparent hover:scale-105 hover:border-muted-foreground/30'
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setColumnForm(f => ({ ...f, color: c }))}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddColumnOpen(false)}>Cancel</Button>
            <Button onClick={handleAddColumn} disabled={savingColumn || !columnForm.title.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {savingColumn && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Rename Column Dialog ─────────────────────────────────────────── */}
      <Dialog open={renameColumnOpen} onOpenChange={setRenameColumnOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-col-title">Column Title *</Label>
              <Input
                id="rename-col-title"
                value={renameColumnTitle}
                onChange={(e) => setRenameColumnTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                if (renameColumnId) {
                  handleDeleteColumn(renameColumnId)
                  setRenameColumnOpen(false)
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRenameColumnOpen(false)}>Cancel</Button>
              <Button onClick={handleRenameColumn} className="bg-emerald-600 hover:bg-emerald-700">Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
