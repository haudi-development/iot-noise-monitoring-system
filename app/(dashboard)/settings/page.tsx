"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Bell, Shield, Database, Wifi, Globe } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">システム設定</h1>
        <p className="text-muted-foreground">システムの各種設定を管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              通知設定
            </CardTitle>
            <CardDescription>
              アラート通知の条件と方法を設定
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>緊急アラート通知先メール</Label>
              <Input type="email" placeholder="alert@alsok.co.jp" />
            </div>
            <div className="space-y-2">
              <Label>通知遅延時間（分）</Label>
              <Input type="number" placeholder="5" />
            </div>
            <Button className="bg-alsok-blue hover:bg-blue-700">保存</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              セキュリティ設定
            </CardTitle>
            <CardDescription>
              アクセス制御とセキュリティポリシー
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>セッションタイムアウト（分）</Label>
              <Input type="number" placeholder="30" />
            </div>
            <div className="space-y-2">
              <Label>ログイン試行回数制限</Label>
              <Input type="number" placeholder="5" />
            </div>
            <Button className="bg-alsok-blue hover:bg-blue-700">保存</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              デバイス設定
            </CardTitle>
            <CardDescription>
              IoTデバイスのデフォルト設定
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>通信間隔（秒）</Label>
              <Input type="number" placeholder="15" />
            </div>
            <div className="space-y-2">
              <Label>バッテリー警告閾値（%）</Label>
              <Input type="number" placeholder="20" />
            </div>
            <Button className="bg-alsok-blue hover:bg-blue-700">保存</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              データ管理
            </CardTitle>
            <CardDescription>
              データ保存と管理設定
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>データ保持期間（日）</Label>
              <Input type="number" placeholder="365" />
            </div>
            <div className="space-y-2">
              <Label>自動バックアップ間隔</Label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>毎日</option>
                <option>週1回</option>
                <option>月1回</option>
              </select>
            </div>
            <Button className="bg-alsok-blue hover:bg-blue-700">保存</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            システム情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">システムバージョン:</span>
              <span className="ml-2 font-medium">v1.0.0</span>
            </div>
            <div>
              <span className="text-muted-foreground">最終更新日:</span>
              <span className="ml-2 font-medium">2025年8月26日</span>
            </div>
            <div>
              <span className="text-muted-foreground">APIバージョン:</span>
              <span className="ml-2 font-medium">v2.0</span>
            </div>
            <div>
              <span className="text-muted-foreground">ライセンス状態:</span>
              <span className="ml-2 font-medium text-green-600">有効</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}