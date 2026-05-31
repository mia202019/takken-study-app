export const CAT = {
  gyo:   { label: '宅建業法',     fg: 'var(--cat-gyo)',   bg: 'var(--cat-gyo-bg)',   dot: 'var(--cat-gyo)' },
  kenri: { label: '権利関係',     fg: 'var(--cat-kenri)', bg: 'var(--cat-kenri-bg)', dot: 'var(--cat-kenri)' },
  horei: { label: '法令上の制限', fg: 'var(--cat-horei)', bg: 'var(--cat-horei-bg)', dot: 'var(--cat-horei)' },
  zei:   { label: '税・その他',   fg: 'var(--cat-zei)',   bg: 'var(--cat-zei-bg)',   dot: 'var(--cat-zei)' },
};

export const TYPE = {
  new:    { label: '新規学習', icon: 'book' },
  review: { label: '復習',     icon: 'review' },
  drill:  { label: '問題演習', icon: 'target' },
  tidy:   { label: '整理',     icon: 'note' },
};

export const NAV = [
  { id: 'home',     label: 'ホーム',   icon: 'home' },
  { id: 'map',      label: '論点',     icon: 'map' },
  { id: 'review',   label: '復習',     icon: 'review' },
  { id: 'mistake',  label: 'ミス',     icon: 'mistake' },
  { id: 'analysis', label: '分析',     icon: 'analysis' },
  { id: 'material', label: '教材',     icon: 'book' },
  { id: 'library',  label: 'リソース', icon: 'library' },
  { id: 'settings', label: '設定',     icon: 'settings' },
  { id: 'help',     label: 'ガイド',   icon: 'help' },
];

export const NAV_PRIMARY = ['home', 'map', 'review', 'mistake'];

export const INITIAL_TASKS = [
  { id: 't0', carry: false, type: 'tidy',   cat: null,    title: '間違いノート整理', topic: '',           min: 10 },
  { id: 't1', carry: false, type: 'new',    cat: 'gyo',   title: '免許',           topic: '免許の基準',   min: 30 },
  { id: 't2', carry: false, type: 'review', cat: 'kenri', title: '意思表示',       topic: '錯誤・詐欺',   min: 20 },
  { id: 't3', carry: false, type: 'drill',  cat: 'gyo',   title: '宅建業法 10問',  topic: '一問一答',     min: 30 },
];

export const FIXED_TASKS = [
  { date: '2026-06-05', title: '公告確認',        note: '令和8年度 試験案内の官報公告をチェック',       url: 'https://www.retio.or.jp/exam/schedule/' },
  { date: '2026-06-25', title: '申込準備',        note: '証明写真・本人確認書類を用意（受験料8,200円）', url: 'https://www.retio.or.jp/exam/schedule/' },
  { date: '2026-07-01', title: 'ネット申込 開始', note: '9:30〜 マイページ作成＆申込開始',              url: 'https://moushikomi.retio.or.jp/', key: true },
  { date: '2026-07-31', title: '申込 最終日',     note: 'インターネット申込 23:59締切（当日中に！）',    url: 'https://moushikomi.retio.or.jp/' },
  { date: '2026-10-02', title: '受験票 到着確認', note: '郵送で届く受験票・会場を確認する',              url: 'https://www.retio.or.jp/exam/schedule/' },
  { date: '2026-10-17', title: '前日チェック',    note: '会場・持ち物・時間の最終確認',                 url: 'https://www.retio.or.jp/exam/' },
  { date: '2026-10-18', title: '本試験',          note: '13:00〜15:00（入場 12:30〜）',                exam: true },
];

export const WEAK = [
  { rank: 1, topic: '意思表示',       cat: 'kenri', rate: 62 },
  { rank: 2, topic: '抵当権',         cat: 'kenri', rate: 55 },
  { rank: 3, topic: 'クーリングオフ', cat: 'gyo',   rate: 48 },
];

export const EXAM = {
  date: new Date(2026, 9, 18),
  dateLabel: '2026年10月18日（日）',
  timeLabel: '13:00〜15:00',
  phase: 'インプット期',
  applyStatus: '受付前',
  weeklyGoalH: 10,
  weeklyDoneH: 6.5,
  todayGoalMin: 90,
  overdueReview: 3,
};

const WD = ['日', '月', '火', '水', '木', '金', '土'];

export function daysBetween(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((db - da) / ms);
}
export function parseDate(d) {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day);
}
export function fmtShort(date) { return `${date.getMonth() + 1}/${date.getDate()}`; }
export function fmtMD(date) { return `${date.getMonth() + 1}月${date.getDate()}日`; }
export function weekday(date) { return WD[date.getDay()]; }
