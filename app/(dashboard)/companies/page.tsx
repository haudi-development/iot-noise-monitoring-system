"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDummyData } from '@/lib/data/dummy-data'
import { Company } from '@/lib/types'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar
} from 'lucide-react'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(getDummyData().companies)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm('この企業を削除してもよろしいですか？')) {
      setCompanies(companies.filter(c => c.id !== id))
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">企業管理</h1>
          <p className="text-muted-foreground">契約企業の情報を管理</p>
        </div>
        <Button 
          className="bg-alsok-blue hover:bg-blue-700"
          onClick={() => window.location.href = '/companies/new'}
        >
          <Plus className="h-4 w-4 mr-2" />
          新規企業追加
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              企業一覧
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="企業名・担当者で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map(company => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                        company.plan === 'premium' ? 'bg-purple-100 text-purple-700' :
                        company.plan === 'standard' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {company.plan === 'premium' ? 'プレミアム' :
                         company.plan === 'standard' ? 'スタンダード' : 'ベーシック'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      company.status === 'active' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {company.status === 'active' ? 'アクティブ' : '停止中'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Building2 className="h-4 w-4 mr-2" />
                      物件数: {company.propertyCount}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {company.phone}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {company.email}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      契約日: {format(company.contractDate, 'yyyy年MM月dd日', { locale: ja })}
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-1">担当者</p>
                    <p className="text-sm text-muted-foreground">{company.contactPerson}</p>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingCompany(company)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(company.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}