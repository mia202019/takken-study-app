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
export const TOPICS = {
  gyo: [
    { id: 'gyo-01', title: '免許',           priority: 'high' },
    { id: 'gyo-02', title: '宅建士',          priority: 'high' },
    { id: 'gyo-03', title: '営業保証金',       priority: 'mid' },
    { id: 'gyo-04', title: '保証協会',         priority: 'mid' },
    { id: 'gyo-05', title: '媒介契約',         priority: 'high' },
    { id: 'gyo-06', title: '重要事項説明',     priority: 'high' },
    { id: 'gyo-07', title: '37条書面',         priority: 'high' },
    { id: 'gyo-08', title: '8種制限',          priority: 'high' },
    { id: 'gyo-09', title: '報酬額',           priority: 'high' },
    { id: 'gyo-10', title: '監督処分・罰則',   priority: 'mid' },
  ],
  kenri: [
    { id: 'kenri-01', title: '意思表示',       priority: 'high' },
    { id: 'kenri-02', title: '代理',           priority: 'high' },
    { id: 'kenri-03', title: '時効',           priority: 'mid' },
    { id: 'kenri-04', title: '債務不履行',     priority: 'mid' },
    { id: 'kenri-05', title: '売買',           priority: 'mid' },
    { id: 'kenri-06', title: '賃貸借',         priority: 'mid' },
    { id: 'kenri-07', title: '借地借家法',     priority: 'high' },
    { id: 'kenri-08', title: '区分所有法',     priority: 'high' },
    { id: 'kenri-09', title: '相続',           priority: 'mid' },
    { id: 'kenri-10', title: '抵当権',         priority: 'high' },
  ],
  horei: [
    { id: 'horei-01', title: '都市計画法',           priority: 'high' },
    { id: 'horei-02', title: '建築基準法',           priority: 'high' },
    { id: 'horei-03', title: '国土利用計画法',       priority: 'mid' },
    { id: 'horei-04', title: '農地法',               priority: 'mid' },
    { id: 'horei-05', title: '宅地造成等規制法',     priority: 'mid' },
    { id: 'horei-06', title: '土地区画整理法',       priority: 'mid' },
  ],
  zei: [
    { id: 'zei-01', title: '不動産取得税',     priority: 'mid' },
    { id: 'zei-02', title: '固定資産税',       priority: 'mid' },
    { id: 'zei-03', title: '登録免許税',       priority: 'mid' },
    { id: 'zei-04', title: '印紙税',           priority: 'mid' },
    { id: 'zei-05', title: '地価公示',         priority: 'mid' },
    { id: 'zei-06', title: '不動産鑑定評価',   priority: 'mid' },
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
  const scored = ALL_TOPICS.map(t => ({ ...t, level: levels[t.id] ?? 0 }));

  // 1〜3 = 苦手候補（着手済みだが低理解）、次に 0（未着手）
  const studied = scored.filter(t => t.level > 0 && t.level <= 3).sort((a, b) => a.level - b.level);
  const untouched = scored.filter(t => t.level === 0);

  const combined = [...studied, ...untouched].slice(0, count);

  return combined.map((t, i) => ({
    rank: i + 1,
    topic: t.title,
    cat: t.cat,
    level: t.level,
    // ミス率：理解度が低いほど高い (level 0=未着手 → 表示として100、level 5 → 0)
    missRate: t.level === 0 ? null : Math.round((5 - t.level) / 4 * 100),
  }));
}
