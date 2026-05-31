// 教材カタログ — よく使われる宅建教材のプリセット
// 章構成はTAC「みんなが欲しかった！宅建士」シリーズ2026年度版の公開情報をもとに作成。
// 実際の書籍と照合して修正してください。
// unit フィールド:
//   chapterTitle      表示名
//   subjectId         科目 (gyo / kenri / horei / zei)
//   estimatedMinutes  学習目安 (任意)
//   url               参照URL (任意) — video/website 系は必須
//   keywords          タスクタイトルとの照合キーワード配列 (任意)

export const TEXTBOOK_CATALOG = [
  {
    id: 'cat-tac-kyokasho-2026',
    title: '2026年度版 みんなが欲しかった！宅建士の教科書',
    shortTitle: 'みんほし 教科書',
    publisher: 'TAC出版',
    type: 'textbook',
    status: 'using',
    description: 'フルカラー・図解豊富。4科目を1冊で学習できる定番テキスト。',
    url: 'https://bookstore.tac-school.co.jp/book/detail/111927',
    units: [
      // ── 権利関係 ──────────────────────────────────────
      { chapterTitle: '第1章　制限行為能力者',           subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '第2章　意思表示',                 subjectId: 'kenri', estimatedMinutes: 45 },
      { chapterTitle: '第3章　代理',                     subjectId: 'kenri', estimatedMinutes: 45 },
      { chapterTitle: '第4章　時効',                     subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '第5章　物権変動・不動産登記',     subjectId: 'kenri', estimatedMinutes: 45 },
      { chapterTitle: '第6章　共有',                     subjectId: 'kenri', estimatedMinutes: 25 },
      { chapterTitle: '第7章　地上権・地役権',           subjectId: 'kenri', estimatedMinutes: 25 },
      { chapterTitle: '第8章　抵当権・根抵当権',         subjectId: 'kenri', estimatedMinutes: 60 },
      { chapterTitle: '第9章　保証・連帯債務',           subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '第10章　債権譲渡・相殺',          subjectId: 'kenri', estimatedMinutes: 25 },
      { chapterTitle: '第11章　売買契約',                subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '第12章　賃貸借契約',              subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '第13章　請負・委任・その他',      subjectId: 'kenri', estimatedMinutes: 25 },
      { chapterTitle: '第14章　不法行為・不当利得',      subjectId: 'kenri', estimatedMinutes: 25 },
      { chapterTitle: '第15章　相続',                    subjectId: 'kenri', estimatedMinutes: 45 },
      { chapterTitle: '第16章　借地借家法（借地権）',    subjectId: 'kenri', estimatedMinutes: 45 },
      { chapterTitle: '第17章　借地借家法（借家権）',    subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '第18章　区分所有法',              subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '第19章　不動産登記法',            subjectId: 'kenri', estimatedMinutes: 30 },
      // ── 宅建業法 ──────────────────────────────────────
      { chapterTitle: '第1章　宅建業・宅建士とは',       subjectId: 'gyo',   estimatedMinutes: 25 },
      { chapterTitle: '第2章　免許制度',                 subjectId: 'gyo',   estimatedMinutes: 55 },
      { chapterTitle: '第3章　宅地建物取引士',           subjectId: 'gyo',   estimatedMinutes: 50 },
      { chapterTitle: '第4章　営業保証金',               subjectId: 'gyo',   estimatedMinutes: 40 },
      { chapterTitle: '第5章　保証協会',                 subjectId: 'gyo',   estimatedMinutes: 40 },
      { chapterTitle: '第6章　媒介契約',                 subjectId: 'gyo',   estimatedMinutes: 40 },
      { chapterTitle: '第7章　広告・契約締結時期の制限', subjectId: 'gyo',   estimatedMinutes: 25 },
      { chapterTitle: '第8章　重要事項説明（35条書面）', subjectId: 'gyo',   estimatedMinutes: 60 },
      { chapterTitle: '第9章　37条書面（契約書面）',     subjectId: 'gyo',   estimatedMinutes: 40 },
      { chapterTitle: '第10章　自ら売主の8つの制限',     subjectId: 'gyo',   estimatedMinutes: 55 },
      { chapterTitle: '第11章　クーリングオフ',          subjectId: 'gyo',   estimatedMinutes: 30 },
      { chapterTitle: '第12章　その他の業務上の規制',    subjectId: 'gyo',   estimatedMinutes: 30 },
      { chapterTitle: '第13章　報酬の制限',              subjectId: 'gyo',   estimatedMinutes: 40 },
      { chapterTitle: '第14章　監督・罰則',              subjectId: 'gyo',   estimatedMinutes: 25 },
      { chapterTitle: '第15章　住宅瑕疵担保履行法',      subjectId: 'gyo',   estimatedMinutes: 25 },
      // ── 法令上の制限 ──────────────────────────────────
      { chapterTitle: '第1章　都市計画法①（都市計画）', subjectId: 'horei', estimatedMinutes: 55 },
      { chapterTitle: '第2章　都市計画法②（開発許可）', subjectId: 'horei', estimatedMinutes: 55 },
      { chapterTitle: '第3章　建築基準法①（単体規定）', subjectId: 'horei', estimatedMinutes: 45 },
      { chapterTitle: '第4章　建築基準法②（集団規定）', subjectId: 'horei', estimatedMinutes: 55 },
      { chapterTitle: '第5章　盛土規制法',               subjectId: 'horei', estimatedMinutes: 30 },
      { chapterTitle: '第6章　土地区画整理法',           subjectId: 'horei', estimatedMinutes: 30 },
      { chapterTitle: '第7章　農地法',                   subjectId: 'horei', estimatedMinutes: 30 },
      { chapterTitle: '第8章　国土利用計画法',           subjectId: 'horei', estimatedMinutes: 25 },
      { chapterTitle: '第9章　その他の法令上の制限',     subjectId: 'horei', estimatedMinutes: 25 },
      // ── 税・その他 ────────────────────────────────────
      { chapterTitle: '第1章　不動産取得税',             subjectId: 'zei',   estimatedMinutes: 25 },
      { chapterTitle: '第2章　固定資産税',               subjectId: 'zei',   estimatedMinutes: 25 },
      { chapterTitle: '第3章　譲渡所得（所得税）',       subjectId: 'zei',   estimatedMinutes: 40 },
      { chapterTitle: '第4章　印紙税',                   subjectId: 'zei',   estimatedMinutes: 20 },
      { chapterTitle: '第5章　登録免許税',               subjectId: 'zei',   estimatedMinutes: 20 },
      { chapterTitle: '第6章　地価公示法',               subjectId: 'zei',   estimatedMinutes: 25 },
      { chapterTitle: '第7章　不動産鑑定評価基準',       subjectId: 'zei',   estimatedMinutes: 20 },
      { chapterTitle: '第8章　住宅金融支援機構',         subjectId: 'zei',   estimatedMinutes: 20 },
      { chapterTitle: '第9章　景品表示法',               subjectId: 'zei',   estimatedMinutes: 20 },
      { chapterTitle: '第10章　統計',                    subjectId: 'zei',   estimatedMinutes: 15 },
      { chapterTitle: '第11章　土地・建物の知識',        subjectId: 'zei',   estimatedMinutes: 25 },
    ],
  },
  {
    id: 'cat-tac-mondaishu-2026',
    title: '2026年度版 みんなが欲しかった！宅建士の論点別過去問題集',
    shortTitle: 'みんほし 問題集',
    publisher: 'TAC出版',
    type: 'workbook',
    status: 'using',
    description: '教科書と対応した論点別構成。繰り返し演習で知識を定着。',
    url: 'https://bookstore.tac-school.co.jp/book/detail/111928',
    units: [
      // ── 権利関係 ──────────────────────────────────────
      { chapterTitle: '権利関係①　制限行為能力者・意思表示', subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '権利関係②　代理・時効',               subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '権利関係③　物権変動・共有',           subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '権利関係④　抵当権・保証',             subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '権利関係⑤　売買・賃貸借',             subjectId: 'kenri', estimatedMinutes: 35 },
      { chapterTitle: '権利関係⑥　不法行為・相続',           subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '権利関係⑦　借地借家法',               subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '権利関係⑧　区分所有法・不動産登記法', subjectId: 'kenri', estimatedMinutes: 35 },
      // ── 宅建業法 ──────────────────────────────────────
      { chapterTitle: '宅建業法①　免許・宅建士',             subjectId: 'gyo',   estimatedMinutes: 40 },
      { chapterTitle: '宅建業法②　営業保証金・保証協会',     subjectId: 'gyo',   estimatedMinutes: 35 },
      { chapterTitle: '宅建業法③　媒介契約・広告',           subjectId: 'gyo',   estimatedMinutes: 35 },
      { chapterTitle: '宅建業法④　重要事項説明',             subjectId: 'gyo',   estimatedMinutes: 50 },
      { chapterTitle: '宅建業法⑤　37条書面・自ら売主制限',   subjectId: 'gyo',   estimatedMinutes: 45 },
      { chapterTitle: '宅建業法⑥　報酬・規制・罰則',         subjectId: 'gyo',   estimatedMinutes: 35 },
      // ── 法令上の制限 ──────────────────────────────────
      { chapterTitle: '法令制限①　都市計画法',               subjectId: 'horei', estimatedMinutes: 45 },
      { chapterTitle: '法令制限②　建築基準法',               subjectId: 'horei', estimatedMinutes: 45 },
      { chapterTitle: '法令制限③　盛土規制法・区画整理',     subjectId: 'horei', estimatedMinutes: 30 },
      { chapterTitle: '法令制限④　農地法・国土利用計画法',   subjectId: 'horei', estimatedMinutes: 30 },
      { chapterTitle: '法令制限⑤　その他の法令制限',         subjectId: 'horei', estimatedMinutes: 25 },
      // ── 税・その他 ────────────────────────────────────
      { chapterTitle: '税①　不動産取得税・固定資産税',       subjectId: 'zei',   estimatedMinutes: 30 },
      { chapterTitle: '税②　所得税・印紙税・登録免許税',     subjectId: 'zei',   estimatedMinutes: 30 },
      { chapterTitle: 'その他①　地価公示・鑑定評価',         subjectId: 'zei',   estimatedMinutes: 25 },
      { chapterTitle: 'その他②　住宅金融・景品表示・統計',   subjectId: 'zei',   estimatedMinutes: 25 },
    ],
  },

  // ── 公式過去問（RETIO）──────────────────────────────────────────────
  {
    id: 'cat-retio-kakomon',
    title: '公式過去問（RETIO）',
    shortTitle: '公式過去問',
    publisher: '一般財団法人 不動産適正取引推進機構',
    type: 'workbook',
    status: 'using',
    description: '宅建試験の公式過去問と正解番号。年度別に全問掲載。演習・答え合わせに活用。',
    url: 'https://www.retio.or.jp/exam/past_ques_ans/other/',
    units: [
      {
        chapterTitle: '権利関係 過去問', subjectId: 'kenri',
        url: 'https://www.retio.or.jp/exam/past_ques_ans/other/',
        keywords: ['意思表示', '代理', '時効', '債務不履行', '売買', '賃貸借', '借地借家法', '区分所有法', '相続', '抵当権', '権利関係'],
      },
      {
        chapterTitle: '宅建業法 過去問', subjectId: 'gyo',
        url: 'https://www.retio.or.jp/exam/past_ques_ans/other/',
        keywords: ['免許', '宅建士', '営業保証金', '保証協会', '媒介契約', '重要事項説明', '37条書面', '8種制限', '報酬額', '監督処分', '罰則', '宅建業法'],
      },
      {
        chapterTitle: '法令上の制限 過去問', subjectId: 'horei',
        url: 'https://www.retio.or.jp/exam/past_ques_ans/other/',
        keywords: ['都市計画法', '建築基準法', '国土利用計画法', '農地法', '宅地造成', '土地区画整理法', '法令'],
      },
      {
        chapterTitle: '税・その他 過去問', subjectId: 'zei',
        url: 'https://www.retio.or.jp/exam/past_ques_ans/other/',
        keywords: ['不動産取得税', '固定資産税', '登録免許税', '印紙税', '地価公示', '不動産鑑定評価', '税'],
      },
    ],
  },

  // ── ゆーき大学（YouTube）─────────────────────────────────────────
  {
    id: 'cat-yuuki-youtube',
    title: 'マジでイケてる宅建講座【ゆーき大学】',
    shortTitle: 'ゆーき大学',
    publisher: 'YouTube（ゆーき大学）',
    type: 'video',
    status: 'using',
    description: '語呂合わせ・図解で暗記しやすい宅建講座。全科目を無料で視聴できる人気チャンネル。',
    url: 'https://www.youtube.com/channel/UC9FTrf3ryoNxs01o_a2FE6g',
    units: [
      // 宅建業法
      { chapterTitle: '免許',         subjectId: 'gyo',   keywords: ['免許'],         url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+免許' },
      { chapterTitle: '宅建士',        subjectId: 'gyo',   keywords: ['宅建士'],        url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+宅建士' },
      { chapterTitle: '営業保証金',    subjectId: 'gyo',   keywords: ['営業保証金'],    url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+営業保証金' },
      { chapterTitle: '保証協会',      subjectId: 'gyo',   keywords: ['保証協会'],      url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+保証協会' },
      { chapterTitle: '媒介契約',      subjectId: 'gyo',   keywords: ['媒介契約'],      url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+媒介契約' },
      { chapterTitle: '重要事項説明',  subjectId: 'gyo',   keywords: ['重要事項説明'],  url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+重要事項説明' },
      { chapterTitle: '37条書面',      subjectId: 'gyo',   keywords: ['37条書面'],      url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+37条書面' },
      { chapterTitle: '8種制限',       subjectId: 'gyo',   keywords: ['8種制限'],       url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+8種制限' },
      { chapterTitle: '報酬額',        subjectId: 'gyo',   keywords: ['報酬額'],        url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+報酬額' },
      { chapterTitle: '監督処分・罰則', subjectId: 'gyo',  keywords: ['監督処分', '罰則'], url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+監督処分+罰則' },
      // 権利関係
      { chapterTitle: '意思表示',      subjectId: 'kenri', keywords: ['意思表示'],      url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+意思表示' },
      { chapterTitle: '代理',          subjectId: 'kenri', keywords: ['代理'],          url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+代理' },
      { chapterTitle: '時効',          subjectId: 'kenri', keywords: ['時効'],          url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+時効' },
      { chapterTitle: '債務不履行',    subjectId: 'kenri', keywords: ['債務不履行'],    url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+債務不履行' },
      { chapterTitle: '売買',          subjectId: 'kenri', keywords: ['売買'],          url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+売買' },
      { chapterTitle: '賃貸借',        subjectId: 'kenri', keywords: ['賃貸借'],        url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+賃貸借' },
      { chapterTitle: '借地借家法',    subjectId: 'kenri', keywords: ['借地借家法'],    url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+借地借家法' },
      { chapterTitle: '区分所有法',    subjectId: 'kenri', keywords: ['区分所有法'],    url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+区分所有法' },
      { chapterTitle: '相続',          subjectId: 'kenri', keywords: ['相続'],          url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+相続' },
      { chapterTitle: '抵当権',        subjectId: 'kenri', keywords: ['抵当権'],        url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+抵当権' },
      // 法令上の制限
      { chapterTitle: '都市計画法',    subjectId: 'horei', keywords: ['都市計画法'],    url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+都市計画法' },
      { chapterTitle: '建築基準法',    subjectId: 'horei', keywords: ['建築基準法'],    url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+建築基準法' },
      { chapterTitle: '国土利用計画法', subjectId: 'horei', keywords: ['国土利用計画法'], url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+国土利用計画法' },
      { chapterTitle: '農地法',        subjectId: 'horei', keywords: ['農地法'],        url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+農地法' },
      { chapterTitle: '宅地造成等規制法', subjectId: 'horei', keywords: ['宅地造成', '盛土'], url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+宅地造成+盛土規制法' },
      { chapterTitle: '土地区画整理法', subjectId: 'horei', keywords: ['土地区画整理法'], url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+土地区画整理法' },
      // 税・その他
      { chapterTitle: '不動産取得税',  subjectId: 'zei',   keywords: ['不動産取得税'],  url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+不動産取得税' },
      { chapterTitle: '固定資産税',    subjectId: 'zei',   keywords: ['固定資産税'],    url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+固定資産税' },
      { chapterTitle: '登録免許税',    subjectId: 'zei',   keywords: ['登録免許税'],    url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+登録免許税' },
      { chapterTitle: '印紙税',        subjectId: 'zei',   keywords: ['印紙税'],        url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+印紙税' },
      { chapterTitle: '地価公示',      subjectId: 'zei',   keywords: ['地価公示'],      url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+地価公示' },
      { chapterTitle: '不動産鑑定評価', subjectId: 'zei',  keywords: ['不動産鑑定評価'], url: 'https://www.youtube.com/results?search_query=ゆーき大学+宅建+不動産鑑定評価' },
    ],
  },
];

// 科目ごとのユニット数サマリーを計算
export function catalogUnitSummary(catalog) {
  const counts = {};
  catalog.units.forEach(u => {
    counts[u.subjectId] = (counts[u.subjectId] || 0) + 1;
  });
  return counts;
}
