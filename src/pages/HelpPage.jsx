import { useState } from 'react';
import Icon from '../components/Icon';

// ── スタイル ──────────────────────────────────────────────────────

const card = {
  background: 'var(--card-bg)',
  borderRadius: 16,
  padding: '20px 18px',
};

const sectionTitle = {
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 12,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: 'var(--ink-1)',
};

const featureCard = (color) => ({
  background: 'var(--card-bg)',
  borderRadius: 14,
  padding: '14px 16px',
  borderLeft: `3px solid ${color}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const featureTitle = {
  fontSize: 14,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const featureDesc = {
  fontSize: 13,
  color: 'var(--ink-2)',
  lineHeight: 1.7,
};

const chip = (color) => ({
  display: 'inline-block',
  padding: '2px 9px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  background: color + '22',
  color: color,
  flexShrink: 0,
});

const li = {
  fontSize: 13,
  color: 'var(--ink-2)',
  lineHeight: 1.7,
  display: 'flex',
  gap: 8,
  alignItems: 'flex-start',
};

const dot = {
  flexShrink: 0,
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: 'var(--accent)',
  marginTop: 7,
};

function Bullets({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((t, i) => (
        <div key={i} style={li}><div style={dot} /><span>{t}</span></div>
      ))}
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 12, background: 'var(--card-bg)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '13px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-1)', lineHeight: 1.5 }}>{q}</span>
        <Icon name="chevron" size={16} stroke={2} style={{
          flexShrink: 0, color: 'var(--ink-3)',
          transform: open ? 'rotate(270deg)' : 'rotate(90deg)',
          transition: 'transform .2s',
        }} />
      </button>
      {open && (
        <div style={{
          padding: '0 16px 14px', paddingTop: 12,
          fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.75,
          borderTop: '1px solid var(--line)',
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ── ページ ────────────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ヒーロー */}
      <div style={{
        ...card,
        background: 'linear-gradient(135deg, var(--accent) 0%, #6c63ff 100%)',
        color: '#fff',
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>宅建学習管理アプリ ガイド</div>
        <div style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.92 }}>
          2026年宅地建物取引士試験の合格をサポートするアプリです。<br />
          タスク管理・復習・ミス記録・スケジュール自動生成・クラウド同期がひとつにまとまっています。
        </div>
      </div>

      {/* はじめかた */}
      <div>
        <div style={sectionTitle}>
          <Icon name="spark" size={18} stroke={1.8} />
          はじめかた
        </div>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { step: '1', label: 'スケジュールを生成する', desc: '設定 →「学習スケジュール」→「6/1〜試験日までの学習タスクを生成」を押す。6月から本試験日まで毎日のタスクが自動で作成されます。' },
            { step: '2', label: 'ホームで今日のタスクをこなす', desc: 'ホームページに今日やるべきタスクが一覧で表示されます。終わったら○をタップして完了にしましょう。' },
            { step: '3', label: '間違えた問題をミスに記録する', desc: '解いていて間違えた問題や曖昧な箇所は「ミス」ページに記録。間違いノートとして活用できます。' },
            { step: '4', label: 'クラウド同期でどこでも続ける', desc: '設定 →「クラウド同期」→「Googleでログイン」。スマホ・PCで同じデータを自動共有できます。' },
          ].map(({ step, label, desc }) => (
            <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0, width: 26, height: 26, borderRadius: 26,
                background: 'var(--accent)', color: '#fff',
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{step}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.65 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 各ページの説明 */}
      <div>
        <div style={sectionTitle}>
          <Icon name="map" size={18} stroke={1.8} />
          各ページの説明
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          <div style={featureCard('var(--accent)')}>
            <div style={featureTitle}>
              <Icon name="home" size={17} stroke={1.8} style={{ color: 'var(--accent)' }} />
              ホーム
            </div>
            <div style={featureDesc}>今日のタスク・試験までのカウントダウン・重要イベントをまとめて確認できます。</div>
            <Bullets items={[
              '「＋ 記録する」でタスク追加・学習ログ記録・ミス記録が行えます',
              'タスクの○をタップして完了/未完了を切り替え',
              '前日までの未完了タスクは翌日に自動で持ち越されます',
              '申込・受験票確認など試験関連イベントも自動で表示されます',
            ]} />
          </div>

          <div style={featureCard('#10b981')}>
            <div style={featureTitle}>
              <Icon name="map" size={17} stroke={1.8} style={{ color: '#10b981' }} />
              論点マップ
            </div>
            <div style={featureDesc}>4科目のトピック別に理解度を管理します。どこが弱いか一目でわかります。</div>
            <Bullets items={[
              '理解度を5段階（未学習〜完璧）で記録',
              'ホームの「苦手論点」ウィジェットに自動で反映',
            ]} />
          </div>

          <div style={featureCard('#f59e0b')}>
            <div style={featureTitle}>
              <Icon name="review" size={17} stroke={1.8} style={{ color: '#f59e0b' }} />
              復習
            </div>
            <div style={featureDesc}>間隔反復法に基づいた復習システムです。正解・不正解を記録すると次回の復習日が自動計算されます。</div>
            <Bullets items={[
              '期限切れの復習アイテムから優先して表示',
              'ホームの「今日の復習」に件数が反映されます',
            ]} />
          </div>

          <div style={featureCard('#ef4444')}>
            <div style={featureTitle}>
              <Icon name="mistake" size={17} stroke={1.8} style={{ color: '#ef4444' }} />
              ミス記録
            </div>
            <div style={featureDesc}>間違えた問題・曖昧な箇所をメモする間違いノートです。科目・重要度・メモを記録できます。</div>
            <Bullets items={[
              '「解決済み」マークで進捗管理ができます',
              'ホームから「＋ 記録する」→「ミスを記録」でも追加可能',
            ]} />
          </div>

          <div style={featureCard('#8b5cf6')}>
            <div style={featureTitle}>
              <Icon name="analysis" size={17} stroke={1.8} style={{ color: '#8b5cf6' }} />
              分析
            </div>
            <div style={featureDesc}>科目別の進捗・弱点・学習量の推移をグラフで確認できます。</div>
          </div>

          <div style={featureCard('#0ea5e9')}>
            <div style={featureTitle}>
              <Icon name="book" size={17} stroke={1.8} style={{ color: '#0ea5e9' }} />
              教材
            </div>
            <div style={featureDesc}>テキスト・問題集などの学習進捗（ページ数・単元）を記録・管理します。</div>
          </div>

          <div style={featureCard('#64748b')}>
            <div style={featureTitle}>
              <Icon name="library" size={17} stroke={1.8} style={{ color: '#64748b' }} />
              リソース
            </div>
            <div style={featureDesc}>参考サイト・動画・PDFなどの学習リソースをブックマークして管理します。</div>
          </div>

        </div>
      </div>

      {/* 学習スケジュール */}
      <div>
        <div style={sectionTitle}>
          <Icon name="calendar" size={18} stroke={1.8} />
          学習スケジュール
        </div>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.75 }}>
            設定ページから2026年6月〜10月18日（本試験日）の毎日のタスクを一括生成できます。
            フェーズごとに学習内容が自動で切り替わります。
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { phase: 'Phase 1（6月）', label: '基礎導入', desc: '新規学習→即演習。宅建業法中心に基礎を固める', color: '#10b981' },
              { phase: 'Phase 2（7月）', label: '基礎演習', desc: '問題演習メイン。次トピックの新規学習も並行', color: '#0ea5e9' },
              { phase: 'Phase 3（8月）', label: '論点強化', desc: '論点別過去問を繰り返し、苦手を集中的に潰す', color: '#f59e0b' },
              { phase: 'Phase 4（9月）', label: '模試演習', desc: '年度別過去問・模試で本番形式に慣れる', color: '#ef4444' },
              { phase: 'Phase 5（10月）', label: '最終復習', desc: '間違いノート・暗記確認で知識を総仕上げ', color: '#8b5cf6' },
            ].map(({ phase, label, desc, color }) => (
              <div key={phase} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={chip(color)}>{phase}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            padding: '10px 12px', background: 'var(--chip-neutral-bg)',
            borderRadius: 10, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.65,
          }}>
            💡 手動で追加したタスクや完了済みタスクは再生成しても消えません。
          </div>
        </div>
      </div>

      {/* クラウド同期 */}
      <div>
        <div style={sectionTitle}>
          <Icon name="spark" size={18} stroke={1.8} />
          クラウド同期
        </div>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.75 }}>
            設定ページ →「クラウド同期」→「Googleでログイン」で有効になります。
            ログイン後はデータの保存・読み込みが自動で行われます。
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                icon: 'log', color: '#10b981',
                title: '自動保存',
                desc: 'データを変更すると約2.5秒後に自動でクラウドに保存されます。',
              },
              {
                icon: 'review', color: '#0ea5e9',
                title: '自動読み込み',
                desc: 'アプリを開いたとき・他のタブから戻ったときに、クラウドに新しいデータがあれば自動で読み込まれます。',
              },
              {
                icon: 'spark', color: '#8b5cf6',
                title: 'マルチデバイス対応',
                desc: 'スマホ・PC・タブレットで同じGoogleアカウントでログインするだけでデータが同期されます。',
              },
              {
                icon: 'settings', color: '#64748b',
                title: 'アカウントごとにデータ分離',
                desc: '同じデバイスでも、Googleアカウントを切り替えるとそれぞれのデータに自動で差し替わります。',
              },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Icon name={icon} size={18} stroke={1.8} style={{ color, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '10px 12px', background: 'var(--chip-neutral-bg)',
            borderRadius: 10, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.65,
          }}>
            💡 ログアウトしてもこの端末のデータは消えません。クラウドとの同期が止まるだけです。
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div style={sectionTitle}>
          <Icon name="help" size={18} stroke={1.8} />
          よくある質問
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            {
              q: 'データが消えてしまいました',
              a: 'このアプリはブラウザのlocalStorageにデータを保存しています。ブラウザのキャッシュ削除・プライベートモード・アプリ削除でデータが失われることがあります。設定ページの「JSONを書き出す」で定期的にバックアップを取るか、クラウド同期を有効にしておくと安心です。',
            },
            {
              q: 'スマホとPCでデータを共有したい',
              a: '設定ページ →「クラウド同期」→「Googleでログイン」を両方の端末で行ってください。同じGoogleアカウントでログインするだけで、データが自動的に同期されます。',
            },
            {
              q: 'タスクを間違えて完了にしてしまった',
              a: 'ホームのタスク一覧で、完了済みのタスクをもう一度タップすると未完了に戻せます。',
            },
            {
              q: 'スケジュールを再生成したら今のタスクはどうなりますか？',
              a: '手動で追加したタスク・完了済みのタスクは削除されません。同じ日付・同じタイトルのタスクは重複して作成されない仕組みになっているので、何度再生成しても安全です。',
            },
            {
              q: 'アプリをスマホのホーム画面に追加したい',
              a: 'Safariでアプリを開き、画面下の共有ボタン（□↑）→「ホーム画面に追加」をタップしてください。アプリのように使えるようになります（Android の場合はメニュー →「ホーム画面に追加」）。',
            },
            {
              q: 'JSONバックアップを復元するには？',
              a: '設定ページ →「データバックアップ」→「JSONを読み込む」から、以前書き出したファイルを選択してください。現在のデータが上書きされるため、確認ダイアログが表示されます。',
            },
            {
              q: 'クラウド同期とJSONバックアップの違いは？',
              a: 'クラウド同期はGoogleログイン後に自動で行われ、複数端末での利用に適しています。JSONバックアップは手動でファイルを書き出す方法で、ローカルに保存できるので万一の保険として活用できます。両方使うのが理想的です。',
            },
            {
              q: '同じデバイスで別のGoogleアカウントに切り替えたらどうなりますか？',
              a: 'アカウントを切り替えると、前のアカウントのデータは削除され、新しいアカウントのクラウドデータが自動で読み込まれます。データはGoogleアカウントごとに完全に分離されているので、他のアカウントのデータが混ざることはありません。',
            },
          ].map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      {/* フッター */}
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-4)', padding: '4px 0 16px' }}>
        宅建学習管理アプリ v1.0.0　·　2026年度 宅地建物取引士
      </div>

    </div>
  );
}
