# デバイス連携 API ガイド

ALSOK IoT 騒音監視システムに試作 IoT センサーを接続するための手順と API 仕様です。15 秒周期で計測データを送信する前提で設計されています。

## 1. エンドポイント

- ベース URL（例）: `https://iot-noise-monitoring-system.vercel.app`
- 計測値送信: `POST /api/device-readings`
- 最新値確認（オプション）: `GET /api/device-readings`
- 履歴確認（オプション）: `GET /api/device-readings?deviceId=<DEVICE_ID>&limit=<N>`

> **重要:** 本番 URL は環境により異なります。最新のデプロイ URL を使用してください。

## 2. 認証

サーバーには環境変数 `DEVICE_API_KEY` が設定されています。デバイスからリクエストを送る際は必ず以下のいずれかのヘッダーを付与してください。

```
X-API-Key: <DEVICE_API_KEY>
```
または
```
Authorization: Bearer <DEVICE_API_KEY>
```

- `DEVICE_API_KEY` の具体的な値は別途共有されます（このドキュメントには記載しません）。
- キーが一致しない場合は `401 Unauthorized` が返却され、測定値は登録されません。

## 3. データ送信フォーマット

### リクエスト

- メソッド: `POST`
- パス: `/api/device-readings`
- ヘッダー:
  - `Content-Type: application/json`
  - `X-API-Key` または `Authorization`（前述）
- ボディ（JSON）:

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `deviceId` | string | ✔ | デバイス一意識別子（例: `ALSOK-PROTOTYPE-01`） |
| `noiseLevel` | number | ✔ | 平均/瞬間の騒音レベル (dB)。0〜150 が想定範囲。 |
| `noiseMax` | number | ✔ | 直近 15 秒間で観測した最大騒音レベル (dB)。0〜150。 |
| `recordedAt` | string (ISO 8601) |  | 測定した時刻。未指定だと受信時刻が採用される。 |
| `batteryLevel` | number |  | バッテリー残量 (%)。0〜100。 |
| `temperature` | number |  | 温度 (℃)。 |
| `humidity` | number |  | 湿度 (%)。 |
| `status` | `'online' | 'offline' | 'warning'` |  | 任意のステータス文字列。未指定ならサーバー側で自動判定。 |
| `metadata` | object |  | 物件・設置場所等のメタ情報。サンプル参照。 |
| `thresholds` | object |  | 閾値情報。サンプル参照。 |
| `payload` | object |  | 任意の追加データ。ログ用途。 |

#### サンプル

```bash
curl -X POST https://iot-noise-monitoring-system.vercel.app/api/device-readings \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <DEVICE_API_KEY>" \
  -d '{
    "deviceId": "ALSOK-PROTOTYPE-01",
    "recordedAt": "2024-09-19T12:34:56.000Z",
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

### レスポンス

```json
{
  "message": "reading accepted",
  "reading": {
    "deviceId": "ALSOK-PROTOTYPE-01",
    "noiseLevel": 64.2,
    "noiseMax": 72.8,
    "recordedAt": "2024-09-19T12:34:56.000Z",
    "receivedAt": "2024-09-19T12:35:01.123Z",
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

## 4. 成功とエラー

| ステータス | 意味 | 備考 |
| --- | --- | --- |
| `201 Created` | 受領し Supabase に保存済み | レスポンスに保存内容が含まれます |
| `400 Bad Request` | JSON 解析・バリデーション失敗 | `details` にフィールドエラーが入ります |
| `401 Unauthorized` | API キー不一致または未指定 | `X-API-Key` / `Authorization` ヘッダーを確認 |
| `500 Internal Server Error` | Supabase などバックエンド側での保存失敗 | サーバーログを確認してください |

## 5. 動作スケジュール

- 15 秒ごとに最新の計測値を送信してください。UI 側も 15 秒周期でポーリングしています。
- 同一デバイス ID から連続送信したデータは Supabase の `device_readings` テーブルに時系列で蓄積されます。

## 6. 補足

- Supabase 側のテーブル定義や環境変数設定は `docs/iot-device-api.md` を参照してください。
- テスト時は BASE URL をローカル開発環境（例: `http://localhost:3000`）に置き換えて実行可能です。
- `DEVICE_API_KEY` の具体的な値は別途共有されます。このドキュメントは第三者に渡しても問題ないよう、キーの実値は記載していません。
- `noiseMax` は常に `noiseLevel` 以上になるよう送信してください（このリポジトリの送信スクリプトは自動で補正します）。

## 7. FAQ

### Q. API キーを更新したい場合は？
- Vercel で `DEVICE_API_KEY` を新しい値に更新し再デプロイしてください。
- 同時にデバイス側のヘッダーも更新する必要があります。

### Q. Supabase に登録されたデータはどこで確認できますか？
- Supabase ダッシュボード → `Table Editor` → `device_readings` でリアルタイムに確認可能です。

## 8. 動作確認用スクリプト

アプリ内に簡易送信用スクリプト `scripts/send-device-reading.mjs` を用意しています。開発中に手動でデータを投げたい場合に利用してください。

1. `.env.local` やシェルで `DEVICE_API_KEY` と `DEVICE_BASE_URL`（必要なら）を設定
2. コマンドを実行

```bash
npm run send-reading -- \
  --base-url https://iot-noise-monitoring-system.vercel.app \
  --device-id ALSOK-PROTOTYPE-01 \
  --noise-level 62.5 \
  --noise-max 71.0 \
  --battery 78 \
  --temperature 23.4 \
  --humidity 45
```

- オプションを省略すると乱数（noiseLevel など）で送信されます。
- `--noise-max` を省略した場合は `noiseLevel` 以上のランダム値が自動付与されます。
- `--count` と `--interval` を指定すると複数回連続送信が可能です。例: `--count 4 --interval 5000`
- `--api-key` オプションで、環境変数ではなくコマンドライン側に直接キーを指定することもできます。

以上です。ご不明点は開発チームまで問い合わせください。
