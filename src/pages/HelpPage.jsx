import { useState } from 'react';
import Icon from '../components/Icon';

// ── スタイル ──────────────────────────────────────────────────────

const card = {
  background: 'var(--card-bg)',
  borderRadius: 16,
  padding: '20px 18px',
};

const sectionTitle = {
  fontSize: 17,
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
  fontSize: 15,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const featureDesc = {
  fontSize: 14,
  color: 'var(--ink-2)',
  lineHeight: 1.75,
};

const chip = (color) => ({
  display: 'inline-block',
  padding: '2px 9px',
  borderRadius: 20,
  fontSize: 11.5,
  fontWeight: 600,
  background: color + '22',
  color: color,
  flexShrink: 0,
});

const li = {
  fontSize: 14,
  color: 'var(--ink-2)',
  lineHeight: 1.75,
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
  marginTop: 8,
};

function Bullets({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
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
          width: '100%', textAlign: 'left', padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-1)', lineHeight: 1.5 }}>{q}</span>
        <Icon name="chevron" size={16} stroke={2} style={{
          flexShrink: 0, color: 'var(--ink-3)',
          transform: open ? 'rotate(270deg)' : 'rotate(90deg)',
          transition: 'transform .2s',
        }} />
      </button>
      {open && (
        <div style={{
          padding: '0 16px 14px', paddingTop: 12,
          fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.8,
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
        <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 6 }}>宅建学習管理アプリ ガイド</div>
        <div style={{ fontSize: 14, lineHeight: 1.8, opacity: 0.92 }}>
          宅建をはじめて学ぶ方でも安心。使う教材を選ぶだけで、今日から試験日まで毎日の勉強タスクを自動で作成するアプリです。
        </div>
      </div>

      {/* はじめかた */}
      <div>
        <div style={sectionTitle}>
          <Icon name="spark" size={18} stroke={1.8} />
          はじめかた（4ステップ）
        </div>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            {
              step: '①', color: '#f97316',
              label: '教材を選ぶ',
              desc: '「教材」ページを開き、使っている教科書・問題集・YouTube動画をカタログから選択します。購入済み・購入予定の教材を選んでください。',
            },
            {
              step: '②', color: '#f97316',
              label: 'スケジュールを設定する',
              desc: '「設定」ページで学習開始日を選び「スケジュールを生成する」を押します。開始日から試験日（10/18）まで毎日のタスクが自動で作成されます。',
            },
            {
              step: '③', color: '#f97316',
              label: 'ホームで今日のタスクをこなす',
              desc: 'ホームの「今日の学習」に今日やるタスクが一覧で表示されます。各タスクには参考にすべき教材の章・動画リンクも自動で表示されます。',
            },
            {
              step: '④', color: '#64748b',
              label: 'ミスを記録して弱点を潰す',
              desc: '間違えた問題や曖昧な箇所は「ミス記録」に残しましょう。蓄積されたデータは「分析」ページで弱点として確認できます。',
            },
          ].map(({ step, color, label, desc }) => (
            <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: 28,
                background: color, color: '#fff',
                fontSize: 13, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{step}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          ))}
          <div style={{
            padding: '10px 12px', background: 'var(--chip-neutral-bg)',
            borderRadius: 10, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.7,
          }}>
            💡 ホーム画面のオレンジ色の吹き出し（STEP①〜④）が現在の設定状況に合わせてガイドします。
          </div>
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
              '今日のタスクには「参考にすべき教材の章」や「YouTube動画リンク」が自動で表示されます',
              '新規学習タスク→教科書・動画、問題演習タスク→問題集 のように種別で自動振り分け',
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
            <div style={featureDesc}>4科目（宅建業法・権利関係・法令制限・税その他）のトピック別に理解度を5段階で管理します。</div>
            <Bullets items={[
              '理解度を5段階（未学習〜安定して解ける）で記録',
              'ホームの「苦手論点」ウィジェットと分析ページに自動で反映',
              'ミスを記録すると該当トピックの理解度が自動で下がります',
            ]} />
          </div>

          <div style={featureCard('#f59e0b')}>
            <div style={featureTitle}>
              <Icon name="review" size={17} stroke={1.8} style={{ color: '#f59e0b' }} />
              復習
            </div>
            <div style={featureDesc}>間隔反復法に基づいた復習スケジュール管理です。正解・不正解を記録すると次回の復習日が自動計算されます。</div>
            <Bullets items={[
              '期限切れの復習アイテムから優先して表示',
              'ホームの状況サマリーに復習件数が反映されます',
            ]} />
          </div>

          <div style={featureCard('#ef4444')}>
            <div style={featureTitle}>
              <Icon name="mistake" size={17} stroke={1.8} style={{ color: '#ef4444' }} />
              ミス記録
            </div>
            <div style={featureDesc}>間違えた問題・曖昧な箇所をメモする間違いノートです。科目・重要度・理由・メモを記録できます。</div>
            <Bullets items={[
              '「解決済み」マークで進捗管理ができます',
              'ホームから「＋ 記録する」→「ミスを記録」でも追加可能',
              'ミスの記録が論点マップの理解度に自動反映されます',
            ]} />
          </div>

          <div style={featureCard('#8b5cf6')}>
            <div style={featureTitle}>
              <Icon name="analysis" size={17} stroke={1.8} style={{ color: '#8b5cf6' }} />
              分析
            </div>
            <div style={featureDesc}>科目別の進捗・苦手論点ランキング・ミス理由・復習状況・教材進捗を一覧で確認できます。</div>
            <Bullets items={[
              '全データはリアルタイムで更新されます',
              'リセット後は空の初期状態になります',
            ]} />
          </div>

          <div style={featureCard('#0ea5e9')}>
            <div style={featureTitle}>
              <Icon name="book" size={17} stroke={1.8} style={{ color: '#0ea5e9' }} />
              教材
            </div>
            <div style={featureDesc}>使用する教科書・問題集・YouTube動画などをカタログから選択して登録します。</div>
            <Bullets items={[
              'カタログには「みんなが欲しかった！宅建士」シリーズ・公式過去問・ゆーき大学が収録されています',
              '教科書・問題集は別途ご購入が必要です。アプリには目次のみ入っています',
              '教材をタップして展開するとユニット（章）一覧が確認できます',
              '教材を選び直した場合は設定画面でスケジュールを再生成してください',
            ]} />
          </div>

          <div style={featureCard('#64748b')}>
            <div style={featureTitle}>
              <Icon name="library" size={17} stroke={1.8} style={{ color: '#64748b' }} />
              リソース
            </div>
            <div style={featureDesc}>参考サイト・YouTube・法令ページなどの学習リソースをブックマーク管理できます。初期状態でe-Gov法令・公式YouTube・TAC教材リンクなどが登録されています。</div>
          </div>

        </div>
      </div>

      {/* 学習スケジュール */}
      <div>
        <div style={sectionTitle}>
          <Icon name="calendar" size={18} stroke={1.8} />
          学習スケジュールの仕組み
        </div>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.8 }}>
            設定ページで学習開始日を選んで「生成」を押すと、その日から本試験日（10/18）まで毎日のタスクが自動作成されます。開始日は今日以降であればいつでも自由に設定できます。
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { phase: 'Phase 1', label: '基礎導入', desc: '新規学習→即演習。宅建業法中心に基礎を固める', color: '#10b981' },
              { phase: 'Phase 2', label: '基礎演習', desc: '問題演習メイン。次トピックの新規学習も並行', color: '#0ea5e9' },
              { phase: 'Phase 3', label: '論点強化', desc: '論点別過去問を繰り返し、苦手を集中的に潰す', color: '#f59e0b' },
              { phase: 'Phase 4', label: '模試演習', desc: '年度別過去問・模試で本番形式に慣れる（9月）', color: '#ef4444' },
              { phase: 'Phase 5', label: '最終復習', desc: '間違いノート・暗記確認で知識を総仕上げ（10月）', color: '#8b5cf6' },
            ].map(({ phase, label, desc, color }) => (
              <div key={phase} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={chip(color)}>{phase}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            padding: '10px 12px', background: 'var(--chip-neutral-bg)',
            borderRadius: 10, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.7,
          }}>
            💡 手動で追加したタスクや完了済みタスクは再生成しても消えません。教材を変えたときは再生成して教材リンクを更新しましょう。
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
          <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.8 }}>
            ログイン画面で「Googleでログイン」を押すことで有効になります。ログイン後はデータの保存・読み込みが自動で行われます。
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: 'log',      color: '#10b981', title: '自動保存',          desc: 'データを変更すると約2.5秒後にクラウドへ自動保存されます。' },
              { icon: 'review',   color: '#0ea5e9', title: '自動読み込み',      desc: 'アプリを開いたとき・他のタブから戻ったときに新しいデータがあれば自動読み込みされます。' },
              { icon: 'spark',    color: '#8b5cf6', title: 'マルチデバイス対応', desc: 'スマホ・PC・タブレットで同じGoogleアカウントでログインすればデータが同期されます。' },
              { icon: 'settings', color: '#64748b', title: 'アカウントごとに分離', desc: '同じデバイスでもアカウントを切り替えるとそれぞれのデータに自動で切り替わります。' },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Icon name={icon} size={18} stroke={1.8} style={{ color, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.65 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            padding: '10px 12px', background: 'var(--chip-neutral-bg)',
            borderRadius: 10, fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.7,
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
              q: '教材を選び直したらどうすればいいですか？',
              a: '教材ページで教材を変更・追加した後は、設定ページでスケジュールを再生成してください。ホームの今日のタスクに表示される教材リンクが最新の選択内容に更新されます。',
            },
            {
              q: '今日のタスクに教材のリンクが表示されません',
              a: '教材ページでカタログから教材を追加すると、タスクの下に参考教材リンクが自動表示されます。スケジュールも生成済みである必要があります。教材を追加後にスケジュールの再生成をお試しください。',
            },
            {
              q: 'データが消えてしまいました',
              a: 'このアプリはブラウザのlocalStorageにデータを保存しています。ブラウザのキャッシュ削除・プライベートモード・アプリ削除でデータが失われることがあります。設定ページの「JSONを書き出す」で定期的にバックアップを取るか、クラウド同期を有効にしておくと安心です。',
            },
            {
              q: 'スマホとPCでデータを共有したい',
              a: '両方の端末で同じGoogleアカウントでログインしてください。ログインするだけでデータが自動的に同期されます。',
            },
            {
              q: 'タスクを間違えて完了にしてしまった',
              a: 'ホームのタスク一覧で、完了済みのタスクをもう一度タップすると未完了に戻せます。',
            },
            {
              q: 'スケジュールを再生成したら今のタスクはどうなりますか？',
              a: '手動で追加したタスク・完了済みのタスクは削除されません。同じ日付・同じタイトルのタスクは重複して作成されない仕組みなので、何度再生成しても安全です。',
            },
            {
              q: 'アプリをスマホのホーム画面に追加したい',
              a: 'Safariでアプリを開き、画面下の共有ボタン（□↑）→「ホーム画面に追加」をタップしてください（Androidはメニュー→「ホーム画面に追加」）。アプリのように使えるようになります。',
            },
            {
              q: 'データをすべてリセットしたい',
              a: '設定ページ → 最下部の「データリセット」から行えます。2段階の確認ダイアログで誤操作を防ぐ仕組みになっています。クラウド同期中の場合はクラウド側のデータも同時に消去されます。',
            },
            {
              q: 'JSONバックアップを復元するには？',
              a: '設定ページ →「データバックアップ」→「JSONを読み込む」から、以前書き出したファイルを選択してください。現在のデータが上書きされるため確認ダイアログが表示されます。',
            },
          ].map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      {/* フッター */}
      <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-4)', padding: '4px 0 16px' }}>
        宅建学習管理アプリ v1.0.0　·　2026年度 宅地建物取引士
      </div>

    </div>
  );
}
