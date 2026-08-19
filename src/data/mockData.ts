export type Category = "イベント" | "補助金" | "入札・公募" | "募集" | "文化" | "子育て" | "政策"
export type Status = "募集中" | "締切間近" | "終了" | "準備中"
export type Target = "個人" | "企業" | "団体" | "子育て世帯" | "高齢者" | "農業者"

export interface Municipality {
  code: string
  name: string
  prefecture: string
  /** 地方区分（東北・関東 など）。全国展開時の絞り込みに使う */
  region?: string
  population: number
  /** 面積(km²)。未登録の自治体があるため 0 のことがある */
  area: number
  website: string
  summary: string
}

export interface Article {
  id: string
  title: string
  cityCode: string
  cityName: string
  prefecture: string
  category: Category
  status: Status
  targets: Target[]
  publishedAt: string
  deadline: string | null
  summary: string
  body: string
  sourceUrl: string
  amount?: string
  tags: string[]
}

export const municipalities: Municipality[] = [
  {
    code: "03201",
    name: "盛岡市",
    prefecture: "岩手県",
    population: 286000,
    area: 886,
    website: "https://www.city.morioka.iwate.jp",
    summary:
      "岩手県の県庁所在地。南部藩の城下町として栄え、石川啄木・宮沢賢治ゆかりの地。",
  },
  {
    code: "03202",
    name: "宮古市",
    prefecture: "岩手県",
    population: 49000,
    area: 1259,
    website: "https://www.city.miyako.iwate.jp",
    summary:
      "三陸海岸に面した港町。浄土ヶ浜など景勝地と漁業・水産加工業が盛ん。",
  },
  {
    code: "03203",
    name: "大船渡市",
    prefecture: "岩手県",
    population: 35000,
    area: 322,
    website: "https://www.city.ofunato.iwate.jp",
    summary: "リアス式海岸の好港。カキ・サケの養殖と水産加工が主要産業。",
  },
  {
    code: "03205",
    name: "花巻市",
    prefecture: "岩手県",
    population: 95000,
    area: 908,
    website: "https://www.city.hanamaki.iwate.jp",
    summary: "宮沢賢治の故郷。温泉地として知られ、農業と観光業が中心。",
  },
  {
    code: "03206",
    name: "北上市",
    prefecture: "岩手県",
    population: 93000,
    area: 590,
    website: "https://www.city.kitakami.iwate.jp",
    summary: "工業団地が集積する内陸工業都市。展勝地の桜まつりで有名。",
  },
  {
    code: "03207",
    name: "久慈市",
    prefecture: "岩手県",
    population: 33000,
    area: 627,
    website: "https://www.city.kuji.iwate.jp",
    summary: "琥珀の産地として知られる北東部の拠点都市。",
  },
  {
    code: "03208",
    name: "遠野市",
    prefecture: "岩手県",
    population: 26000,
    area: 826,
    website: "https://www.city.tono.iwate.jp",
    summary:
      "柳田國男「遠野物語」の舞台。民話の里として年間多くの観光客が訪れる。",
  },
  {
    code: "03209",
    name: "一関市",
    prefecture: "岩手県",
    population: 113000,
    area: 1256,
    website: "https://www.city.ichinoseki.iwate.jp",
    summary: "岩手県南部の拠点都市。世界遺産・平泉町に隣接する交通の要衝。",
  },
  {
    code: "03210",
    name: "陸前高田市",
    prefecture: "岩手県",
    population: 17800,
    area: 232,
    website: "https://www.city.rikuzentakata.iwate.jp",
    summary: "震災からの復興が進む沿岸南部の市。高田松原と津波伝承館を擁する。",
  },
  {
    code: "03211",
    name: "釜石市",
    prefecture: "岩手県",
    population: 30000,
    area: 441,
    website: "https://www.city.kamaishi.iwate.jp",
    summary: "近代製鉄発祥の地。橋野鉄鉱山が世界遺産に登録されている港湾都市。",
  },
  {
    code: "03213",
    name: "二戸市",
    prefecture: "岩手県",
    population: 25000,
    area: 420,
    website: "https://www.city.ninohe.lg.jp",
    summary: "県北の拠点都市。浄法寺漆や南部美人など地場産業が根づく。",
  },
  {
    code: "03214",
    name: "八幡平市",
    prefecture: "岩手県",
    population: 24000,
    area: 862,
    website: "https://www.city.hachimantai.lg.jp",
    summary:
      "八幡平・安比高原を抱える観光地。地熱発電など再生可能エネルギーが盛ん。",
  },
  {
    code: "03215",
    name: "奥州市",
    prefecture: "岩手県",
    population: 112000,
    area: 993,
    website: "https://www.city.oshu.iwate.jp",
    summary:
      "県南最大の人口を持つ市。前沢牛の産地で、水沢の鋳物産業でも知られる。",
  },
  {
    code: "03216",
    name: "滝沢市",
    prefecture: "岩手県",
    population: 55000,
    area: 182,
    website: "https://www.city.takizawa.iwate.jp",
    summary: "盛岡市に隣接するベッドタウン。岩手県立大学を抱える若い市。",
  },
  {
    code: "03301",
    name: "雫石町",
    prefecture: "岩手県",
    population: 15000,
    area: 609,
    website: "https://www.town.shizukuishi.iwate.jp",
    summary: "岩手山麓の温泉・スキーリゾート。酪農と観光が地域経済を支える。",
  },
  {
    code: "03302",
    name: "葛巻町",
    prefecture: "岩手県",
    population: 5300,
    area: 435,
    website: "https://www.town.kuzumaki.iwate.jp",
    summary: "「ミルクとワインとクリーンエネルギーの町」。風力発電の先進地。",
  },
  {
    code: "03303",
    name: "岩手町",
    prefecture: "岩手県",
    population: 12000,
    area: 360,
    website: "https://www.town.iwate.iwate.jp",
    summary:
      "北上川の源流域。キャベツなど高原野菜の産地で彫刻のまちとしても知られる。",
  },
  {
    code: "03321",
    name: "紫波町",
    prefecture: "岩手県",
    population: 32000,
    area: 239,
    website: "https://www.town.shiwa.iwate.jp",
    summary:
      "公民連携のまちづくり「オガールプロジェクト」で全国から視察を集める。",
  },
  {
    code: "03322",
    name: "矢巾町",
    prefecture: "岩手県",
    population: 27000,
    area: 67,
    website: "https://www.town.yahaba.iwate.jp",
    summary: "岩手医科大学附属病院が移転した医療拠点。盛岡都市圏の住宅地。",
  },
  {
    code: "03366",
    name: "西和賀町",
    prefecture: "岩手県",
    population: 5000,
    area: 590,
    website: "https://www.town.nishiwaga.lg.jp",
    summary: "県内有数の豪雪地帯。湯田・湯川温泉と山菜の産地。",
  },
  {
    code: "03381",
    name: "金ケ崎町",
    prefecture: "岩手県",
    population: 15000,
    area: 179,
    website: "https://www.town.kanegasaki.iwate.jp",
    summary: "自動車関連工場が立地する工業の町。武家町の街並みが保存地区に。",
  },
  {
    code: "03402",
    name: "平泉町",
    prefecture: "岩手県",
    population: 7000,
    area: 63,
    website: "https://www.town.hiraizumi.iwate.jp",
    summary: "中尊寺・毛越寺を擁する世界文化遺産のまち。観光関連の施策が厚い。",
  },
  {
    code: "03441",
    name: "住田町",
    prefecture: "岩手県",
    population: 4800,
    area: 335,
    website: "https://www.town.sumita.iwate.jp",
    summary:
      "「森林・林業日本一の町」を掲げる林業のまち。木造仮設住宅の先例で知られる。",
  },
  {
    code: "03461",
    name: "大槌町",
    prefecture: "岩手県",
    population: 10700,
    area: 200,
    website: "https://www.town.otsuchi.iwate.jp",
    summary: "湧水と鮭のまち。震災後の新しい市街地形成と定住促進を進める。",
  },
  {
    code: "03482",
    name: "山田町",
    prefecture: "岩手県",
    population: 14000,
    area: 263,
    website: "https://www.town.yamada.iwate.jp",
    summary: "山田湾のカキ・ホタテ養殖が主産業。三陸鉄道が縦断する沿岸の町。",
  },
  {
    code: "03483",
    name: "岩泉町",
    prefecture: "岩手県",
    population: 8300,
    area: 993,
    website: "https://www.town.iwaizumi.iwate.jp",
    summary: "本州で最も広い町。龍泉洞と岩泉ヨーグルトで知られる。",
  },
  {
    code: "03484",
    name: "田野畑村",
    prefecture: "岩手県",
    population: 2900,
    area: 156,
    website: "https://www.vill.tanohata.iwate.jp",
    summary: "北山崎の断崖を擁する海岸景勝地。酪農と体験型観光に力を入れる。",
  },
  {
    code: "03485",
    name: "普代村",
    prefecture: "岩手県",
    population: 2400,
    area: 69,
    website: "https://www.vill.fudai.iwate.jp",
    summary: "高さ15mの水門で津波被害を最小限に抑えた村。ウニ・アワビの産地。",
  },
  {
    code: "03501",
    name: "軽米町",
    prefecture: "岩手県",
    population: 8300,
    area: 246,
    website: "https://www.town.karumai.iwate.jp",
    summary: "雑穀と養鶏の町。大規模太陽光発電所の立地でも知られる。",
  },
  {
    code: "03503",
    name: "野田村",
    prefecture: "岩手県",
    population: 3900,
    area: 81,
    website: "https://www.vill.noda.iwate.jp",
    summary: "「のだ塩」と山ぶどうの産地。震災復興を経て移住支援に注力。",
  },
  {
    code: "03506",
    name: "九戸村",
    prefecture: "岩手県",
    population: 5000,
    area: 134,
    website: "https://www.vill.kunohe.iwate.jp",
    summary: "折爪岳のヒメボタルで知られる山あいの村。畜産と葉たばこが主産業。",
  },
  {
    code: "03507",
    name: "洋野町",
    prefecture: "岩手県",
    population: 14000,
    area: 303,
    website: "https://www.town.hirono.iwate.jp",
    summary: "「ウニ牧場」で知られる県北沿岸の町。酪農と水産が両輪。",
  },
  {
    code: "03524",
    name: "一戸町",
    prefecture: "岩手県",
    population: 11000,
    area: 300,
    website: "https://www.town.ichinohe.iwate.jp",
    summary: "御所野遺跡が世界文化遺産に登録された縄文のまち。",
  },
]

export const articles: Article[] = [
  {
    id: "art-001",
    title: "令和7年度 中小企業デジタル化推進補助金（第2次募集）",
    cityCode: "03201",
    cityName: "盛岡市",
    prefecture: "岩手県",
    category: "補助金",
    status: "締切間近",
    targets: ["企業"],
    publishedAt: "2026-07-15",
    deadline: "2026-08-31",
    summary:
      "市内中小企業のDX推進を目的に、ITシステム導入・業務効率化に要する費用の一部を補助します。補助率2/3、上限100万円。",
    body: `盛岡市では、市内中小企業のデジタルトランスフォーメーション（DX）を支援するため、ITシステム・ソフトウェア導入費用の一部を補助します。

【対象者】
市内に事業所を有する中小企業者（従業員300人以下）

【補助対象経費】
・クラウドサービス導入費用
・業務管理システム購入費
・セキュリティ対策費用

【補助率・上限額】
補助率：補助対象経費の2/3以内
上限額：100万円（1社1回限り）

【申請方法】
郵送または持参。申請書類は市HPよりダウンロード可能。`,
    sourceUrl: "https://www.city.morioka.iwate.jp/dx-support",
    amount: "上限100万円",
    tags: ["DX", "中小企業", "IT導入"],
  },
  {
    id: "art-002",
    title: "盛岡市総合体育館 空調設備改修工事 一般競争入札公告",
    cityCode: "03201",
    cityName: "盛岡市",
    prefecture: "岩手県",
    category: "入札・公募",
    status: "募集中",
    targets: ["企業"],
    publishedAt: "2026-08-01",
    deadline: "2026-08-22",
    summary:
      "盛岡市総合体育館の空調設備改修工事について一般競争入札を実施します。予定価格は5,800万円（税込）。",
    body: `盛岡市では、下記工事について一般競争入札を実施します。

【工事名】
盛岡市総合体育館空調設備改修工事

【工事場所】
盛岡市青山三丁目1番地

【工期】
契約日の翌日から令和8年2月28日まで

【予定価格】
58,000,000円（税込）

【参加資格】
・岩手県内に本店を有すること
・建設業許可「管工事業」の特定または一般建設業許可を有すること
・令和5・6年度岩手県建設工事請負業者資格者名簿に登載されていること`,
    sourceUrl: "https://www.city.morioka.iwate.jp/bid/2026-0801",
    amount: "5,800万円（予定価格）",
    tags: ["建設", "設備工事", "体育館"],
  },
  {
    id: "art-003",
    title: "第45回 盛岡さんさ踊り ボランティアスタッフ募集",
    cityCode: "03201",
    cityName: "盛岡市",
    prefecture: "岩手県",
    category: "募集",
    status: "募集中",
    targets: ["個人"],
    publishedAt: "2026-07-01",
    deadline: "2026-07-25",
    summary:
      "8月1〜4日開催の盛岡さんさ踊りにて、会場設営・案内誘導・清掃を行うボランティアスタッフを募集しています。",
    body: `東北三大祭りのひとつ「盛岡さんさ踊り」のボランティアスタッフを募集します。

【活動日時】
令和8年8月1日（土）〜4日（火）
各日15:00〜21:30（予定）

【活動内容】
・会場設営・撤去
・来場者案内・誘導
・ゴミ収集・清掃活動

【応募資格】
高校生以上（未成年者は保護者の承認が必要）

【特典】
さんさ踊りオリジナルTシャツ・記念品を贈呈`,
    sourceUrl: "https://www.city.morioka.iwate.jp/sansa-volunteer",
    tags: ["ボランティア", "祭り", "さんさ踊り"],
  },
  {
    id: "art-004",
    title: "令和7年度 子育て世帯住宅リフォーム補助金",
    cityCode: "03205",
    cityName: "花巻市",
    prefecture: "岩手県",
    category: "補助金",
    status: "募集中",
    targets: ["子育て世帯"],
    publishedAt: "2026-06-01",
    deadline: "2026-10-31",
    summary:
      "18歳未満の子を持つ世帯が市内業者を利用してリフォームする場合、費用の一部（上限30万円）を補助します。",
    body: `花巻市では子育て世帯の住環境改善を支援するため、住宅リフォーム費用の一部を補助します。

【対象者】
18歳未満の子と同居する世帯で、市内に住民登録があること

【補助対象工事】
・子ども部屋の新設・改修
・バリアフリー改修
・省エネ改修（断熱・太陽光等）

【補助率・上限額】
補助率：補助対象工事費の1/2以内
上限額：30万円`,
    sourceUrl: "https://www.city.hanamaki.iwate.jp/reform",
    amount: "上限30万円",
    tags: ["住宅", "子育て", "リフォーム"],
  },
  {
    id: "art-005",
    title: "北上市立中央図書館 指定管理者募集（令和9年度〜）",
    cityCode: "03206",
    cityName: "北上市",
    prefecture: "岩手県",
    category: "入札・公募",
    status: "募集中",
    targets: ["企業", "団体"],
    publishedAt: "2026-08-05",
    deadline: "2026-09-19",
    summary:
      "北上市立中央図書館の令和9年4月からの指定管理者を公募します。指定期間は5年間。",
    body: `北上市では、北上市立中央図書館の管理・運営を行う指定管理者を公募します。

【施設概要】
北上市立中央図書館（延床面積約4,200㎡、蔵書数約33万冊）

【指定期間】
令和9年4月1日〜令和14年3月31日（5年間）

【応募資格】
・法人格を有すること（共同体での応募可）
・図書館の管理・運営実績があること

【スケジュール】
9月19日 申請書類締切
10月下旬 プレゼンテーション審査
11月 指定管理者候補選定・議会議決`,
    sourceUrl: "https://www.city.kitakami.iwate.jp/library-shitei",
    tags: ["指定管理", "図書館", "公募"],
  },
  {
    id: "art-006",
    title: "宮古市 移住定住促進補助金（UIJターン）",
    cityCode: "03202",
    cityName: "宮古市",
    prefecture: "岩手県",
    category: "補助金",
    status: "募集中",
    targets: ["個人"],
    publishedAt: "2026-04-01",
    deadline: "2027-03-31",
    summary:
      "都市部から宮古市へ移住する方に最大100万円を補助。テレワーク移住の場合は加算あり。",
    body: `宮古市では、UIJターンによる移住・定住を促進するため、移住者に補助金を交付します。

【対象者】
・転入前に1年以上、東京圏または政令指定都市等に居住していた方
・転入後、市内に継続して5年以上居住する意思のある方

【補助額】
単身：50万円
世帯：100万円
18歳未満の子1人につき加算：30万円
テレワーク移住加算：50万円`,
    sourceUrl: "https://www.city.miyako.iwate.jp/iju",
    amount: "最大100万円＋加算",
    tags: ["移住", "UIJターン", "テレワーク"],
  },
  {
    id: "art-007",
    title: "一関市 農業経営基盤強化資金利子補給補助金",
    cityCode: "03209",
    cityName: "一関市",
    prefecture: "岩手県",
    category: "補助金",
    status: "募集中",
    targets: ["農業者"],
    publishedAt: "2026-07-20",
    deadline: "2026-09-30",
    summary:
      "農業経営の基盤強化のために借り入れた資金の利子の一部を補給します。認定農業者が対象。",
    body: `一関市では、農業経営の基盤強化を促進するため、「農業経営基盤強化資金」に係る利子補給を行います。

【対象者】
一関市内の認定農業者（法人含む）

【対象資金】
農業経営基盤強化資金（スーパーL資金）

【補給率・上限】
金融機関の貸出金利から0.5%を差し引いた率を補給（上限：借入額の年0.5%）`,
    sourceUrl: "https://www.city.ichinoseki.iwate.jp/nogyo-shikin",
    tags: ["農業", "認定農業者", "融資"],
  },
  {
    id: "art-008",
    title: "遠野ふるさとまつり2026 出店者・出演団体募集",
    cityCode: "03208",
    cityName: "遠野市",
    prefecture: "岩手県",
    category: "イベント",
    status: "締切間近",
    targets: ["個人", "団体", "企業"],
    publishedAt: "2026-07-10",
    deadline: "2026-08-20",
    summary:
      "9月開催「遠野ふるさとまつり2026」の出店者（飲食・物販）と民俗芸能出演団体を募集します。",
    body: `遠野市では「遠野ふるさとまつり2026」への参加者を募集しています。

【開催日時】
令和8年9月19日（土）・20日（日）
両日 10:00〜17:00

【会場】
遠野市土淵町土淵 遠野ふるさと村

【募集区分】
①出店者（飲食・農産物・物販）：30区画
②民俗芸能出演団体：10団体

【参加費】
出店：1区画 3,000円
出演：無料（交通費の一部補助あり）`,
    sourceUrl: "https://www.city.tono.iwate.jp/furusato-matsuri",
    tags: ["まつり", "出店", "民俗芸能"],
  },
  {
    id: "art-009",
    title: "久慈市 空き家バンク登録物件 売買・賃貸 募集",
    cityCode: "03207",
    cityName: "久慈市",
    prefecture: "岩手県",
    category: "募集",
    status: "募集中",
    targets: ["個人"],
    publishedAt: "2026-05-01",
    deadline: null,
    summary:
      "久慈市空き家バンクへの登録物件（売買・賃貸）を随時募集しています。登録・利用ともに無料。",
    body: `久慈市では移住促進・空き家対策として「空き家バンク」を運営しています。

【登録対象】
市内の空き家・空き地（農地を除く）で、所有者が売却・賃貸を希望するもの

【登録・利用料】
無料

【サポート内容】
・物件情報の市HP掲載
・移住希望者とのマッチング支援
・改修費用の補助制度（別途あり）`,
    sourceUrl: "https://www.city.kuji.iwate.jp/akiya-bank",
    tags: ["空き家", "移住", "バンク"],
  },
  {
    id: "art-010",
    title: "大船渡市 水産加工業者向け 省エネ設備導入補助金",
    cityCode: "03203",
    cityName: "大船渡市",
    prefecture: "岩手県",
    category: "補助金",
    status: "募集中",
    targets: ["企業"],
    publishedAt: "2026-08-10",
    deadline: "2026-11-14",
    summary:
      "水産加工施設における冷凍・冷蔵設備の省エネ化に要する費用を補助。補助率1/2、上限200万円。",
    body: `大船渡市では水産加工業の経営基盤強化と脱炭素化を支援するため、省エネ設備の導入費用を補助します。

【対象者】
市内に事業所を有する水産加工業者

【補助対象設備】
・高効率冷凍・冷蔵設備
・LED照明設備
・インバータ制御コンプレッサー

【補助率・上限額】
補助率：補助対象経費の1/2以内
上限額：200万円`,
    sourceUrl: "https://www.city.ofunato.iwate.jp/suisan-shoen",
    amount: "上限200万円",
    tags: ["水産", "省エネ", "冷凍設備"],
  },
  {
    id: "art-011",
    title: "盛岡市 令和8年度 幼稚園・保育所等入所（園）申込み案内",
    cityCode: "03201",
    cityName: "盛岡市",
    prefecture: "岩手県",
    category: "子育て",
    status: "準備中",
    targets: ["子育て世帯"],
    publishedAt: "2026-08-15",
    deadline: "2026-10-31",
    summary:
      "令和8年4月入所に向けた保育所・幼稚園・認定こども園等の申込み受付を10月1日より開始します。",
    body: `令和8年4月からの保育施設等への入所・入園申込みについてお知らせします。

【申込み期間】
令和8年10月1日（水）〜10月31日（金）

【申込み方法】
保育施設等利用申込書を各保育施設または市こども未来課へ提出

【対象施設】
認可保育所・幼稚園・認定こども園・小規模保育事業所 等（市内156施設）`,
    sourceUrl: "https://www.city.morioka.iwate.jp/kodomomirai/hoiku",
    tags: ["保育", "幼稚園", "申込み"],
  },
  {
    id: "art-012",
    title: "花巻温泉郷 観光コンテンツ造成事業者公募",
    cityCode: "03205",
    cityName: "花巻市",
    prefecture: "岩手県",
    category: "入札・公募",
    status: "募集中",
    targets: ["企業", "団体"],
    publishedAt: "2026-08-12",
    deadline: "2026-09-05",
    summary:
      "宮沢賢治ゆかりの地・花巻温泉郷を活用した体験型観光コンテンツの企画・実施事業者を公募します。",
    body: `花巻市では、花巻温泉郷の誘客促進を目的として、体験型観光コンテンツを造成・提供する事業者を公募します。

【事業内容】
宮沢賢治の世界観や花巻の自然・文化を活かした体験プログラムの企画・実施

【委託料】
500万円以内（税込）

【事業期間】
契約締結日〜令和9年3月31日

【応募資格】
観光コンテンツの企画・運営実績を有する法人または団体`,
    sourceUrl: "https://www.city.hanamaki.iwate.jp/kanko-content",
    amount: "500万円以内",
    tags: ["観光", "宮沢賢治", "体験コンテンツ"],
  },
  {
    id: "art-013",
    title: "御所野遺跡 世界遺産登録記念 縄文文化企画展の開催",
    cityCode: "03524",
    cityName: "一戸町",
    prefecture: "岩手県",
    category: "文化",
    status: "募集中",
    targets: ["個人", "団体"],
    publishedAt: "2026-08-16",
    deadline: "2026-10-31",
    summary:
      "世界文化遺産・御所野遺跡の出土品を中心に、北海道・北東北の縄文遺跡群を紹介する企画展を開催します。",
    body: `一戸町では、御所野遺跡の世界文化遺産登録を記念し、縄文文化をテーマとした企画展を開催します。

【会期】
令和8年9月1日（火）〜令和8年10月31日（土）

【会場】
御所野縄文博物館 企画展示室

【観覧料】
一般 300円／高校生以下 無料

【関連事業】
土器づくり体験（要事前申込・各回20名）、専門家による解説会を会期中に実施します。`,
    sourceUrl: "https://www.town.ichinohe.iwate.jp/goshono-exhibition",
    tags: ["世界遺産", "縄文", "企画展"],
  },
  {
    id: "art-014",
    title:
      "第3次盛岡市総合計画 中間見直し案に対する意見募集（パブリックコメント）",
    cityCode: "03201",
    cityName: "盛岡市",
    prefecture: "岩手県",
    category: "政策",
    status: "締切間近",
    targets: ["個人", "企業", "団体"],
    publishedAt: "2026-08-14",
    deadline: "2026-08-28",
    summary:
      "今後5年間のまちづくりの方向性を示す総合計画の中間見直し案について、市民のみなさまからご意見を募集します。",
    body: `盛岡市では、第3次盛岡市総合計画の中間見直しにあたり、素案に対する意見を募集します。

【募集期間】
令和8年8月14日（金）〜令和8年8月28日（金）必着

【対象】
市内に居住・通勤・通学する方、市内に事業所を有する法人・団体

【提出方法】
電子申請フォーム、郵送、持参のいずれか

【資料の閲覧場所】
市役所本庁舎、各支所、市立図書館、市公式サイト

いただいたご意見は、個人が特定されない形で概要と市の考え方を公表します。`,
    sourceUrl: "https://www.city.morioka.iwate.jp/sogokeikaku-pubcom",
    tags: ["総合計画", "パブリックコメント", "まちづくり"],
  },
  {
    id: "art-015",
    title: "遠野物語発刊記念 語り部育成講座 受講生募集",
    cityCode: "03208",
    cityName: "遠野市",
    prefecture: "岩手県",
    category: "文化",
    status: "募集中",
    targets: ["個人"],
    publishedAt: "2026-08-08",
    deadline: "2026-09-12",
    summary:
      "遠野に伝わる民話を次の世代へ伝える語り部を育成する連続講座です。全8回、初心者も参加できます。",
    body: `遠野市では、民話の語り部を育成する連続講座の受講生を募集します。

【日程】
令和8年10月〜令和9年2月（原則第2土曜日・全8回）

【会場】
遠野市民センター 研修室

【定員】
20名（応募多数の場合は選考）

【受講料】
3,000円（テキスト代を含む）

【対象】
市内外を問わず、修了後に語り部として活動する意欲のある方`,
    sourceUrl: "https://www.city.tono.iwate.jp/kataribe-koza",
    tags: ["遠野物語", "民話", "人材育成"],
  },
]

export const getCityByCode = (code: string) =>
  municipalities.find((m) => m.code === code)

export const getArticlesByCity = (code: string) =>
  articles.filter((a) => a.cityCode === code)

export const getArticleById = (id: string) => articles.find((a) => a.id === id)

/** 分野バッジ。緑を軸にした同系色の濃淡＋土色で、左のバーで分野を見分ける。 */
export const categoryColors: Record<Category, {
  bg: string
  text: string
  bar: string
}> = {
  イベント: { bg: "bg-accent-soft", text: "text-accent-ink", bar: "bg-accent" },
  補助金: { bg: "bg-primary-soft", text: "text-primary", bar: "bg-primary" },
  入札・公募: { bg: "bg-ink-bg/10", text: "text-ink-bg", bar: "bg-ink-bg" },
  募集: { bg: "bg-sage-soft", text: "text-sage", bar: "bg-sage" },
  文化: { bg: "bg-clay-soft", text: "text-clay", bar: "bg-clay" },
  子育て: { bg: "bg-gold-soft", text: "text-gold", bar: "bg-gold" },
  政策: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    bar: "bg-border-strong",
  },
}

export const statusColors: Record<Status, { bg: string; text: string }> = {
  募集中: { bg: "bg-primary-soft", text: "text-primary" },
  締切間近: { bg: "bg-alert-soft", text: "text-alert" },
  終了: { bg: "bg-muted", text: "text-faint-foreground" },
  準備中: { bg: "bg-sage-soft", text: "text-sage" },
}

/** 仕様書「入札・公募：条件変更の履歴」用。案件公開後に変わった条件を記録する。 */
export interface Revision {
  date: string
  field: string
  before: string
  after: string
}

export const revisions: Record<string, Revision[]> = {
  "art-002": [
    {
      date: "2026-08-12",
      field: "提出期限",
      before: "2026-08-25 17:00",
      after: "2026-09-01 17:00",
    },
    {
      date: "2026-08-12",
      field: "参加資格",
      before: "県内に本店を有する者",
      after: "県内に本店または営業所を有する者",
    },
  ],
  "art-005": [
    {
      date: "2026-08-05",
      field: "予定価格",
      before: "非公表",
      after: "12,400,000円（税抜）",
    },
  ],
  "art-012": [
    {
      date: "2026-08-14",
      field: "現場説明会",
      before: "2026-08-20 実施",
      after: "実施なし（質問は書面で受付）",
    },
  ],
}

export const getRevisions = (articleId: string): Revision[] =>
  revisions[articleId] ?? []

export const daysUntilDeadline = (deadline: string | null): number | null => {
  if (!deadline) return null
  const now = new Date("2026-08-19")
  const d = new Date(deadline)
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
