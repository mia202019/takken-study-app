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
    title: '【教科書】2026年度版 みんなが欲しかった！宅建士の教科書',
    shortTitle: '【教科書】みんなの宅建',
    publisher: 'TAC出版',
    type: 'textbook',
    status: 'using',
    description: 'フルカラー・図解豊富。4科目を1冊で学習できる定番テキスト。本試験での出題数：宅建業法20問・権利関係14問・法令上の制限8問・税その他8問。',
    url: 'https://bookstore.tac-school.co.jp/book/detail/111927',
    units: [
      // ── 第1分冊：宅建業法（目標18点）──────────────────────────
      { chapterTitle: '01 宅建業法の基本',                   subjectId: 'gyo',   estimatedMinutes: 25 },
      { chapterTitle: '02 免許',                             subjectId: 'gyo',   estimatedMinutes: 55 },
      { chapterTitle: '03 宅地建物取引士',                   subjectId: 'gyo',   estimatedMinutes: 50 },
      { chapterTitle: '04 営業保証金',                       subjectId: 'gyo',   estimatedMinutes: 40 },
      { chapterTitle: '05 保証協会',                         subjectId: 'gyo',   estimatedMinutes: 40 },
      { chapterTitle: '06 事務所、案内所等に関する規制',     subjectId: 'gyo',   estimatedMinutes: 35 },
      { chapterTitle: '07 業務上の規制',                     subjectId: 'gyo',   estimatedMinutes: 60 },
      { chapterTitle: '08 自ら売主となる場合の8つの制限',   subjectId: 'gyo',   estimatedMinutes: 55 },
      { chapterTitle: '09 報酬に関する制限',                 subjectId: 'gyo',   estimatedMinutes: 40 },
      { chapterTitle: '10 監督・罰則',                       subjectId: 'gyo',   estimatedMinutes: 25 },
      { chapterTitle: '11 住宅瑕疵担保履行法',               subjectId: 'gyo',   estimatedMinutes: 25 },
      // ── 第2分冊：権利関係（目標8-10点）────────────────────────
      { chapterTitle: '01 制限行為能力者',                   subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '02 意思表示',                         subjectId: 'kenri', estimatedMinutes: 45 },
      { chapterTitle: '03 代理',                             subjectId: 'kenri', estimatedMinutes: 45 },
      { chapterTitle: '04 時効',                             subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '05 債務不履行、解除',                 subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '06 危険負担',                         subjectId: 'kenri', estimatedMinutes: 20 },
      { chapterTitle: '07 弁済、相殺、債権譲渡',             subjectId: 'kenri', estimatedMinutes: 35 },
      { chapterTitle: '08 売買',                             subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '09 物権変動',                         subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '10 抵当権',                           subjectId: 'kenri', estimatedMinutes: 50 },
      { chapterTitle: '11 連帯債務、保証、連帯保証',         subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '12 賃貸借',                           subjectId: 'kenri', estimatedMinutes: 30 },
      { chapterTitle: '13 借地借家法（借地）',               subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '14 借地借家法（借家）',               subjectId: 'kenri', estimatedMinutes: 35 },
      { chapterTitle: '15 請負',                             subjectId: 'kenri', estimatedMinutes: 25 },
      { chapterTitle: '16 不法行為',                         subjectId: 'kenri', estimatedMinutes: 25 },
      { chapterTitle: '17 相続',                             subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '18 共有',                             subjectId: 'kenri', estimatedMinutes: 25 },
      { chapterTitle: '19 区分所有法',                       subjectId: 'kenri', estimatedMinutes: 40 },
      { chapterTitle: '20 不動産登記法',                     subjectId: 'kenri', estimatedMinutes: 30 },
      // ── 第3分冊：法令上の制限（目標5点）───────────────────────
      { chapterTitle: '01 都市計画法',                       subjectId: 'horei', estimatedMinutes: 60 },
      { chapterTitle: '02 建築基準法',                       subjectId: 'horei', estimatedMinutes: 70 },
      { chapterTitle: '03 国土利用計画法',                   subjectId: 'horei', estimatedMinutes: 30 },
      { chapterTitle: '04 農地法',                           subjectId: 'horei', estimatedMinutes: 25 },
      { chapterTitle: '05 盛土規制法',                       subjectId: 'horei', estimatedMinutes: 25 },
      { chapterTitle: '06 土地区画整理法',                   subjectId: 'horei', estimatedMinutes: 30 },
      { chapterTitle: '07 その他の法令上の制限',             subjectId: 'horei', estimatedMinutes: 25 },
      // ── 第4分冊：税・その他 ────────────────────────────────
      { chapterTitle: '01 不動産に関する税金',               subjectId: 'zei',   estimatedMinutes: 50 },
      { chapterTitle: '02 不動産鑑定評価基準',               subjectId: 'zei',   estimatedMinutes: 20 },
      { chapterTitle: '03 地価公示法',                       subjectId: 'zei',   estimatedMinutes: 20 },
      { chapterTitle: '04 住宅金融支援機構法',               subjectId: 'zei',   estimatedMinutes: 20 },
      { chapterTitle: '05 景品表示法',                       subjectId: 'zei',   estimatedMinutes: 20 },
      { chapterTitle: '06 土地・建物',                       subjectId: 'zei',   estimatedMinutes: 30 },
    ],
  },
  {
    id: 'cat-tac-mondaishu-2026',
    title: '【問題集】2026年度版 みんなが欲しかった！宅建士の12年過去問題集',
    shortTitle: '【問題集】みんなの過去問',
    publisher: 'TAC出版',
    type: 'workbook',
    status: 'using',
    description: '教科書と完全連動。章番号が一致しているので教科書→過去問の流れで効率学習できる。12年分（令和6年～平成25年）の過去問を収録。',
    url: 'https://bookstore.tac-school.co.jp/book/detail/111928',
    units: [
      // ── 第1分冊：宅建業法 ──────────────────────────────────
      { chapterTitle: '01 宅建業法の基本',                   subjectId: 'gyo',   estimatedMinutes: 20, keywords: ['宅建業法の基本'] },
      { chapterTitle: '02 免許',                             subjectId: 'gyo',   estimatedMinutes: 40, keywords: ['免許'] },
      { chapterTitle: '03 宅地建物取引士',                   subjectId: 'gyo',   estimatedMinutes: 40, keywords: ['宅建士', '取引士'] },
      { chapterTitle: '04 営業保証金',                       subjectId: 'gyo',   estimatedMinutes: 30, keywords: ['営業保証金'] },
      { chapterTitle: '05 保証協会',                         subjectId: 'gyo',   estimatedMinutes: 30, keywords: ['保証協会'] },
      { chapterTitle: '06 事務所、案内所等に関する規制',     subjectId: 'gyo',   estimatedMinutes: 30, keywords: ['事務所', '案内所'] },
      { chapterTitle: '07 業務上の規制',                     subjectId: 'gyo',   estimatedMinutes: 50, keywords: ['業務上の規制', '媒介契約', '重要事項説明', '37条'] },
      { chapterTitle: '08 8種制限',                         subjectId: 'gyo',   estimatedMinutes: 45, keywords: ['8種制限', '自ら売主'] },
      { chapterTitle: '09 報酬に関する制限',                 subjectId: 'gyo',   estimatedMinutes: 35, keywords: ['報酬'] },
      { chapterTitle: '10 監督・罰則',                       subjectId: 'gyo',   estimatedMinutes: 25, keywords: ['監督', '罰則'] },
      { chapterTitle: '11 住宅瑕疵担保履行法',               subjectId: 'gyo',   estimatedMinutes: 20, keywords: ['住宅瑕疵担保履行法'] },
      // ── 第2分冊：権利関係 ──────────────────────────────────
      { chapterTitle: '01 制限行為能力者',                   subjectId: 'kenri', estimatedMinutes: 25, keywords: ['制限行為能力者'] },
      { chapterTitle: '02 意思表示',                         subjectId: 'kenri', estimatedMinutes: 35, keywords: ['意思表示'] },
      { chapterTitle: '03 代理',                             subjectId: 'kenri', estimatedMinutes: 35, keywords: ['代理'] },
      { chapterTitle: '04 時効',                             subjectId: 'kenri', estimatedMinutes: 25, keywords: ['時効'] },
      { chapterTitle: '05 債務不履行、解除',                 subjectId: 'kenri', estimatedMinutes: 30, keywords: ['債務不履行', '解除'] },
      { chapterTitle: '06 危険負担',                         subjectId: 'kenri', estimatedMinutes: 15, keywords: ['危険負担'] },
      { chapterTitle: '07 弁済、相殺、債権譲渡',             subjectId: 'kenri', estimatedMinutes: 30, keywords: ['弁済', '相殺', '債権譲渡'] },
      { chapterTitle: '08 売買',                             subjectId: 'kenri', estimatedMinutes: 25, keywords: ['売買'] },
      { chapterTitle: '09 物権変動',                         subjectId: 'kenri', estimatedMinutes: 30, keywords: ['物権変動'] },
      { chapterTitle: '10 抵当権',                           subjectId: 'kenri', estimatedMinutes: 40, keywords: ['抵当権'] },
      { chapterTitle: '11 連帯債務、保証、連帯保証',         subjectId: 'kenri', estimatedMinutes: 30, keywords: ['連帯債務', '保証', '連帯保証'] },
      { chapterTitle: '12 賃貸借',                           subjectId: 'kenri', estimatedMinutes: 25, keywords: ['賃貸借'] },
      { chapterTitle: '13 借地借家法（借地）',               subjectId: 'kenri', estimatedMinutes: 30, keywords: ['借地借家法', '借地'] },
      { chapterTitle: '14 借地借家法（借家）',               subjectId: 'kenri', estimatedMinutes: 30, keywords: ['借地借家法', '借家'] },
      { chapterTitle: '15 請負',                             subjectId: 'kenri', estimatedMinutes: 20, keywords: ['請負'] },
      { chapterTitle: '16 不法行為',                         subjectId: 'kenri', estimatedMinutes: 20, keywords: ['不法行為'] },
      { chapterTitle: '17 相続',                             subjectId: 'kenri', estimatedMinutes: 30, keywords: ['相続'] },
      { chapterTitle: '18 共有',                             subjectId: 'kenri', estimatedMinutes: 20, keywords: ['共有'] },
      { chapterTitle: '19 区分所有法',                       subjectId: 'kenri', estimatedMinutes: 30, keywords: ['区分所有法'] },
      { chapterTitle: '20 不動産登記法',                     subjectId: 'kenri', estimatedMinutes: 25, keywords: ['不動産登記法'] },
      // ── 第3分冊：法令上の制限 ──────────────────────────────
      { chapterTitle: '01 都市計画法',                       subjectId: 'horei', estimatedMinutes: 45, keywords: ['都市計画法'] },
      { chapterTitle: '02 建築基準法',                       subjectId: 'horei', estimatedMinutes: 50, keywords: ['建築基準法'] },
      { chapterTitle: '03 国土利用計画法',                   subjectId: 'horei', estimatedMinutes: 25, keywords: ['国土利用計画法'] },
      { chapterTitle: '04 農地法',                           subjectId: 'horei', estimatedMinutes: 20, keywords: ['農地法'] },
      { chapterTitle: '05 盛土規制法',                       subjectId: 'horei', estimatedMinutes: 20, keywords: ['盛土規制法'] },
      { chapterTitle: '06 土地区画整理法',                   subjectId: 'horei', estimatedMinutes: 25, keywords: ['土地区画整理法'] },
      { chapterTitle: '07 その他の法令上の制限',             subjectId: 'horei', estimatedMinutes: 20, keywords: ['法令上の制限'] },
      // ── 第4分冊：税・その他 ─────────────────────────────────
      { chapterTitle: '01 不動産に関する税金',               subjectId: 'zei',   estimatedMinutes: 40, keywords: ['税金', '不動産取得税', '固定資産税', '印紙税', '登録免許税'] },
      { chapterTitle: '02 不動産鑑定評価基準',               subjectId: 'zei',   estimatedMinutes: 20, keywords: ['不動産鑑定評価基準'] },
      { chapterTitle: '03 地価公示法',                       subjectId: 'zei',   estimatedMinutes: 20, keywords: ['地価公示法'] },
      { chapterTitle: '04 住宅金融支援機構法',               subjectId: 'zei',   estimatedMinutes: 20, keywords: ['住宅金融支援機構法'] },
      { chapterTitle: '05 景品表示法',                       subjectId: 'zei',   estimatedMinutes: 20, keywords: ['景品表示法'] },
      { chapterTitle: '06 土地・建物',                       subjectId: 'zei',   estimatedMinutes: 25, keywords: ['土地', '建物'] },
    ],
  },

  // ── 公式過去問（RETIO）──────────────────────────────────────────────
  {
    id: 'cat-retio-kakomon',
    title: '【公式問題】RETIO 宅建試験 過去問題・正解番号',
    shortTitle: '【公式】RETIO過去問',
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
    title: '【YouTube】マジでイケてる宅建講座【ゆーき大学】',
    shortTitle: '【YouTube】ゆーき大学',
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
