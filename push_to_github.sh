#!/bin/bash

echo "GitHubへのプッシュ設定"
echo "========================"
echo ""
echo "Fine-grained Personal Access Tokenを入力してください："
echo "(github_pat_で始まるトークン)"
read -s GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "エラー: トークンが入力されていません"
    exit 1
fi

echo "プッシュを実行中..."

# 一時的にトークン付きURLを設定
git remote set-url origin https://haudi-development:${GITHUB_TOKEN}@github.com/haudi-development/iot-noise-monitoring-system.git

# プッシュ実行
git push -u origin main

# セキュリティのため、トークンを含まないURLに戻す
git remote set-url origin https://github.com/haudi-development/iot-noise-monitoring-system.git

echo ""
echo "完了！リポジトリはこちら："
echo "https://github.com/haudi-development/iot-noise-monitoring-system"