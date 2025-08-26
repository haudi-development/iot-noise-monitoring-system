# GitHub リポジトリのセットアップ手順

現在、ローカルリポジトリの準備は完了しています。GitHubにプッシュするには以下の手順を実行してください。

## 方法1: GitHub Personal Access Token を使用する場合

### 1. GitHub Personal Access Token の作成

1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" をクリック
4. 以下の権限を選択:
   - `repo` (Full control of private repositories)
5. トークンを生成してコピー

### 2. プッシュコマンドの実行

```bash
# ユーザー名とトークンを使用してプッシュ
git push -u origin main
```

プロンプトが表示されたら:
- Username: `haudi-development`
- Password: `<作成したPersonal Access Token>`

## 方法2: GitHub.com で直接リポジトリを作成する場合

### 1. GitHubでリポジトリ作成

1. https://github.com/new にアクセス
2. 以下の情報を入力:
   - Repository name: `iot-noise-monitoring-system`
   - Description: `ALSOK IoT騒音監視システム Web管理画面`
   - Public/Private を選択
   - **重要**: 「Initialize this repository with:」のチェックは全て外す

### 2. 作成後、以下のコマンドを実行

```bash
# 既に設定済みのリモートリポジトリにプッシュ
git push -u origin main
```

## 方法3: SSHキーを使用する場合

### 1. SSHキーの生成（既にある場合はスキップ）

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### 2. 公開鍵をGitHubに追加

```bash
# 公開鍵をコピー
cat ~/.ssh/id_ed25519.pub
```

GitHubのSettings → SSH and GPG keys → New SSH keyに追加

### 3. リモートURLをSSHに変更

```bash
git remote set-url origin git@github.com:haudi-development/iot-noise-monitoring-system.git
git push -u origin main
```

## 現在のGitリポジトリの状態

✅ **完了済み:**
- ローカルリポジトリの初期化
- すべてのファイルのコミット
- リモートリポジトリのURL設定（HTTPS）
- メインブランチの設定

⏳ **待機中:**
- GitHubへのプッシュ（認証が必要）

## トラブルシューティング

もしエラーが発生した場合:

1. リポジトリが既に存在する場合:
```bash
git push -f origin main  # 強制プッシュ（注意して使用）
```

2. 認証エラーの場合:
```bash
# 認証情報をリセット
git config --global --unset credential.helper
```

3. プッシュ後の確認:
```bash
git log --oneline -5  # 最新5件のコミットを確認
git remote show origin  # リモート情報を確認
```