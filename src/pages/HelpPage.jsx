import { useState } from 'react';
import Icon from '../components/Icon';

// ── スタイル ──────────────────────────────────────────────────────

const card = {
  background: 'var(--card-bg)',
  borderRadius: 16,
  padding: '20px 18px',
};

const sectionTitle = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const featureCard = (color) => ({
  background: 'var(--card-bg)',
  borderRadius: 14,
  padding: '16px 16px',
  borderLeft: `3px solid ${color}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const featureTitle = {
  fontSize: 15,
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

const tag = (color) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  background: color + '20',
  color: color,
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
  borderRadius: 5,
  background: 'var(--accent)',
  marginTop: 7,
};

// ── FAQ アイテム ──────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: 12,
      background: 'var(--card-bg)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left',
          padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-1)', lineHeight: 1.5 }}>{q}</span>
        <Icon
          name="chevron"
          size={16} stroke={2}
          style={{
            flexShrink: 0,
            color: 'var(--ink-3)',
            transform: open ? 'rotate(270deg)' : 'rotate(90deg)',
            transition: 'transform .2s',
          }}
        />
      </button>
      {open && (
        <div style={{
          padding: '0 16px 14px',
          fontSize: 13,
          color: 'var(--ink-2)',
          lineHeight: 1.75,
          borderTop: '1px solid var(--line)',
          paddingTop: 12,
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ── メインページ ──────────────────────────────────────────────────

export default function HelpPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ヒーロー */}
      <div style={{
        ...card,
        background: 'linear-gradient(135deg, var(--accent) 0%, #6c63ff 100%)',
        color: '#fff',
        borderRadius: 16,
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>宅建学習管理アプリ</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.7, opacity: 0.92 }}>
          2026年宅地建物取引士試験の合格を目指す学習をサポートするアプリです。<br />
          タスク管理・復習・ミス記録・スケジュール自動生成・クラウド同期が一体化しています。
        </div>
      </div>

      {/* 各ページ機能説明 */}
      <div>
        <div style={sectionTitle}>
          <Icon name="map" size={20} stroke={1.8} />
          各ページの説明
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          <div style={featureCard('var(--accent)')}>
            <div style={featureTitle}>
              <Icon name="home" size={18} stroke={1.8} style={{ color: 'var(--accent)' }} />
              ホーム
            </div>
            <div style={featureDesc}>
              今日やるべきタスクの一覧と試験カウントダウンを表示します。
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
              {[
                '「＋ 記録する」ボタンでタスク・学習ログ・ミスを追加',
                '各タスクの○をタップで完了/未完了を切り替え',
                '前日までの未完了タスクは翌日に自動で持ち越し',
                '試験直前イベント（申込・受験票確認など）を自動表示',
              ].map((t, i) => (
                <div key={i} style={li}><div style={dot} /><span>{t}</span></div>
              ))}
            </div>
          </div>

          <div style={featureCard('#10b981')}>
            <div style={featureTitle}>
              <Icon name="map" size={18} stroke={1.8} style={{ color: '#10b981' }} />
              論点マップ
            </div>
            <div style={featureDesc}>
              4科目（宅建業法・権利関係・法令上の制限・税その他）のトピック別に理解度を管理します。
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
              {[
                'トピックごとに理解度（未学習〜完璧）を5段階で記録',
                '苦手な論点を素早く特定できる',
                'ホームの「苦手論点」ウィジェットに自動反映',
              ].map((t, i) => (
                <div key={i} style={li}><div style={dot} /><span>{t}</span></div>
              ))}
            </div>
          </div>

          <div style={featureCard('#f59e0b')}>
            <div style={featureTitle}>
              <Icon name="review" size={18} stroke={1.8} style={{ color: '#f59e0b' }} />
              復習
            </div>
            <div style={featureDesc}>
              間隔反復法に基づいた復習システムです。次に復習すべき問題を自動で提示します。
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
              {[
                '問題に正解/不正解を記録すると次回の復習日が自動計算',
                '期限切れの復習アイテムから優先して表示',
                'ホームの「今日の復習」バッジに件数を反映',
              ].map((t, i) => (
                <div key={i} style={li}><div style={dot} /><span>{t}</span></div>
              ))}
            </div>
          </div>

          <div style={featureCard('#ef4444')}>
            <div style={featureTitle}>
              <Icon name="mistake" size={18} stroke={1.8} style={{ color: '#ef4444' }} />
              ミス記録
            </div>
            <div style={featureDesc}>
              間違えた問題・理解が曖昧な箇所をメモして「間違いノート」として活用します。
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 2 }}>
              {[
                '科目・重要度・メモを記録',
                '「解決済み」マークで進捗管理',
                'ホームから「＋ 記録する」→「ミスを記録」でも追加可能',
              ].map((t, i) => (
                <div key={i} style={li}><div style={dot} /><span>{t}</span></div>
              ))}
            </div>
          </div>

          <div style={featureCard('#8b5cf6')}>
            <div style={featureTitle}>
              <Icon name="analysis" size={18} stroke={1.8} style={{ color: '#8b5cf6' }} />
              分析
            </div>
            <div style={featureDesc}>
              学習記録を集計して、科目別の進捗・弱点・学習量の推移をグラフで確認できます。
            </div>
          </div>

          <div style={featureCard('#0ea5e9')}>
            <div style={featureTitle}>
              <Icon name="book" size={18} stroke={1.8} style={{ color: '#0ea5e9' }} />
              教材
            </div>
            <div style={featureDesc}>
              テキスト・問題集などの教材の学習進捗（ページ数・単元）を記録・管理します。
            </div>
          </div>

          <div style={featureCard('#64748b')}>
            <div style={featureTitle}>
              <Icon name="library" size={18} stroke={1.8} style={{ color: '#64748b' }} />
              リソース
            </div>
            <div style={featureDesc}>
              参考サイト・動画・PDF などの学習リソースをブックマークして管理します。
            </div>
          </div>

        </div>
      </div>

      {/* 学習スケジュール */}
      <div>
        <div style={sectionTitle}>
          <Icon name="calendar" size={20} stroke={1.8} />
          学習スケジュール
        </div>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>
            設定ページの「学習スケジュール」セクションからタスクを自動生成できます。<br />
            2026年6月1日〜10月18日（本試験日）の毎日のタスクが一括で作成されます。
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { phase: 'Phase 1（6月）', label: '基礎導入', desc: '新規学習→即演習。宅建業法を中心に基礎を固める', color: '#10b981' },
              { phase: 'Phase 2（7月）', label: '基礎演習', desc: '問題演習メイン→次トピックの新規学習へ', color: '#0ea5e9' },
              { phase: 'Phase 3（8月）', label: '論点強化', desc: '論点別過去問を繰り返し、苦手を潰す', color: '#f59e0b' },
              { phase: 'Phase 4（9月）', label: '模試演習', desc: '年度別過去問・模試で本番形式に慣れる', color: '#ef4444' },
              { phase: 'Phase 5（10月）', label: '最終復習', desc: '間違いノート・暗記確認で知識を総仕上げ', color: '#8b5cf6' },
            ].map(({ phase, label, desc, color }) => (
              <div key={phase} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={tag(color)}>{phase}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            padding: '10px 12px', background: 'var(--chip-neutral-bg)',
            borderRadius: 10, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6,
          }}>
            💡 手動で追加したタスクや完了済みタスクは再生成しても上書きされません。
          </div>
        </div>
      </div>

      {/* クラウド同期 */}
      <div>
        <div style={sectionTitle}>
          <Icon name="spark" size={20} stroke={1.8} />
          クラウド同期
        </div>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>
            設定ページの「クラウド同期」から Google アカウントでログインすると、学習データが自動的にクラウドに保存されます。
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              'ログイン後はデータ変更から約2.5秒後に自動保存',
              'スマホ・PC・タブレットで同じデータを共有',
              '「今すぐ保存」で即時保存、「クラウドから読み込む」で他端末のデータを取得',
              'ログアウトしてもローカルデータは消えません',
            ].map((t, i) => (
              <div key={i} style={li}><div style={dot} /><span>{t}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div style={sectionTitle}>
          <Icon name="help" size={20} stroke={1.8} />
          よくある質問
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            {
              q: 'データが消えてしまいました',
              a: 'このアプリはブラウザのlocalStorageにデータを保存しています。ブラウザのキャッシュ・履歴を削除したり、プライベートモードで使用するとデータが失われます。設定ページの「JSONを書き出す」で定期的にバックアップを取ることをお勧めします。クラウド同期を有効にすると、自動で保存されます。',
            },
            {
              q: '別のスマホ・PCでも同じデータを使いたい',
              a: '設定ページ →「クラウド同期」→「Googleでログイン」を行ってください。同じGoogleアカウントでログインすることで、複数端末でデータを共有できます。',
            },
            {
              q: 'タスクを間違えて完了にしてしまった',
              a: 'ホームページのタスク一覧で、完了済みのタスクをもう一度タップすると未完了に戻せます。',
            },
            {
              q: '学習スケジュールを再生成すると、今までのタスクはどうなりますか？',
              a: '手動で追加したタスク・完了済みタスクは削除されません。同じ日付・同じタイトルのタスクは重複して作成されないため、何度再生成しても安全です。',
            },
            {
              q: 'アプリをホーム画面に追加したい（スマホ）',
              a: 'Safari でアプリを開き、画面下の共有ボタン（□↑）→「ホーム画面に追加」をタップしてください。アプリのように使えるようになります。',
            },
            {
              q: 'JSONバックアップはどうやって復元しますか？',
              a: '設定ページ →「データバックアップ」→「JSONを読み込む」から、以前書き出したバックアップファイルを選択してください。現在のデータが上書きされるので確認ダイアログが表示されます。',
            },
          ].map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      {/* バージョン */}
      <div style={{
        textAlign: 'center', fontSize: 12, color: 'var(--ink-4)',
        padding: '8px 0 16px',
      }}>
        宅建学習管理アプリ v1.0.0 &nbsp;·&nbsp; 2026年度 宅地建物取引士
      </div>

    </div>
  );
}
