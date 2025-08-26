"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDummyData } from '@/lib/data/dummy-data'
import { Alert } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Bell,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Volume2,
  MapPin,
  User,
  Filter,
  AlertTriangle,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export default function AlertsPage() {
  const data = getDummyData()
  const [alerts, setAlerts] = useState(data.alerts)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'acknowledged' | 'resolved'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus
    return matchesSearch && matchesPriority && matchesStatus
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const showPages = 5 // Number of page buttons to show
    
    let start = Math.max(1, currentPage - Math.floor(showPages / 2))
    let end = Math.min(totalPages, start + showPages - 1)
    
    if (end - start < showPages - 1) {
      start = Math.max(1, end - showPages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const stats = {
    new: alerts.filter(a => a.status === 'new').length,
    acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.priority === 'critical' && a.status !== 'resolved').length
  }

  const handleStatusUpdate = (alertId: string, newStatus: 'acknowledged' | 'resolved') => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: newStatus, assignedTo: 'operator1' }
        : alert
    ))
  }

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handlePriorityChange = (value: any) => {
    setFilterPriority(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: any) => {
    setFilterStatus(value)
    setCurrentPage(1)
  }

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'new': return <Bell className="h-4 w-4" />
      case 'acknowledged': return <Clock className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">アラート管理</h1>
          <p className="text-muted-foreground">騒音アラートの確認と対応管理</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">新規アラート</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">確認済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-yellow-600">{stats.acknowledged}</div>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">解決済み</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">緊急対応</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="物件名・部屋番号で検索"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md"
          value={filterPriority}
          onChange={(e) => handlePriorityChange(e.target.value as any)}
        >
          <option value="all">全優先度</option>
          <option value="critical">緊急</option>
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
        <select
          className="px-3 py-2 border rounded-md"
          value={filterStatus}
          onChange={(e) => handleStatusChange(e.target.value as any)}
        >
          <option value="all">全ステータス</option>
          <option value="new">新規</option>
          <option value="acknowledged">確認済</option>
          <option value="resolved">解決済</option>
        </select>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          全 {filteredAlerts.length} 件中 {startIndex + 1} - {Math.min(endIndex, filteredAlerts.length)} 件を表示
        </p>
      </div>

      <div className="space-y-4">
        {paginatedAlerts.map(alert => (
          <Card key={alert.id} className={`border-l-4 ${getPriorityColor(alert.priority)}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(alert.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.status === 'new' ? 'bg-blue-100 text-blue-700' :
                        alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {alert.status === 'new' ? '新規' :
                         alert.status === 'acknowledged' ? '確認済' : '解決済'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.priority === 'critical' ? 'bg-red-500 text-white' :
                      alert.priority === 'high' ? 'bg-orange-500 text-white' :
                      alert.priority === 'medium' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {alert.priority === 'critical' ? '緊急' :
                       alert.priority === 'high' ? '高' :
                       alert.priority === 'medium' ? '中' : '低'}優先度
                    </span>
                    <div className="text-sm text-muted-foreground">
                      {format(alert.startTime, 'yyyy/MM/dd HH:mm', { locale: ja })}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{alert.propertyName}</span>
                      <span className="text-muted-foreground">/ {alert.roomNumber}号室</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{alert.noiseLevel.toFixed(1)} dB</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{alert.duration}分間</span>
                    </div>
                    {alert.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{alert.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {alert.status === 'new' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStatusUpdate(alert.id, 'acknowledged')}
                    >
                      確認
                    </Button>
                  )}
                  {alert.status === 'acknowledged' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100"
                      onClick={() => handleStatusUpdate(alert.id, 'resolved')}
                    >
                      解決
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {currentPage > 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>
              {currentPage > 4 && <span className="text-muted-foreground">...</span>}
            </>
          )}

          {getPageNumbers().map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-alsok-blue hover:bg-blue-700" : ""}
            >
              {page}
            </Button>
          ))}

          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span className="text-muted-foreground">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}