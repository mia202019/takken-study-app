// 教材ユニットと学習タスクの自動紐付け
// タスクの科目（cat）＋論点キーワードから関連する教材ユニットを返す。
// 著作物コンテンツは一切含まない。

/**
 * タスクタイトルから論点キーワードを抽出
 * 例: "新規学習：宅建業法 / 免許"  → "免許"
 *     "問題演習：権利関係 / 抵当権" → "抵当権"
 *     "復習：苦手論点"              → null
 */
function extractTopic(title) {
  if (!title) return null;
  const idx = title.indexOf(' / ');
  return idx !== -1 ? title.slice(idx + 3).trim() : null;
}

/**
 * ユニットとキーワードの一致度スコアを返す
 *   2 = キーワード完全一致（keywords[] or chapterTitle）
 *   1 = キーワード部分一致
 *   0 = 不一致（subjectId だけ一致）
 */
function scoreUnit(unit, keyword) {
  if (!keyword) return 0;
  const title = (unit.chapterTitle || '').replace(/\s/g, '');
  const kws   = unit.keywords || [];

  // keywords 配列との完全一致
  if (kws.some(k => k === keyword)) return 2;
  // chapterTitle との完全一致（空白除去後）
  if (title === keyword.replace(/\s/g, '')) return 2;
  // keywords との部分一致（互いに含む）
  if (kws.some(k => keyword.includes(k) || k.includes(keyword))) return 1;
  // chapterTitle への部分一致
  const parts = keyword.split(/[・\/\s・]+/).filter(w => w.length >= 2);
  if (parts.some(p => title.includes(p))) return 1;

  return 0;
}

/**
 * タスクに対応する教材ユニットを返す
 *
 * @param {object}   task         - スケジュールタスク { cat, title, type }
 * @param {object[]} allUnits     - loadMaterialUnits() の結果
 * @param {object[]} allMaterials - loadMaterials() の結果
 * @returns {{ unit, material, score }[]}
 *   - 教材タイプごとに最高スコアのユニットを1件
 *   - video 系はキーワード一致（score > 0）のみ表示
 *   - textbook / workbook は常に表示（subject 一致のみで OK）
 *   - score 降順でソート
 */
export function findUnitsForTask(task, allUnits, allMaterials) {
  if (!task || !task.cat || !allUnits.length || !allMaterials.length) return [];

  const matMap  = Object.fromEntries(allMaterials.map(m => [m.id, m]));
  const keyword = extractTopic(task.title);

  // 科目が一致するユニットにスコアを付ける
  const scored = allUnits
    .filter(u => u.subjectId === task.cat)
    .map(u => ({
      unit: u,
      material: matMap[u.materialId],
      score: scoreUnit(u, keyword),
    }))
    .filter(x => x.material); // 教材が存在するもの

  if (!scored.length) return [];

  // 教材IDごとに最高スコアのユニットを1件選ぶ
  const best = {};
  scored.forEach(x => {
    const mid = x.unit.materialId;
    if (!best[mid] || x.score > best[mid].score) best[mid] = x;
  });

  return Object.values(best)
    .filter(x => {
      // video 系はトピック一致がある場合のみ表示（無関係な動画リンクを出さない）
      if (x.material.type === 'video') return x.score > 0;
      // その他（textbook / workbook / website）は科目一致だけで表示
      return true;
    })
    .sort((a, b) => {
      // score 降順 → video を後ろ（最後に参考リンクとして添える）
      if (b.score !== a.score) return b.score - a.score;
      const typeOrder = { textbook: 0, workbook: 1, website: 2, mock_exam: 3, video: 4, other: 5 };
      return (typeOrder[a.material.type] ?? 9) - (typeOrder[b.material.type] ?? 9);
    });
}

/**
 * タスクリストに教材ユニットを付けた Map を返す
 * { [taskId]: { unit, material, score }[] }
 */
export function buildMatLinksMap(tasks, allUnits, allMaterials) {
  const map = {};
  tasks.forEach(t => {
    map[t.id] = findUnitsForTask(t, allUnits, allMaterials);
  });
  return map;
}
