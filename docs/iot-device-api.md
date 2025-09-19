# IoTデバイス連携 API 仕様

ALSOK IoT騒音監視システムの Web 管理画面と、試作 IoT デバイス（15 秒周期）を連携させるための API 仕様です。Vercel・本番環境では Supabase をストレージとして利用し、ローカル開発で Supabase 環境変数が未設定の場合は従来どおりインメモリ実装が自動的にフォールバックします。

## Supabase セットアップ

1. Supabase プロジェクトを作成し、`Project API keys` から `Project URL` と `service_role` キーを控えます。
2. SQL エディタで以下を実行し、計測データ用テーブルを作成します。

```sql
create extension if not exists "pgcrypto";

create table if not exists public.device_readings (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  recorded_at timestamptz not null,
  received_at timestamptz not null,
  noise_level numeric(6,2) not null,
  noise_max numeric(6,2) not null,
  battery_level numeric,
  temperature numeric,
  humidity numeric,
  status text,
  metadata jsonb,
  thresholds jsonb,
  payload jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.device_readings
  add column if not exists noise_max numeric(6,2);

update public.device_readings
  set noise_max = coalesce(noise_max, noise_level)
  where noise_max is null;

alter table public.device_readings
  alter column noise_max set not null;

create index if not exists idx_device_readings_device_recorded
  on public.device_readings (device_id, recorded_at desc);

create index if not exists idx_device_readings_recorded
  on public.device_readings (recorded_at desc);

alter table public.device_readings enable row level security;

create policy "device_readings_service_role"
  on public.device_readings
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.system_settings enable row level security;

create policy "system_settings_service_role"
  on public.system_settings
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into public.system_settings (key, value)
  values ('device_ingest_enabled', jsonb_build_object('enabled', true))
  on conflict (key) do nothing;
```

3. Vercel（およびローカル開発の `.env.local`）に以下の環境変数を設定します。

```
SUPABASE_URL=<Project URL>
SUPABASE_SERVICE_ROLE_KEY=<service_role キー>
DEVICE_API_KEY=<任意のデバイス用APIキー（任意）>
# DEVICE_INGEST_ENABLED=false  # Supabase 未接続時のフォールバック用（省略時は true）
```

4. 実機デバイスからは従来どおり `/api/device-readings` に POST すれば Supabase に蓄積されます。UI は 15 秒周期のポーリングで最新値を取得します。
   - `DEVICE_API_KEY` を設定した場合、必ずリクエストヘッダーに `X-API-Key: <DEVICE_API_KEY>` もしくは `Authorization: Bearer <DEVICE_API_KEY>` を付与してください。キーが一致しない場合は 401 が返却されます。

## エンドポイント

| メソッド | パス | 用途 |
| --- | --- | --- |
| `POST` | `/api/device-readings` | デバイスから最新の測定値を送信 |
| `GET` | `/api/device-readings` | すべてのデバイスの最新値一覧を取得 |
| `GET` | `/api/device-readings?deviceId=xxx&limit=100` | 特定デバイスの履歴取得（最大 500 件、デフォルト 100 件） |
| `GET` | `/api/device-ingest` | デバイスデータ受信の有効/無効状態を取得 |
| `POST` | `/api/device-ingest` | 受信状態の更新（backend 管理用） |

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
| `noiseLevel` | number | ✔ | 平均または瞬間の騒音レベル (dB)。0〜150 の範囲。 |
| `noiseMax` | number | ✔ | 直近 15 秒で観測した最大騒音レベル (dB)。0〜150 の範囲。 |
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
    "noiseMax": 72.8,
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
    "noiseMax": 72.8,
    "noiseMax": 72.8,
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
| `503` | データ受信が一時停止中。ダッシュボードの設定で再開が必要。 |

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
      "noiseMax": 70.1,
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
      "noiseMax": 73.4,
      "recordedAt": "2024-09-01T12:36:26.000Z",
      "receivedAt": "2024-09-01T12:36:26.712Z"
    },
    {
      "deviceId": "ALSOK-PROTOTYPE-01",
      "noiseLevel": 62.8,
      "noiseMax": 71.0,
      "recordedAt": "2024-09-01T12:36:11.000Z",
      "receivedAt": "2024-09-01T12:36:11.745Z"
    }
  ]
}
```

## 運用メモ

- Supabase の環境変数が未設定の場合は既存のインメモリ実装が利用されます（ローカル開発用）。
- フロントエンドは 15 秒間隔で `GET /api/device-readings` をポーリングし、ダッシュボードとデバイス一覧に反映しています。
- 実機を増やす場合は、`deviceId` ごとにデータが分離されます。UI 側は配列をそのままマージするため、同じ API を複数台で共用可能です。
- 将来的に Supabase 以外のストレージへ移行したい場合は、`app/api/device-readings/route.ts` 内で Supabase クライアントを差し替えることで対応できます。

## `GET / POST /api/device-ingest`

- デバイスデータ受信のオン/オフを制御するための管理用エンドポイントです（ダッシュボードの設定画面で利用）。
- `GET` は `{ "enabled": true | false }` を返します。
- `POST` は `{ "enabled": true | false }` を受け取り、`system_settings` テーブルの `device_ingest_enabled` を更新します。
- 受信がオフの場合、`POST /api/device-readings` は `503 ingest_disabled` を返し、新しいデータは Supabase に保存されません。
