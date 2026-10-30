# memorizeNetworkSpecialist

GitHub Pages 向けの公開ファイルは `docs/` に置く。トップページは `docs/index.html`、1問1答は `docs/quiz/index.html`。公開設定では `main` ブランチの `/docs` を選ぶ。

1問1答の原稿は [`一問一答問題集.md`](一問一答問題集.md) に置く。問題を編集したら、リポジトリ直下で `python build_quiz.py` を実行し、生成される `docs/quiz/questions.json` も一緒にコミットする。ビルド時に問題ID、重複、学習ページへのリンクを検査する。

ローカル確認は `python -m http.server 8765 --directory docs` を実行し、`http://localhost:8765/quiz/` を開く。回答入力や出題状況はブラウザに保存しない。
