// 論点データ（教材：みんなが欲しかった！宅建士シリーズ）
// 保存するのは論点名・学習状態のみ。本文・問題文・解説は含まない。

export const LEVEL_INFO = [
  { label: '未着手',        short: '未',  bg: '#f0ece4', text: '#a89880' },
  { label: '読んだが不明',   short: '1',   bg: '#fdf0e4', text: '#b06020' },
  { label: 'なんとなく分かる', short: '2', bg: '#fdf6e4', text: '#9a7a20' },
  { label: '問題が少し解ける', short: '3', bg: '#f5f0e0', text: '#7a6a2a' },
  { label: 'だいたい解ける',  short: '4',  bg: '#eef5f0', text: '#3a7a5a' },
  { label: '安定して解ける',  short: '5',  bg: '#e8f5ec', text: '#2a6a4a' },
];

// 優先度: 'high' = 頻出, 'mid' = 標準
// 教材：2026みんなが欲しかった！宅建士の教科書
export const TOPICS = {
  gyo: [
    { id: 'gyo-01', title: '宅建業法の基本',               priority: 'high' },
    { id: 'gyo-02', title: '免許',                         priority: 'high' },
    { id: 'gyo-03', title: '宅地建物取引士',               priority: 'high' },
    { id: 'gyo-04', title: '営業保証金',                   priority: 'mid' },
    { id: 'gyo-05', title: '保証協会',                     priority: 'mid' },
    { id: 'gyo-06', title: '事務所、案内所等に関する規制', priority: 'mid' },
    { id: 'gyo-07', title: '業務上の規制',                 priority: 'high' },
    { id: 'gyo-08', title: '8種制限',                      priority: 'high' },
    { id: 'gyo-09', title: '報酬に関する制限',             priority: 'high' },
    { id: 'gyo-10', title: '監督・罰則',                   priority: 'mid' },
    { id: 'gyo-11', title: '住宅瑕疵担保履行法',           priority: 'mid' },
  ],
  kenri: [
    { id: 'kenri-01', title: '制限行為能力者',             priority: 'mid' },
    { id: 'kenri-02', title: '意思表示',                   priority: 'high' },
    { id: 'kenri-03', title: '代理',                       priority: 'high' },
    { id: 'kenri-04', title: '時効',                       priority: 'mid' },
    { id: 'kenri-05', title: '債務不履行、解除',           priority: 'mid' },
    { id: 'kenri-06', title: '危険負担',                   priority: 'mid' },
    { id: 'kenri-07', title: '弁済、相殺、債権譲渡',       priority: 'mid' },
    { id: 'kenri-08', title: '売買',                       priority: 'mid' },
    { id: 'kenri-09', title: '物権変動',                   priority: 'mid' },
    { id: 'kenri-10', title: '抵当権',                     priority: 'high' },
    { id: 'kenri-11', title: '連帯債務、保証、連帯保証',   priority: 'mid' },
    { id: 'kenri-12', title: '賃貸借',                     priority: 'mid' },
    { id: 'kenri-13', title: '借地借家法（借地）',         priority: 'high' },
    { id: 'kenri-14', title: '借地借家法（借家）',         priority: 'high' },
    { id: 'kenri-15', title: '請負',                       priority: 'mid' },
    { id: 'kenri-16', title: '不法行為',                   priority: 'mid' },
    { id: 'kenri-17', title: '相続',                       priority: 'mid' },
    { id: 'kenri-18', title: '共有',                       priority: 'mid' },
    { id: 'kenri-19', title: '区分所有法',                 priority: 'high' },
    { id: 'kenri-20', title: '不動産登記法',               priority: 'mid' },
  ],
  horei: [
    { id: 'horei-01', title: '都市計画法',                 priority: 'high' },
    { id: 'horei-02', title: '建築基準法',                 priority: 'high' },
    { id: 'horei-03', title: '国土利用計画法',             priority: 'mid' },
    { id: 'horei-04', title: '農地法',                     priority: 'mid' },
    { id: 'horei-05', title: '盛土規制法',                 priority: 'mid' },
    { id: 'horei-06', title: '土地区画整理法',             priority: 'mid' },
    { id: 'horei-07', title: 'その他の法令上の制限',       priority: 'mid' },
  ],
  zei: [
    { id: 'zei-01', title: '不動産に関する税金',           priority: 'mid' },
    { id: 'zei-02', title: '不動産鑑定評価基準',           priority: 'mid' },
    { id: 'zei-03', title: '地価公示法',                   priority: 'mid' },
    { id: 'zei-04', title: '住宅金融支援機構法',           priority: 'mid' },
    { id: 'zei-05', title: '景品表示法',                   priority: 'mid' },
    { id: 'zei-06', title: '土地・建物',                   priority: 'mid' },
  ],
};

export const ALL_TOPICS = Object.entries(TOPICS).flatMap(([cat, topics]) =>
  topics.map(t => ({ ...t, cat }))
);

export const LS_LEVELS_KEY = 'takken-topic-levels';

export function loadLevels() {
  try { return JSON.parse(localStorage.getItem(LS_LEVELS_KEY)) || {}; } catch { return {}; }
}

export function saveLevel(id, level) {
  const current = loadLevels();
  const next = { ...current, [id]: level };
  localStorage.setItem(LS_LEVELS_KEY, JSON.stringify(next));
  return next;
}

/**
 * ミス記録連動：理解度を自動調整
 * incorrect → 1下げる（下限0）
 * correct_but_unsure → 4以上なら3に下げる
 */
export function adjustLevelForMistake(topicId, result) {
  const levels = loadLevels();
  const current = levels[topicId] ?? 0;
  let next = current;
  if (result === 'incorrect') {
    next = Math.max(0, current - 1);
  } else if (result === 'correct_but_unsure' && current > 3) {
    next = 3;
  }
  if (next !== current) {
    saveLevel(topicId, next);
    window.dispatchEvent(new StorageEvent('storage', { key: LS_LEVELS_KEY }));
  }
}

// 苦手論点TOP3: 理解度が低い順（0=未着手は最後尾）
export function computeWeakTopics(levels, count = 3) {
  // 着手済み（level > 0）かつ理解度が低い（level <= 3）トピックのみ対象
  // 未着手（level === 0）はここに出さない → 「まだ記録なし」で表示
  const weak = ALL_TOPICS
    .map(t => ({ ...t, level: levels[t.id] ?? 0 }))
    .filter(t => t.level > 0 && t.level <= 3)
    .sort((a, b) => a.level - b.level)
    .slice(0, count);

  return weak.map((t, i) => ({
    rank: i + 1,
    topic: t.title,
    cat: t.cat,
    level: t.level,
    missRate: Math.round((5 - t.level) / 4 * 100),
  }));
}
