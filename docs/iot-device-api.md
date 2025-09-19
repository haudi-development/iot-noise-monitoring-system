# IoTデバイス連携 API 仕様

ALSOK IoT騒音監視システムの Web 管理画面と、試作 IoT デバイス（15 秒周期）を連携させるためのモック API 仕様です。現状は Next.js の API Routes 上で動作するインメモリ実装であり、サーバー再起動で蓄積データはリセットされます。

## エンドポイント

| メソッド | パス | 用途 |
| --- | --- | --- |
| `POST` | `/api/device-readings` | デバイスから最新の測定値を送信 |
| `GET` | `/api/device-readings` | すべてのデバイスの最新値一覧を取得 |
| `GET` | `/api/device-readings?deviceId=xxx&limit=100` | 特定デバイスの履歴取得（最大 500 件、デフォルト 100 件） |

## 認証

- 環境変数 `DEVICE_API_KEY` が未設定の場合、すべてのリクエストを無認証で受け付けます（ローカル開発デフォルト）。
- `DEVICE_API_KEY` を設定すると `POST` リクエストに API キーが必須になります。`GET` は UI から参照できるよう無認証のままです。
- API キーは以下いずれかのヘッダーで送信してください。
  - `X-API-Key: <YOUR_KEY>`
  - `Authorization: Bearer <YOUR_KEY>`

## `POST /api/device-readings`

### リクエストヘッダー

```
Content-Type: application/json
X-API-Key: <YOUR_KEY>      # DEVICE_API_KEY を設定している場合のみ必須
```

### リクエストボディ

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceId` | string | ✔ | デバイス識別子（例: `ALSOK-PROTOTYPE-01`） |
| `noiseLevel` | number | ✔ | 騒音レベル (dB)。0〜150 の範囲。 |
| `recordedAt` | string (ISO8601) |  | センサー計測時刻。未指定の場合は受信時刻を利用。 |
| `batteryLevel` | number |  | バッテリー残量 (%)。0〜100。 |
| `temperature` | number |  | 温度 (℃)。 |
| `humidity` | number |  | 湿度 (%)。 |
| `status` | `online\|offline\|warning` |  | デバイス自身が把握している状態。未指定なら自動判定。 |
| `metadata.propertyId` | string |  | 物件 ID。UI 上での紐づけに使用。 |
| `metadata.propertyName` | string |  | 物件名。未指定時は `ALSOKプロトタイプ棟`。 |
| `metadata.roomNumber` | string |  | 部屋番号。未指定時は `LAB-01`。 |
| `metadata.location` | string |  | 設置場所メモ。未指定時は `テストラボ`。 |
| `metadata.floor` | number |  | 階数情報。 |
| `metadata.notes` | string |  | 備考（UI に表示）。 |
| `thresholds.normal.min/max` | number |  | 平常時の閾値 (dB)。 |
| `thresholds.night.min/max` | number |  | 夜間閾値 (dB)。 |
| `thresholds.holiday.min/max` | number |  | 休日閾値 (dB)。 |
| `payload` | object |  | 任意の追加ペイロード。ログ用途。 |

#### サンプル

```bash
curl -X POST http://localhost:3000/api/device-readings \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ALSOK-PROTOTYPE-01",
    "recordedAt": "2024-09-01T12:34:56.000Z",
    "noiseLevel": 64.2,
    "batteryLevel": 82,
    "temperature": 23.5,
    "humidity": 48,
    "metadata": {
      "propertyName": "ALSOKテストラボ",
      "roomNumber": "LAB-01",
      "location": "オフィス窓際",
      "notes": "試作機1号"
    }
  }'
```

### レスポンス (201 Created)

```json
{
  "message": "reading accepted",
  "reading": {
    "deviceId": "ALSOK-PROTOTYPE-01",
    "noiseLevel": 64.2,
    "recordedAt": "2024-09-01T12:34:56.000Z",
    "receivedAt": "2024-09-01T12:35:01.123Z",
    "batteryLevel": 82,
    "temperature": 23.5,
    "humidity": 48,
    "metadata": {
      "propertyName": "ALSOKテストラボ",
      "roomNumber": "LAB-01",
      "location": "オフィス窓際",
      "notes": "試作機1号"
    }
  }
}
```

### エラー

| ステータス | 意味 |
| --- | --- |
| `400` | JSON 解析・バリデーションエラー。`details` にフィールド単位の情報を返却。 |
| `401` | API キーが無効、または未指定。 |

## `GET /api/device-readings`

### 最新値一覧

- レスポンスは `devices` 配列。各要素は直近の登録データです。
- UI ではこのレスポンスを 15 秒間隔でポーリングし、試作デバイスの最新値を表示します。

```bash
curl http://localhost:3000/api/device-readings
```

```json
{
  "devices": [
    {
      "deviceId": "ALSOK-PROTOTYPE-01",
      "noiseLevel": 62.8,
      "recordedAt": "2024-09-01T12:36:11.000Z",
      "receivedAt": "2024-09-01T12:36:11.745Z",
      "batteryLevel": 81,
      "temperature": 23.7,
      "humidity": 47,
      "metadata": {
        "propertyName": "ALSOKテストラボ",
        "roomNumber": "LAB-01",
        "location": "オフィス窓際"
      }
    }
  ]
}
```

### 履歴取得

```
curl "http://localhost:3000/api/device-readings?deviceId=ALSOK-PROTOTYPE-01&limit=200"
```

- `limit` は 1〜500 で指定可能。未指定時は 100 件を返却。
- 最新順（降順）で配列を返します。

```json
{
  "deviceId": "ALSOK-PROTOTYPE-01",
  "readings": [
    {
      "deviceId": "ALSOK-PROTOTYPE-01",
      "noiseLevel": 63.1,
      "recordedAt": "2024-09-01T12:36:26.000Z",
      "receivedAt": "2024-09-01T12:36:26.712Z"
    },
    {
      "deviceId": "ALSOK-PROTOTYPE-01",
      "noiseLevel": 62.8,
      "recordedAt": "2024-09-01T12:36:11.000Z",
      "receivedAt": "2024-09-01T12:36:11.745Z"
    }
  ]
}
```

## 運用メモ

- 本実装は開発用モックです。データはプロセス内に保持され、Vercel などのサーバーレス環境ではリクエスト単位でリセットされる点に注意してください。
- フロントエンドは 15 秒間隔で `GET /api/device-readings` をポーリングし、ダッシュボードとデバイス一覧に反映しています。
- 実機を増やす場合は、`deviceId` ごとにデータが分離されます。UI 側は配列をそのままマージするため、同じ API を複数台で共用可能です。
- 将来的に永続化（例: データベース、キュー）を導入したら、`lib/server/device-store.ts` を差し替えることで API 表面はそのまま利用できます。
