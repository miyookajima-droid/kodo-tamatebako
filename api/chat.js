// ============================================================
//  api/chat.js  ── APIキーを隠す中継（Vercel サーバーレス関数）
//
//  ブラウザはこの関数を呼ぶ。この関数だけがAPIキーを持ち、
//  Anthropicを呼んで、結果だけをブラウザに返す。
//  キーは process.env.ANTHROPIC_API_KEY から読む（コードに書かない）。
//  → Vercelの「環境変数」に登録する（手順書 参照）。
// ============================================================

export default async function handler(req, res) {
  // ブラウザからのPOST以外は受け付けない
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "no_api_key", detail: "サーバーにAPIキーが設定されていません。" });
    return;
  }

  try {
    const { system, messages, max_tokens } = req.body || {};

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        // ← 使うモデルはここで固定。あとで変えるときはこの一行だけ。
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 1000,
        system,
        messages,
      }),
    });

    if (!upstream.ok) {
      // 利用枠切れ（レート上限）は 429 / 529。ブラウザ側で優しく扱えるよう印をつける
      const quota = upstream.status === 429 || upstream.status === 529;
      res.status(upstream.status).json({ error: "upstream", quota });
      return;
    }

    const data = await upstream.json();
    const text = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "server_error" });
  }
}
