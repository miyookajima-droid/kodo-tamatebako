import React, { useState, useRef, useEffect } from "react";

// ============================================================
//  怒りのレギュレーション ── セルフ・エクササイズ（プロトタイプ）
//  Miyo Okajima@BTCセンター
//  ※ これは設計①「怒りのレギュレーション」を、実際に対話が動く
//    プロトタイプにしたもの。決済・複数プロファイル・本番認証は
//    含まない（それらはデプロイ後に器で実装する部分）。
// ============================================================

const C = {
  bg: "#F4F7F5",
  card: "#FFFFFF",
  green: "#2E7D5B",
  greenSoft: "#F1F6F3",
  ink: "#1A1A1A",
  sub: "#5A6B62",
  line: "#DCE5DF",
  lemon: "#C79A3B",
  userBubble: "#2E7D5B",
  botBubble: "#F1F6F3",
};

const TURN_LIMIT = 30; // 利用者の発話の上限（設計どおり）

// --- 怒りのエクササイズの臨床設計をそのままシステムプロンプトに ---
const SYSTEM_PROMPT = `あなたは「怒りのレギュレーション」というセルフ・エクササイズの案内役です。臨床家 岡嶋美代 の設計に従います。目的は、怒りを消すことでも、許させることでも、正しさを裁定することでもありません。時間とともに本来なら下がるはずの怒りが、反芻と「理不尽さの主張」で再燃し、その人自身を苛んでいる——その循環から距離を取れるよう、静かに誘うことです。

【通奏コード（どの瞬間も守る関わりの色）】
- 許しを勧めない。和解・関係修復・「相手にも事情が」へ誘導しない。怒りは許しの対義語ではない。
- 怒りは時間とともに下がるものとして扱う。今の点数は下がる途中の一点にすぎない。
- 手放せる時期に来ているかを丁寧に聞く。押して距離を取らせるのではなく、丁寧に聞くことそのものが距離を生む。
- 自分を守る方向へ傾いた言葉（疲れた・離れたい・もういい・自分を大事にしたい）は、すべて是認する。正しさの主張は是認しない（怒りを再燃させるため）。
- 「大丈夫」を使わない。安心させて過覚醒を鎮めようとしない。少し足りないくらいの安心で留める。悪いことは起こってから考える。
- 過覚醒の怒りを論破せず、拮抗する低覚醒のポジティブ感情（穏やかさ・まったり感・思いやり）へ、イメージによって静かに移す。
- 一度に質問は一つだけ。発話は短く2〜4文。相手にどんどん語ってもらう。長く説明しない。

【是認がソロを取る局面】
利用者が「離れたい」「もう疲れた」「自分を大事にしたい」と、自分を守る方へ一歩傾けた瞬間には、次の手順へ進める前に、まず是認だけを返す。例:「離れたいと思うほど、あなたはもう十分すぎるほど耐えてきたのですね。」受け止めてから、次へ。

【進め方（この順で、ただし相手のペースを追い越さない）】
1. はじめに: 今の怒りは0〜10で何点か尋ねる。「終わりたいときは『今日はここまで』と言ってください」と伝える。
2. 取り消せない行動の保留: 怒りは否定せず、取り消せない行動（送信・発言）だけを下書き・保留にとどめてもらう。「怒りをなくす必要はありません。まず、取り消せない行動だけ保留しましょう。」
3. 安全確認（受け止めを伴う）: 怒りが他害・自傷・被害に転じかけていないかを、詰問でなく受け止めの聞き返しの形で一度だけ確かめる。危険がありそうなら、応酬せず離れる・距離を保つことを優先する。安全か危険かを断定せず「いま少し離れていられるか」を確かめる。「大丈夫」で締めない。
4. 中心プロセス（過覚醒→低覚醒への移行）: 怒りが少し下がった気配を一緒に確かめ、穏やかさ・まったり感・思いやりが今わずかにでもどこにあるかを丁寧に聞く。その穏やかさに結びつくイメージ（過去にそう感じられた場面、そうありたい自分）を引き出し、ふくらませる。怒りを消して置き換えるのではなく、怒りが薄まり穏やかさがにじみ出る移行として扱う。
5. 要約と価値への接続: 穏やかさへ向かう気配をにじませて返す。「あなたはもう手放せる方へ向かい始めている／自分を守る方へ一歩傾いた」という方向づけで、締めても、なお開いたまま閉じる。

【してはいけないこと】
- 許し・和解を勧める。正しさを裁定して「あなたは正しい／相手が悪い」と加担し怒りを再燃させる。利用者より先に距離を取れと急かす。自分を守る方向の言葉を素通りする。「大丈夫」で安心を完成させる。
- 自分や他人を実際に傷つける計画・切迫した危険が語られたら、エクササイズを中断し、短くあたたかく、専門の支援（担当の治療者・地域の相談窓口・緊急時は救急）につなぐよう伝える。詳細を聞き出さない。

日本語で、静かで、あたたかく。相手の言葉を短く受け止めてから、次の一歩を一つだけ差し出してください。`;

const SUMMARY_PROMPT = `これまでの対話を、利用者本人が後で読み返すための短い記録にまとめてください。以下の見出しで、各1〜2行、日本語で。誇張や解釈を加えず、本人が語ったことに沿って。
- 今日の怒り（開始時の点数と、終わりごろの気配）
- 保留できたこと（取り消せない行動を保留できたか）
- にじみ出た穏やかさ（引き出せた穏やかなイメージがあれば）
- 手放しへ向かう一歩（自分を守る方向へ傾いた言葉）
最後に一文、本人をねぎらう言葉を添えてください。`;

async function callClaude(messages, system) {
  // 自分のサーバー（/api/chat）を呼ぶ。APIキーはサーバー側だけが持つ。
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, max_tokens: 1000 }),
  });
  if (!res.ok) {
    let quota = false;
    try { const j = await res.json(); quota = !!j.quota; } catch (_) {}
    const err = new Error("api");
    err.quota = quota;
    throw err;
  }
  const data = await res.json();
  return (data.text || "").trim();
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [ended, setEnded] = useState(false);
  const [summary, setSummary] = useState("");
  const [confirmEnd, setConfirmEnd] = useState(false); // 終了確認の表示
  const [listening, setListening] = useState(false);   // 音声入力中
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const turnsLeft = Math.max(0, TURN_LIMIT - userTurns);
  const progress = Math.min(1, userTurns / TURN_LIMIT);
  const pace =
    turnsLeft <= 3 ? { label: "そろそろ終わりに近づいています", color: C.lemon }
    : turnsLeft <= 8 ? { label: "後半に入りました", color: C.green }
    : { label: "ゆっくりどうぞ", color: C.sub };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, summary]);

  async function begin() {
    setStarted(true);
    setBusy(true);
    try {
      const first = await callClaude(
        [{ role: "user", content: "（セッションを始めてください。あなたから、やさしく話しかけてください。）" }],
        SYSTEM_PROMPT
      );
      setMessages([{ role: "assistant", content: first }]);
    } catch (e) {
      setMessages([{ role: "assistant", content: e.quota
        ? "いま少し混み合っているようです。少し時間をおいて、もう一度始めてください。"
        : "うまく始められませんでした。もう一度試してください。" }]);
    }
    setBusy(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || busy || ended) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    // ターン上限に達したら、運営メモを添えて穏やかに締めへ向かわせる
    const reachedLimit = next.filter((m) => m.role === "user").length >= TURN_LIMIT;
    const sys = reachedLimit
      ? SYSTEM_PROMPT + "\n\n【運営メモ】そろそろ時間です。新しい問いを重ねず、いまの穏やかさをひとこと差し戻し、要約と価値への接続で、静かに今日を閉じてください。"
      : SYSTEM_PROMPT;

    try {
      const reply = await callClaude(
        next.map((m) => ({ role: m.role, content: m.content })),
        sys
      );
      setMessages([...next, { role: "assistant", content: reply }]);
      if (reachedLimit) setNotice("今日のセッションは、そろそろ区切りのようです。下の「今日はここまでにする」で、記録を残せます。");
    } catch (e) {
      setMessages([...next, { role: "assistant", content: e.quota
        ? "いま少し混み合っているようです。少し待って、もう一度送ってください。"
        : "うまく届きませんでした。もう一度送ってください。" }]);
    }
    setBusy(false);
  }

  // 音声入力（ブラウザ側で文字にする。Anthropicのトークンは使わない）
  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("このブラウザは音声入力に対応していません。スマホのキーボードのマイクからも、しゃべって入力できます。");
      return;
    }
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "ja-JP";
    rec.interimResults = true;
    rec.continuous = true;
    let base = input;
    rec.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setInput((base + text).slice(0, 2000));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  async function finish() {
    if (busy) return;
    setBusy(true);
    try {
      const s = await callClaude(
        [...messages.map((m) => ({ role: m.role, content: m.content })),
         { role: "user", content: SUMMARY_PROMPT }],
        SYSTEM_PROMPT
      );
      setSummary(s);
      // 記録の永続化（プロファイル単位の記録の、プロトタイプ版）
      try {
        const key = "anger:last-summary";
        await window.storage?.set(key, JSON.stringify({ at: Date.now(), summary: s }), false);
      } catch (_) {}
    } catch (e) {
      setSummary("（今日の記録の作成がうまくいきませんでした。それでも、ここまで取り組めたことは、確かにあなたの中に残っています。）");
    }
    setEnded(true);
    setBusy(false);
  }

  // ---------- 開始画面 ----------
  if (!started) {
    return (
      <div style={wrap}>
        <div style={{ ...card, textAlign: "center", maxWidth: 460 }}>
          <div style={{ fontSize: 13, color: C.green, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>行動の玉手箱</div>
          <h1 style={{ fontSize: 22, color: C.ink, margin: "0 0 6px", fontWeight: 800, lineHeight: 1.5 }}>ぐるぐる思考からの脱出、<br />一人でできるもん！</h1>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 18 }}>認知行動療法にもとづくセルフケア・アプリ</div>
          <div style={{ height: 1, background: C.line, margin: "0 auto 18px", width: 60 }} />
          <div style={{ fontSize: 14, color: C.green, fontWeight: 700, marginBottom: 8 }}>今日の道具：怒りのレギュレーション</div>
          <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.9, margin: "0 0 8px" }}>
            怒りを、なくすための時間ではありません。<br />
            取り消せないことだけ、そっと保留して、<br />
            怒りにあなた自身が傷つけられないように。
          </p>
          <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.8, margin: "18px 0 22px", background: C.greenSoft, borderRadius: 12, padding: "12px 14px" }}>
            これは治療ではなく、練習です。いつでも「今日はここまで」と言えば終われます。強い危険を感じているときは、ひとりで抱えず、身近な相談先や緊急の窓口を頼ってください。
          </p>
          <button onClick={begin} style={primaryBtn}>はじめる</button>
          <div style={{ fontSize: 11, color: C.sub, marginTop: 18 }}>Miyo Okajima@BTCセンター</div>
        </div>
      </div>
    );
  }

  // ---------- 対話画面 ----------
  return (
    <div style={wrap}>
      <div style={{ ...card, maxWidth: 560, width: "100%", padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "82vh" }}>
        {/* ヘッダー */}
        <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 10.5, color: C.green, fontWeight: 700, letterSpacing: 0.5 }}>行動の玉手箱</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, marginTop: 2 }}>怒りのレギュレーション</div>
          {/* 穏やかな進み具合の帯 */}
          {!ended && (
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 5, background: C.line, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ width: `${progress * 100}%`, height: "100%", background: pace.color, borderRadius: 999, transition: "width .5s ease" }} />
              </div>
              <div style={{ fontSize: 10.5, color: pace.color, textAlign: "right", marginTop: 4, fontWeight: 500 }}>{pace.label}</div>
            </div>
          )}
        </div>

        {/* メッセージ */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "18px", background: C.bg }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
              <div style={{
                maxWidth: "82%", padding: "10px 14px", borderRadius: 16, fontSize: 14.5, lineHeight: 1.75,
                whiteSpace: "pre-wrap",
                background: m.role === "user" ? C.userBubble : C.botBubble,
                color: m.role === "user" ? "#fff" : C.ink,
                borderBottomRightRadius: m.role === "user" ? 4 : 16,
                borderBottomLeftRadius: m.role === "user" ? 16 : 4,
              }}>{m.content}</div>
            </div>
          ))}
          {busy && !ended && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 16px", borderRadius: 16, background: C.botBubble, color: C.sub, fontSize: 14 }}>…</div>
            </div>
          )}
          {summary && (
            <div style={{ marginTop: 8, padding: "16px 16px", borderRadius: 14, background: "#fff", border: `1px solid ${C.line}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8 }}>今日の記録</div>
              <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{summary}</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                ※ プロトタイプでは、この記録はこの端末にのみ保存されます。本番の器では、あなたのプロファイルに残ります。
              </div>
            </div>
          )}
        </div>

        {/* 入力 / 締め */}
        {!ended ? (
          <div style={{ borderTop: `1px solid ${C.line}`, padding: 12, background: "#fff" }}>
            {notice && <div style={{ fontSize: 12, color: C.lemon, marginBottom: 8, lineHeight: 1.6 }}>{notice}</div>}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
                placeholder="いま感じていることを、そのまま…（改行できます）"
                rows={3}
                style={{ flex: 1, resize: "vertical", border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", fontSize: 15, fontFamily: "inherit", outline: "none", lineHeight: 1.7, minHeight: 78, maxHeight: 200 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* マイク（音声入力・トークン不要） */}
                <button
                  onClick={toggleVoice}
                  disabled={busy}
                  title="音声で入力"
                  style={{
                    width: 46, height: 46, borderRadius: 12, cursor: "pointer",
                    border: `1px solid ${listening ? C.green : C.line}`,
                    background: listening ? C.green : "#fff",
                    color: listening ? "#fff" : C.sub,
                    fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >{listening ? "■" : "🎤"}</button>
                <button onClick={send} disabled={busy || !input.trim()} style={{ ...primaryBtn, width: 46, height: 46, padding: 0, opacity: busy || !input.trim() ? 0.5 : 1 }}>➤</button>
              </div>
            </div>
            {listening && <div style={{ fontSize: 11.5, color: C.green, marginTop: 6 }}>聞いています…　もう一度マイクを押すと止まります。</div>}
            <div style={{ fontSize: 10.5, color: C.sub, marginTop: 6 }}>スマホは、キーボードのマイクからも話しかけられます。</div>

            {/* 終了は確認を挟む（押し間違い防止） */}
            {!confirmEnd ? (
              <button onClick={() => setConfirmEnd(true)} disabled={busy} style={endBtn}>今日はここまでにする</button>
            ) : (
              <div style={{ marginTop: 10, padding: "10px 12px", border: `1px solid ${C.line}`, borderRadius: 12, background: C.greenSoft }}>
                <div style={{ fontSize: 12.5, color: C.ink, marginBottom: 8 }}>今日はここまでにして、記録を残しますか？</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={finish} disabled={busy} style={{ ...primaryBtn, flex: 1, padding: "9px", fontSize: 13 }}>はい、終わる</button>
                  <button onClick={() => setConfirmEnd(false)} disabled={busy} style={{ ...endBtn, flex: 1, marginTop: 0 }}>まだ続ける</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ borderTop: `1px solid ${C.line}`, padding: 16, background: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.8, marginBottom: 6 }}>今日はここまで。<br />怒りが残っていても、この練習は成立しています。</div>
            <div style={{ fontSize: 11.5, color: C.sub }}>また、あなたのペースで。</div>
          </div>
        )}
      </div>
    </div>
  );
}

const wrap = { minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Hiragino Sans','Yu Gothic',sans-serif" };
const card = { background: C.card, borderRadius: 20, padding: 28, boxShadow: "0 4px 24px rgba(46,125,91,0.10)" };
const primaryBtn = { background: C.green, color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" };
const endBtn = { width: "100%", marginTop: 10, background: "transparent", color: C.sub, border: `1px solid ${C.line}`, borderRadius: 12, padding: "9px", fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" };
