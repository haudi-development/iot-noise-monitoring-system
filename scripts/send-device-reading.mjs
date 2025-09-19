#!/usr/bin/env node

const args = process.argv.slice(2)

const usage = `
Usage: node scripts/send-device-reading.mjs [options]

Options:
  --base-url <url>        API のベース URL（デフォルト: http://localhost:3000）
  --device-id <id>        デバイスID（デフォルト: ALSOK-PROTOTYPE-01）
  --noise-level <number>  騒音レベル (dB)。未指定なら 30〜95 の乱数
  --battery <number>      バッテリー残量 (%)
  --temperature <number>  温度 (℃)
  --humidity <number>     湿度 (%)
  --status <status>       デバイスステータス（online/offline/warning など）
  --count <n>             送信回数（デフォルト: 1）
  --interval <ms>         送信間隔ミリ秒（デフォルト: 15000）
  --api-key <key>         API キー（環境変数 DEVICE_API_KEY でも可）
  --help                  このヘルプを表示

環境変数:
  DEVICE_API_KEY          ヘッダーに付与する API キー
  DEVICE_BASE_URL         デフォルトのベース URL
`

function parseArgs(argv) {
  const options = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg.startsWith('--')) {
      continue
    }

    if (arg === '--help') {
      options.help = true
      continue
    }

    const key = arg.slice(2)
    const value = argv[i + 1]
    if (value && !value.startsWith('--')) {
      options[key] = value
      i += 1
    } else {
      options[key] = true
    }
  }
  return options
}

function toNumber(value, name) {
  if (value === undefined) return undefined
  const num = Number(value)
  if (Number.isNaN(num)) {
    throw new Error(`${name} は数値として解釈できません: ${value}`)
  }
  return num
}

async function sendReading(options) {
  const baseUrl = options.baseUrl || process.env.DEVICE_BASE_URL || 'http://localhost:3000'
  const endpoint = new URL('/api/device-readings', baseUrl).toString()

  const apiKey = options.apiKey || process.env.DEVICE_API_KEY
  if (!apiKey) {
    throw new Error('API キーが設定されていません。--api-key か環境変数 DEVICE_API_KEY を指定してください。')
  }

  const noiseLevel = options.noiseLevel !== undefined
    ? toNumber(options.noiseLevel, 'noise-level')
    : Math.round((Math.random() * 65 + 30) * 10) / 10

  const payload = {
    deviceId: options.deviceId || 'ALSOK-PROTOTYPE-01',
    noiseLevel,
    recordedAt: new Date().toISOString(),
    batteryLevel: toNumber(options.battery, 'battery'),
    temperature: toNumber(options.temperature, 'temperature'),
    humidity: toNumber(options.humidity, 'humidity'),
    status: options.status,
    metadata: {
      propertyName: 'ALSOKテストラボ',
      roomNumber: 'LAB-01',
      location: 'オフィス窓際',
      notes: 'send-device-reading script',
    },
  }

  // 余分な undefined を削除
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key]
    }
  })

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`送信失敗 (${response.status}): ${errorBody}`)
  }

  const data = await response.json()
  return data
}

async function main() {
  const options = parseArgs(args)

  if (options.help) {
    console.log(usage)
    process.exit(0)
  }

  try {
    const count = options.count ? toNumber(options.count, 'count') : 1
    const interval = options.interval ? toNumber(options.interval, 'interval') : 15000

    for (let i = 0; i < count; i += 1) {
      const result = await sendReading(options)
      console.log(`[${new Date().toISOString()}] Sent reading`, result.reading)

      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, interval))
      }
    }
  } catch (error) {
    console.error('送信処理でエラーが発生しました:', error.message)
    process.exit(1)
  }
}

main()
