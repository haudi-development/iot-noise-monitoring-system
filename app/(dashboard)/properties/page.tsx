"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDummyData } from '@/lib/data/dummy-data'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import {
  Home,
  Search,
  Plus,
  MapPin,
  Building,
  Users,
  Phone,
  Mail,
  Upload,
  Layers
} from 'lucide-react'

export default function PropertiesPage() {
  const data = getDummyData()
  const [properties] = useState(data.properties)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<string>('all')

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCompany = selectedCompany === 'all' || property.companyId === selectedCompany
    return matchesSearch && matchesCompany
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">物件管理</h1>
          <p className="text-muted-foreground">管理物件の情報と図面を管理</p>
        </div>
        <Button 
          className="bg-alsok-blue hover:bg-blue-700"
          onClick={() => window.location.href = '/properties/new'}
        >
          <Plus className="h-4 w-4 mr-2" />
          新規物件登録
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="物件名・住所で検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          className="px-3 py-2 border rounded-md"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          <option value="all">全企業</option>
          {data.companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map(property => {
          const rooms = data.rooms.filter(r => r.propertyId === property.id)
          const devices = data.devices.filter(d => d.propertyId === property.id)
          const company = data.companies.find(c => c.id === property.companyId)
          
          return (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{property.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {company?.name}
                    </CardDescription>
                  </div>
                  <Home className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{property.address}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Layers className="h-4 w-4 mr-2" />
                    {property.floors}階建て
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Building className="h-4 w-4 mr-2" />
                    全{property.totalRooms}室 (デバイス: {devices.length}台)
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <p className="text-sm font-medium">管理者情報</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-2" />
                      {property.manager.name}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      {property.manager.phone}
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2" />
                      <span className="text-xs truncate">{property.manager.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-1" />
                    図面
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    部屋管理
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-alsok-blue hover:bg-blue-700"
                    onClick={() => window.location.href = `/properties/${property.id}`}
                  >
                    詳細
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  登録日: {format(property.createdAt, 'yyyy/MM/dd', { locale: ja })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}