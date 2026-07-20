export type Confidence = "高" | "中" | "低";
export type MatchStatus = "confirmed-context" | "prediction";

export type TeamSnapshot = {
  name: string;
  shortName: string;
  keyPlayers: string[];
  rankBand: string;
  form: string;
  fitness: string;
  tacticalProfile: string;
  sentiment: string;
};

export type StarTimelineEvent = {
  year: string;
  title: string;
  detail: string;
};

export type StarProfile = {
  name: string;
  role: string;
  wikiTitle: string;
  summary: string;
  timeline: StarTimelineEvent[];
};

export type EvidenceItem = {
  label: string;
  left: string;
  right: string;
  note: string;
  advantage: "left" | "right" | "even";
};

export type ActualMatchResult = {
  score: string;
  winner: string;
  method: "常规时间" | "加时" | "点球";
  completedAt: string;
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string;
  externalId?: string;
};

export type LivePrediction = {
  score: string;
  winner: string;
  method: "常规时间" | "加时" | "点球";
  confidence: Confidence;
  generatedAt: string;
  modelVersion: string;
  rationale: string[];
  left?: TeamSnapshot;
  right?: TeamSnapshot;
};

export type PredictionMatch = {
  id: string;
  round: string;
  date: string;
  status: MatchStatus;
  stageNote: string;
  left: TeamSnapshot;
  right: TeamSnapshot;
  predictedScore: string;
  predictedWinner: string;
  method: "常规时间" | "加时" | "点球";
  confidence: Confidence;
  tags: string[];
  rationale: string[];
  risks: string[];
  evidence: EvidenceItem[];
  actualResult?: ActualMatchResult;
  livePrediction?: LivePrediction;
  originalPrediction?: {
    score: string;
    winner: string;
    method: "常规时间" | "加时" | "点球";
  };
};

export type BracketRound = {
  label: string;
  window: string;
  matches: Array<{
    id: string;
    matchId: string;
    left: string;
    right: string;
    score: string;
    winner: string;
    confidence: Confidence;
  }>;
};

const teams: Record<string, TeamSnapshot> = {
  brazil: {
    name: "巴西",
    shortName: "BRA",
    keyPlayers: ["维尼修斯", "罗德里戈", "吉马良斯"],
    rankBand: "世界前列",
    form: "进攻端稳定，小组赛后段提速",
    fitness: "主力框架完整，边路轮换充足",
    tacticalProfile: "边路爆点 + 中前场压迫 + 快速二次进攻",
    sentiment: "夺冠呼声最高之一，舆论压力也最高"
  },
  france: {
    name: "法国",
    shortName: "FRA",
    keyPlayers: ["姆巴佩", "格列兹曼", "楚阿梅尼"],
    rankBand: "世界前列",
    form: "淘汰赛首轮 3-0 瑞典，效率和防守都在线",
    fitness: "阵容深度极强，个别位置需关注疲劳",
    tacticalProfile: "转换速度、禁区冲击和替补火力突出",
    sentiment: "媒体普遍视为最稳热门之一"
  },
  spain: {
    name: "西班牙",
    shortName: "ESP",
    keyPlayers: ["罗德里", "亚马尔", "佩德里"],
    rankBand: "世界前列",
    form: "控球质量稳定，32 强 3-0 奥地利",
    fitness: "中前场选择丰富，防线抗冲击仍需验证",
    tacticalProfile: "控球压迫 + 肋部渗透 + 高位夺回",
    sentiment: "技术流拥趸强，强强战抗转换被反复讨论"
  },
  argentina: {
    name: "阿根廷",
    shortName: "ARG",
    keyPlayers: ["梅西", "劳塔罗", "麦卡利斯特"],
    rankBand: "世界前列",
    form: "大赛经验强，节奏控制仍是核心优势",
    fitness: "老将经验与年轻跑动之间需要平衡",
    tacticalProfile: "中场控节奏 + 定位球 + 淘汰赛管理",
    sentiment: "球迷信心高，但对体能曲线有担忧"
  },
  england: {
    name: "英格兰",
    shortName: "ENG",
    keyPlayers: ["贝林厄姆", "凯恩", "福登"],
    rankBand: "世界前列",
    form: "防守稳定，进攻端仍偏谨慎",
    fitness: "豪华阵容但磨合与用人选择受关注",
    tacticalProfile: "定位球、边后卫推进、禁区二点球",
    sentiment: "热度高，舆论对临场保守有质疑"
  },
  portugal: {
    name: "葡萄牙",
    shortName: "POR",
    keyPlayers: ["C罗", "B.费尔南德斯", "莱奥", "B.席尔瓦"],
    rankBand: "世界前列",
    form: "32 强 2-1 克罗地亚，个人能力仍很强",
    fitness: "攻击线深度好，防线回追压力较大",
    tacticalProfile: "边路单挑 + 远射 + 前场自由换位",
    sentiment: "明星效应明显，强强战稳定性受讨论"
  },
  belgium: {
    name: "比利时",
    shortName: "BEL",
    keyPlayers: ["德布劳内", "卢卡库", "多库"],
    rankBand: "强队区间",
    form: "进攻天赋仍在，防守速度是隐患",
    fitness: "核心球员健康程度决定上限",
    tacticalProfile: "中路推进 + 反击直塞 + 禁区终结",
    sentiment: "舆论认为仍有爆冷强队能力"
  },
  usa: {
    name: "美国",
    shortName: "USA",
    keyPlayers: ["普利西奇", "麦肯尼", "雷纳"],
    rankBand: "中上游",
    form: "32 强 2-0 波黑，主场势能明显",
    fitness: "跑动和对抗充足，经验深度略弱于豪门",
    tacticalProfile: "高强度跑动 + 边路推进 + 主场节奏",
    sentiment: "本土热度高，市场预期升温"
  },
  morocco: {
    name: "摩洛哥",
    shortName: "MAR",
    keyPlayers: ["阿什拉夫", "齐耶赫", "阿姆拉巴特"],
    rankBand: "中上游",
    form: "防守组织可靠，淘汰赛韧性强",
    fitness: "主力依赖度较高，边路强点健康关键",
    tacticalProfile: "低位纪律 + 反击速度 + 防空保护",
    sentiment: "延续大赛黑马叙事，支持度很高"
  },
  canada: {
    name: "加拿大",
    shortName: "CAN",
    keyPlayers: ["阿方索·戴维斯", "戴维", "欧斯塔基奥"],
    rankBand: "中游",
    form: "32 强 1-0 南非，主场推进强",
    fitness: "核心边路速度好，阵容厚度有限",
    tacticalProfile: "边路冲刺 + 主场压迫 + 快速转换",
    sentiment: "主场情绪热烈，冷门期待上升"
  },
  norway: {
    name: "挪威",
    shortName: "NOR",
    keyPlayers: ["哈兰德", "厄德高", "瑟洛特"],
    rankBand: "中上游",
    form: "锋线威胁巨大，比赛波动也明显",
    fitness: "锋线依赖高，防守横移需保护",
    tacticalProfile: "强力中锋 + 直塞冲击 + 定位球",
    sentiment: "球迷相信能制造强队麻烦"
  },
  mexico: {
    name: "墨西哥",
    shortName: "MEX",
    keyPlayers: ["希门尼斯", "洛萨诺", "阿尔瓦雷斯"],
    rankBand: "中上游",
    form: "主场氛围强，对抗和节奏感好",
    fitness: "中后场消耗较大，进攻终结波动",
    tacticalProfile: "高节奏逼抢 + 边路传中 + 情绪动员",
    sentiment: "主场加成巨大，舆论期待爆冷英格兰"
  },
  switzerland: {
    name: "瑞士",
    shortName: "SUI",
    keyPlayers: ["扎卡", "阿坎吉", "索默"],
    rankBand: "中上游",
    form: "32 强 2-0 阿尔及利亚，组织纪律稳定",
    fitness: "主力结构成熟，冲击力不如南美球队",
    tacticalProfile: "紧凑阵型 + 中场拦截 + 稳定出球",
    sentiment: "被视为很难被轻松击穿的对手"
  },
  colombia: {
    name: "哥伦比亚",
    shortName: "COL",
    keyPlayers: ["路易斯·迪亚斯", "J.罗德里格斯", "莱尔马"],
    rankBand: "中上游",
    form: "近期进攻质量好，定位球威胁突出",
    fitness: "前场核心状态是胜负杠杆",
    tacticalProfile: "边路推进 + 定位球 + 身体对抗",
    sentiment: "南美球迷看好继续上行"
  },
  ghana: {
    name: "加纳",
    shortName: "GHA",
    keyPlayers: ["库杜斯", "托马斯", "伊尼亚基·威廉姆斯"],
    rankBand: "中游",
    form: "转换进攻有爆点，防守稳定性一般",
    fitness: "年轻球员冲击力强，经验略欠",
    tacticalProfile: "纵向推进 + 反击速度 + 对抗强度",
    sentiment: "冷门呼声存在，但市场信心有限"
  },
  egypt: {
    name: "埃及",
    shortName: "EGY",
    keyPlayers: ["萨拉赫", "特雷泽盖", "埃尔内尼"],
    rankBand: "中游",
    form: "防守韧性强，反击效率是生命线",
    fitness: "锋线核心牵制力大，阵容厚度一般",
    tacticalProfile: "低位防守 + 快速反击 + 定位球",
    sentiment: "舆论认为有机会从五五开对局突围"
  },
  australia: {
    name: "澳大利亚",
    shortName: "AUS",
    keyPlayers: ["古德温", "赫鲁斯蒂奇", "苏塔"],
    rankBand: "中游",
    form: "身体对抗稳定，阵地战创造力偏少",
    fitness: "整体跑动可靠，前场变化不足",
    tacticalProfile: "防空 + 直接打法 + 定位球",
    sentiment: "被看作硬仗型球队，冷门空间有限"
  },
  capeverde: {
    name: "佛得角",
    shortName: "CPV",
    keyPlayers: ["贝贝", "若万·卡布拉尔", "罗伯托·洛佩斯"],
    rankBand: "黑马区间",
    form: "历史性突破，防守专注度高",
    fitness: "阵容深度和大赛经验是短板",
    tacticalProfile: "低位收缩 + 反击寻找单点",
    sentiment: "中立球迷支持度高，压力相对较小"
  },
  paraguay: {
    name: "巴拉圭",
    shortName: "PAR",
    keyPlayers: ["阿尔米隆", "恩西索", "戈麦斯"],
    rankBand: "中游",
    form: "淘汰赛韧性强，进球产量不高",
    fitness: "防线对抗好，前场缺少稳定破局点",
    tacticalProfile: "压缩空间 + 定位球 + 慢节奏消耗",
    sentiment: "外界普遍视为法国面前的挑战者"
  },
  southafrica: {
    name: "南非",
    shortName: "RSA",
    keyPlayers: ["莫科纳", "威廉姆斯", "兹瓦内"],
    rankBand: "中游",
    form: "32 强 0-1 不敌加拿大，防守韧性仍在",
    fitness: "整体对抗可靠，前场终结不足",
    tacticalProfile: "紧凑防线 + 二点球争夺 + 反击",
    sentiment: "已被淘汰，但防守表现获得认可"
  },
  japan: {
    name: "日本",
    shortName: "JPN",
    keyPlayers: ["久保建英", "三笘薰", "远藤航"],
    rankBand: "中上游",
    form: "32 强 1-2 不敌巴西，控球与跑动质量不错",
    fitness: "中前场技术点充足，身体对抗吃亏",
    tacticalProfile: "高节奏传切 + 边路组合 + 前场压迫",
    sentiment: "虽被淘汰，但被认为是最有质量的亚洲球队之一"
  },
  germany: {
    name: "德国",
    shortName: "GER",
    keyPlayers: ["穆西亚拉", "维尔茨", "基米希"],
    rankBand: "世界前列",
    form: "32 强点球不敌巴拉圭，阵地战效率受质疑",
    fitness: "中前场天赋强，淘汰赛抗压波动明显",
    tacticalProfile: "控球推进 + 肋部渗透 + 高位压迫",
    sentiment: "出局引发舆论争议"
  },
  netherlands: {
    name: "荷兰",
    shortName: "NED",
    keyPlayers: ["范戴克", "加克波", "德容"],
    rankBand: "强队区间",
    form: "32 强点球不敌摩洛哥，常规时间防守稳定",
    fitness: "防线成熟，进攻端连续性不足",
    tacticalProfile: "三中卫/四后卫切换 + 边翼推进 + 高空球",
    sentiment: "被视为被摩洛哥韧性拖垮的强队"
  },
  ivorycoast: {
    name: "科特迪瓦",
    shortName: "CIV",
    keyPlayers: ["凯西", "阿丁格拉", "哈勒"],
    rankBand: "中游",
    form: "32 强 1-2 不敌挪威，身体冲击力强",
    fitness: "对抗能力好，防线横移有隐患",
    tacticalProfile: "身体对抗 + 边路爆点 + 定位球",
    sentiment: "被认为具备制造麻烦的能力"
  },
  sweden: {
    name: "瑞典",
    shortName: "SWE",
    keyPlayers: ["伊萨克", "库卢塞夫斯基", "林德洛夫"],
    rankBand: "中上游",
    form: "32 强 0-3 不敌法国，防线被转换打穿",
    fitness: "锋线能力强，但整体速度不足",
    tacticalProfile: "中锋支点 + 边路传中 + 防空",
    sentiment: "出局主要被归因于法国强度过高"
  },
  ecuador: {
    name: "厄瓜多尔",
    shortName: "ECU",
    keyPlayers: ["凯塞多", "恩纳·瓦伦西亚", "因卡皮耶"],
    rankBand: "中游",
    form: "32 强 0-2 不敌墨西哥，中场对抗尚可",
    fitness: "中场硬度好，进攻端变化不足",
    tacticalProfile: "中场绞杀 + 纵向推进 + 身体对抗",
    sentiment: "被认为输在主场氛围和终结效率"
  },
  drcongo: {
    name: "民主刚果",
    shortName: "COD",
    keyPlayers: ["巴坎布", "万-比萨卡", "维萨"],
    rankBand: "中游",
    form: "32 强 1-2 不敌英格兰，转换阶段有威胁",
    fitness: "身体条件好，比赛管理略欠",
    tacticalProfile: "反击速度 + 对抗 + 低位防守",
    sentiment: "虽败但展现了冷门潜力"
  },
  senegal: {
    name: "塞内加尔",
    shortName: "SEN",
    keyPlayers: ["马内", "库利巴利", "萨尔"],
    rankBand: "中上游",
    form: "32 强 2-3 不敌比利时，进攻端有火力",
    fitness: "主力经验丰富，防线速度承压",
    tacticalProfile: "边路冲刺 + 中路支点 + 身体对抗",
    sentiment: "被视为出局球队里最有攻击质量之一"
  },
  bosnia: {
    name: "波黑",
    shortName: "BIH",
    keyPlayers: ["哲科", "皮亚尼奇", "德米罗维奇"],
    rankBand: "中游",
    form: "32 强 0-2 不敌美国，被主场节奏压制",
    fitness: "经验足，整体速度偏慢",
    tacticalProfile: "中锋支点 + 阵地战传控 + 定位球",
    sentiment: "舆论认为输在比赛强度"
  },
  austria: {
    name: "奥地利",
    shortName: "AUT",
    keyPlayers: ["阿拉巴", "萨比策", "莱默尔"],
    rankBand: "中上游",
    form: "32 强 0-3 不敌西班牙，高压体系被控球破解",
    fitness: "跑动强度高，但防线被持续拉扯",
    tacticalProfile: "高压逼抢 + 快速转移 + 中场覆盖",
    sentiment: "被认为碰到风格克制"
  },
  croatia: {
    name: "克罗地亚",
    shortName: "CRO",
    keyPlayers: ["莫德里奇", "格瓦迪奥尔", "科瓦契奇"],
    rankBand: "中上游",
    form: "32 强 1-2 不敌葡萄牙，经验仍强",
    fitness: "老将经验突出，体能后程承压",
    tacticalProfile: "中场控节奏 + 低失误传导 + 定位球",
    sentiment: "被认为已经完成高质量谢幕战"
  },
  algeria: {
    name: "阿尔及利亚",
    shortName: "ALG",
    keyPlayers: ["马赫雷斯", "本纳塞尔", "古伊里"],
    rankBand: "中游",
    form: "32 强 0-2 不敌瑞士，进攻效率不足",
    fitness: "边路技术强，整体推进受限",
    tacticalProfile: "边路内切 + 中场传导 + 反击",
    sentiment: "被认为输给瑞士的稳定性"
  }
};

const starProfilesByTeam: Record<string, StarProfile[]> = {
  ALG: [
    { name: "马赫雷斯", role: "边锋 / 创造核心", wikiTitle: "Riyad Mahrez", summary: "阿尔及利亚最具国际知名度的攻击点，左脚内切和定位球是破局入口。", timeline: [
      { year: "2016", title: "英超冠军与 PFA 年度最佳", detail: "莱斯特城奇迹赛季核心之一，个人获得英格兰 PFA 年度最佳球员。" },
      { year: "2019", title: "非洲杯冠军", detail: "随阿尔及利亚夺得非洲杯，并在淘汰赛贡献关键球。" },
      { year: "2023", title: "曼城三冠王成员", detail: "随曼城获得英超、足总杯、欧冠三冠荣誉。" }
    ] }
  ],
  ARG: [
    { name: "梅西", role: "前场自由人 / 节奏核心", wikiTitle: "Lionel Messi", summary: "阿根廷进攻组织和关键球终结的精神核心，淘汰赛管理能力极强。", timeline: [
      { year: "2009-15", title: "欧冠与金球巅峰", detail: "多次获得欧冠冠军与金球奖，建立历史级进攻统治力。" },
      { year: "2021", title: "美洲杯冠军", detail: "带领阿根廷夺得美洲杯，完成国家队重大冠军突破。" },
      { year: "2022", title: "世界杯冠军", detail: "作为队长率阿根廷夺冠，并获得世界杯金球奖。" }
    ] },
    { name: "劳塔罗", role: "中锋 / 禁区终结点", wikiTitle: "Lautaro Martínez", summary: "阿根廷锋线压迫和禁区终结的重要支点。", timeline: [
      { year: "2021", title: "美洲杯冠军", detail: "国家队冠军班底成员，提供锋线冲击。" },
      { year: "2022", title: "世界杯冠军", detail: "随阿根廷夺得世界杯，积累顶级淘汰赛经验。" },
      { year: "2024", title: "意甲 MVP 级赛季", detail: "在国际米兰夺冠赛季中保持高产输出。" }
    ] }
  ],
  AUS: [
    { name: "古德温", role: "边路推进 / 定位球", wikiTitle: "Craig Goodwin", summary: "澳大利亚左路传中、定位球和远射的重要来源。", timeline: [
      { year: "2016", title: "澳超冠军", detail: "随阿德莱德联夺得澳超总冠军。" },
      { year: "2022", title: "世界杯进球", detail: "在卡塔尔世界杯对法国打入进球。" },
      { year: "2023", title: "亚洲杯周期核心", detail: "继续作为澳大利亚边路主力之一。" }
    ] }
  ],
  AUT: [
    { name: "阿拉巴", role: "后场领袖 / 出球核心", wikiTitle: "David Alaba", summary: "奥地利队长级人物，能覆盖中卫、边卫和中场多个位置。", timeline: [
      { year: "2013", title: "拜仁三冠王", detail: "随拜仁获得欧冠、德甲、德国杯三冠。" },
      { year: "2022", title: "皇马欧冠冠军", detail: "加盟皇马后获得欧冠冠军。" },
      { year: "多次", title: "奥地利足球先生", detail: "长期被视为奥地利足球代表人物。" }
    ] }
  ],
  BEL: [
    { name: "德布劳内", role: "中场发动机 / 关键传球", wikiTitle: "Kevin De Bruyne", summary: "比利时最强创造者，直塞、转换和远射决定上限。", timeline: [
      { year: "2018", title: "世界杯季军", detail: "随比利时获得世界杯季军，黄金一代代表人物。" },
      { year: "2020", title: "PFA 年度最佳", detail: "以顶级创造力获得英格兰 PFA 年度最佳球员。" },
      { year: "2023", title: "曼城三冠王", detail: "作为中场核心随曼城赢得三冠王。" }
    ] },
    { name: "卢卡库", role: "中锋 / 禁区支点", wikiTitle: "Romelu Lukaku", summary: "国家队历史级射手，强对抗和门前终结仍是比利时武器。", timeline: [
      { year: "2018", title: "世界杯季军", detail: "比利时季军征程中的主要锋线威胁。" },
      { year: "2021", title: "意甲冠军", detail: "随国际米兰夺得意甲冠军并成为关键球员。" },
      { year: "长期", title: "比利时队史射手王", detail: "国家队进球纪录长期保持在历史前列。" }
    ] }
  ],
  BIH: [
    { name: "哲科", role: "中锋 / 队史旗帜", wikiTitle: "Edin Džeko", summary: "波黑最具代表性的中锋，支点、头球和禁区嗅觉仍有价值。", timeline: [
      { year: "2009", title: "德甲冠军", detail: "随沃尔夫斯堡获得德甲冠军。" },
      { year: "2012", title: "英超冠军", detail: "随曼城夺得英超冠军。" },
      { year: "长期", title: "波黑队史射手王", detail: "长期担任国家队进攻旗帜。" }
    ] }
  ],
  BRA: [
    { name: "维尼修斯", role: "左路爆点 / 决胜球", wikiTitle: "Vinícius Júnior", summary: "巴西最具爆破力的边路球星，一对一和纵深冲刺决定进攻天花板。", timeline: [
      { year: "2022", title: "欧冠决赛制胜球", detail: "帮助皇家马德里夺得欧冠冠军。" },
      { year: "2024", title: "再夺欧冠", detail: "继续以关键输出成为皇马欧冠核心。" },
      { year: "近年", title: "金球奖级别候选", detail: "凭俱乐部大赛表现进入世界顶级边锋行列。" }
    ] },
    { name: "罗德里戈", role: "多面前锋 / 淘汰赛后手", wikiTitle: "Rodrygo", summary: "能踢边路、影锋和中锋位，强强战中常有关键球。", timeline: [
      { year: "2022", title: "欧冠冠军", detail: "随皇马夺冠，并在淘汰赛阶段留下关键表现。" },
      { year: "2024", title: "欧冠冠军", detail: "继续作为皇马攻击群重要成员夺冠。" },
      { year: "国家队", title: "巴西锋线主力轮换", detail: "长期进入巴西前场核心选择。" }
    ] }
  ],
  CAN: [
    { name: "阿方索·戴维斯", role: "左路推进 / 速度核心", wikiTitle: "Alphonso Davies", summary: "加拿大最有爆点的球员，边路速度和推进能改变比赛节奏。", timeline: [
      { year: "2020", title: "拜仁三冠王", detail: "随拜仁获得欧冠、德甲、德国杯三冠。" },
      { year: "2022", title: "加拿大世界杯进球", detail: "打入加拿大男足世界杯历史性进球。" },
      { year: "多次", title: "加拿大年度最佳", detail: "长期是加拿大国家队门面人物。" }
    ] },
    { name: "戴维", role: "中锋 / 反击终结", wikiTitle: "Jonathan David", summary: "加拿大最稳定的终结点之一，擅长反击和禁区跑位。", timeline: [
      { year: "2021", title: "法甲冠军", detail: "随里尔打破巴黎长期统治夺得法甲冠军。" },
      { year: "长期", title: "国家队高产射手", detail: "加拿大锋线稳定进球来源。" },
      { year: "近年", title: "欧洲主流联赛高产", detail: "在法甲持续保持较高进球效率。" }
    ] }
  ],
  CIV: [
    { name: "凯西", role: "中场对抗 / 后插上", wikiTitle: "Franck Kessié", summary: "科特迪瓦中场的身体对抗、点球和后插上支点。", timeline: [
      { year: "2022", title: "意甲冠军", detail: "随 AC 米兰获得意甲冠军。" },
      { year: "2023", title: "西甲冠军", detail: "随巴塞罗那获得西甲冠军。" },
      { year: "2024", title: "非洲杯冠军", detail: "随科特迪瓦夺得非洲杯冠军。" }
    ] }
  ],
  COD: [
    { name: "巴坎布", role: "前锋 / 反击终结", wikiTitle: "Cédric Bakambu", summary: "民主刚果锋线经验点，擅长冲身后和把握转换机会。", timeline: [
      { year: "2015-18", title: "西甲高产阶段", detail: "在比利亚雷亚尔保持较高进球效率。" },
      { year: "2018", title: "非洲球员高身价转会", detail: "转会北京国安时成为非洲球员高额转会案例。" },
      { year: "国家队", title: "民主刚果锋线核心", detail: "长期承担国家队进攻责任。" }
    ] }
  ],
  COL: [
    { name: "路易斯·迪亚斯", role: "边锋 / 纵向冲击", wikiTitle: "Luis Díaz (footballer, born 1997)", summary: "哥伦比亚最有威胁的边路突破点，反击和单挑价值极高。", timeline: [
      { year: "2021", title: "美洲杯金靴并列", detail: "在美洲杯表现出色，成为南美瞩目的边锋。" },
      { year: "2022", title: "英格兰杯赛双冠", detail: "加盟利物浦后获得足总杯、联赛杯。" },
      { year: "国家队", title: "哥伦比亚进攻核心", detail: "持续承担国家队左路推进任务。" }
    ] },
    { name: "J.罗德里格斯", role: "前腰 / 定位球", wikiTitle: "James Rodríguez", summary: "大赛型前腰，传球、远射和定位球仍能决定低比分比赛。", timeline: [
      { year: "2014", title: "世界杯金靴", detail: "巴西世界杯打入 6 球，获得金靴奖。" },
      { year: "2016", title: "欧冠冠军", detail: "随皇家马德里获得欧冠冠军。" },
      { year: "2024", title: "美洲杯 MVP", detail: "以组织表现带领哥伦比亚打出强势赛事。" }
    ] }
  ],
  CPV: [
    { name: "贝贝", role: "前锋 / 远射点", wikiTitle: "Bebé (footballer)", summary: "佛得角经验型前场球员，远射和直接冲击是黑马局的变量。", timeline: [
      { year: "2010", title: "登陆曼联", detail: "职业生涯早期加盟曼联，获得国际关注。" },
      { year: "2014-23", title: "西葡联赛经验", detail: "长期在欧洲主流联赛体系中积累经验。" },
      { year: "国家队", title: "佛得角进攻老将", detail: "为国家队提供经验和前场硬度。" }
    ] }
  ],
  CRO: [
    { name: "莫德里奇", role: "中场节拍器 / 队长", wikiTitle: "Luka Modrić", summary: "克罗地亚黄金时代核心，控节奏和淘汰赛经验极强。", timeline: [
      { year: "2018", title: "世界杯金球奖", detail: "带领克罗地亚进入世界杯决赛并获得赛事金球。" },
      { year: "2018", title: "金球奖", detail: "打破梅罗长期垄断，获得金球奖。" },
      { year: "多次", title: "欧冠冠军", detail: "随皇家马德里多次夺得欧冠冠军。" }
    ] }
  ],
  ECU: [
    { name: "凯塞多", role: "中场拦截 / 推进", wikiTitle: "Moisés Caicedo", summary: "厄瓜多尔中场硬度和推进能力的核心。", timeline: [
      { year: "2021", title: "登陆英超", detail: "加盟布莱顿并逐步成为英超高关注中场。" },
      { year: "2023", title: "高额转会切尔西", detail: "以高身价转会成为厄瓜多尔代表性球星。" },
      { year: "国家队", title: "中场支柱", detail: "承担厄瓜多尔中场拦截和出球责任。" }
    ] }
  ],
  EGY: [
    { name: "萨拉赫", role: "右路核心 / 终结点", wikiTitle: "Mohamed Salah", summary: "埃及绝对核心，反击、点球和右路内切是最稳定武器。", timeline: [
      { year: "2018", title: "英超金靴", detail: "以破纪录级进球表现获得英超金靴。" },
      { year: "2019", title: "欧冠冠军", detail: "随利物浦夺得欧冠冠军。" },
      { year: "2020", title: "英超冠军", detail: "帮助利物浦获得英超冠军。" }
    ] }
  ],
  ENG: [
    { name: "贝林厄姆", role: "全能中场 / 后插上", wikiTitle: "Jude Bellingham", summary: "英格兰中场上限担当，推进、压迫和禁区终结兼具。", timeline: [
      { year: "2020", title: "英格兰成年队首秀", detail: "很早进入国家队体系。" },
      { year: "2023", title: "科帕奖", detail: "获得金球奖体系下的最佳年轻球员荣誉。" },
      { year: "2024", title: "欧冠冠军", detail: "随皇家马德里获得欧冠冠军。" }
    ] },
    { name: "凯恩", role: "中锋 / 回撤组织", wikiTitle: "Harry Kane", summary: "英格兰队史级射手，既能终结也能回撤串联。", timeline: [
      { year: "2018", title: "世界杯金靴", detail: "俄罗斯世界杯获得金靴奖。" },
      { year: "长期", title: "英格兰队史射手王", detail: "成为英格兰国家队历史最佳射手。" },
      { year: "多次", title: "英超金靴", detail: "长期保持英超顶级中锋产出。" }
    ] }
  ],
  ESP: [
    { name: "罗德里", role: "后腰 / 控场核心", wikiTitle: "Rodri (footballer, born 1996)", summary: "西班牙攻防平衡的中轴，控球、反抢和远射都能决定比赛。", timeline: [
      { year: "2023", title: "欧冠决赛制胜球", detail: "为曼城打入欧冠决赛制胜球，帮助球队三冠王。" },
      { year: "2023", title: "欧国联冠军", detail: "随西班牙获得欧国联冠军并获赛事最佳。" },
      { year: "2024", title: "欧洲杯 MVP", detail: "作为中场核心帮助西班牙夺得欧洲杯。" }
    ] },
    { name: "亚马尔", role: "边锋 / 少年爆点", wikiTitle: "Lamine Yamal", summary: "西班牙边路最具想象力的年轻攻击点。", timeline: [
      { year: "2023", title: "巴萨一线队突破", detail: "以超低年龄进入巴萨和西班牙主力视野。" },
      { year: "2024", title: "欧洲杯冠军", detail: "随西班牙夺冠并成为赛事焦点之一。" },
      { year: "2024", title: "最佳年轻球员", detail: "获得欧洲杯最佳年轻球员荣誉。" }
    ] }
  ],
  FRA: [
    { name: "姆巴佩", role: "前锋 / 转换核武器", wikiTitle: "Kylian Mbappé", summary: "法国最强冲击点，速度、射门和大赛终结能力决定冠军上限。", timeline: [
      { year: "2018", title: "世界杯冠军", detail: "随法国夺得世界杯，并在决赛进球。" },
      { year: "2022", title: "世界杯金靴", detail: "卡塔尔世界杯打入 8 球获得金靴。" },
      { year: "多次", title: "法甲最佳与冠军", detail: "长期在法甲保持统治级输出。" }
    ] },
    { name: "格列兹曼", role: "前腰 / 防守组织", wikiTitle: "Antoine Griezmann", summary: "法国前场连接和防守执行的隐形中枢。", timeline: [
      { year: "2016", title: "欧洲杯金靴", detail: "在法国欧洲杯获得金靴。" },
      { year: "2018", title: "世界杯冠军", detail: "作为核心攻击手帮助法国夺冠。" },
      { year: "2022", title: "世界杯亚军", detail: "以中场化角色再次帮助法国进入决赛。" }
    ] }
  ],
  GER: [
    { name: "穆西亚拉", role: "前腰 / 盘带破局", wikiTitle: "Jamal Musiala", summary: "德国最具灵感的前场攻击点，擅长小空间推进。", timeline: [
      { year: "2020", title: "拜仁欧冠冠军成员", detail: "很早进入拜仁冠军体系。" },
      { year: "2023", title: "德甲争冠关键球", detail: "末轮关键进球帮助拜仁夺得德甲。" },
      { year: "2024", title: "欧洲杯金靴并列", detail: "以进球表现成为德国新核心代表。" }
    ] },
    { name: "维尔茨", role: "前腰 / 传射核心", wikiTitle: "Florian Wirtz", summary: "德国创造力核心之一，传球视野和禁区前处理极强。", timeline: [
      { year: "2024", title: "勒沃库森不败德甲冠军", detail: "作为核心帮助勒沃库森夺得德甲。" },
      { year: "2024", title: "德国足球先生级表现", detail: "以俱乐部表现进入欧洲顶级中场讨论。" },
      { year: "国家队", title: "德国前场新轴心", detail: "承担德国进攻组织和终结连接。" }
    ] }
  ],
  GHA: [
    { name: "库杜斯", role: "攻击中场 / 转换爆点", wikiTitle: "Mohammed Kudus", summary: "加纳最具突破和射门威胁的前场核心。", timeline: [
      { year: "2022", title: "世界杯双响", detail: "卡塔尔世界杯对韩国梅开二度。" },
      { year: "2023", title: "登陆英超", detail: "加盟西汉姆联并迅速展现攻击效率。" },
      { year: "近年", title: "加纳核心", detail: "逐渐成为国家队进攻第一选择。" }
    ] }
  ],
  JPN: [
    { name: "久保建英", role: "右路创造 / 前场自由点", wikiTitle: "Takefusa Kubo", summary: "日本最有创造力的前场球员之一，兼具传球和内切射门。", timeline: [
      { year: "2019", title: "登陆西甲体系", detail: "加盟皇马并长期在西甲成长。" },
      { year: "2022", title: "世界杯经历", detail: "随日本参加卡塔尔世界杯。" },
      { year: "2023-24", title: "皇家社会核心", detail: "在西甲稳定输出，成为日本代表性攻击手。" }
    ] },
    { name: "三笘薰", role: "左路突破 / 单挑", wikiTitle: "Kaoru Mitoma", summary: "日本边路最强一对一爆点，能制造连续推进。", timeline: [
      { year: "2022", title: "世界杯关键助攻", detail: "对西班牙制造经典底线助攻。" },
      { year: "2023", title: "英超突破", detail: "在布莱顿打出高关注度表现。" },
      { year: "国家队", title: "日本边路强点", detail: "成为日本进攻宽度的重要来源。" }
    ] }
  ],
  MAR: [
    { name: "阿什拉夫", role: "右后卫 / 边路发动机", wikiTitle: "Achraf Hakimi", summary: "摩洛哥右路攻防核心，速度和大赛心理都很强。", timeline: [
      { year: "2021", title: "意甲冠军", detail: "随国际米兰获得意甲冠军。" },
      { year: "2022", title: "世界杯四强", detail: "随摩洛哥创造非洲球队世界杯四强历史。" },
      { year: "多次", title: "非洲最佳阵容级表现", detail: "长期处于非洲顶级边卫行列。" }
    ] },
    { name: "阿姆拉巴特", role: "后腰 / 防守屏障", wikiTitle: "Sofyan Amrabat", summary: "摩洛哥防守体系的中场硬度来源。", timeline: [
      { year: "2022", title: "世界杯四强", detail: "以强硬拦截和覆盖成为摩洛哥奇迹核心。" },
      { year: "2023", title: "欧战决赛经历", detail: "随佛罗伦萨打进欧协联决赛。" },
      { year: "国家队", title: "防守中轴", detail: "是摩洛哥低位纪律的关键球员。" }
    ] }
  ],
  MEX: [
    { name: "希门尼斯", role: "中锋 / 支点", wikiTitle: "Raúl Jiménez", summary: "墨西哥经验型中锋，禁区支点和点球能力重要。", timeline: [
      { year: "2012", title: "奥运金牌", detail: "随墨西哥国奥队获得伦敦奥运男足金牌。" },
      { year: "2019", title: "中北美金杯冠军", detail: "帮助墨西哥夺得金杯赛冠军。" },
      { year: "英超", title: "狼队核心阶段", detail: "曾在狼队保持高水平中锋表现。" }
    ] }
  ],
  NED: [
    { name: "范戴克", role: "中卫 / 防线领袖", wikiTitle: "Virgil van Dijk", summary: "荷兰防线核心，防空、对抗和后场领导力突出。", timeline: [
      { year: "2019", title: "欧冠冠军", detail: "随利物浦夺得欧冠并获欧足联年度最佳球员。" },
      { year: "2019", title: "金球奖第二", detail: "以中卫身份接近金球奖。" },
      { year: "2020", title: "英超冠军", detail: "帮助利物浦获得英超冠军。" }
    ] }
  ],
  NOR: [
    { name: "哈兰德", role: "中锋 / 终结机器", wikiTitle: "Erling Haaland", summary: "挪威最强终结点，禁区跑位和身体冲击能撕开任何防线。", timeline: [
      { year: "2020", title: "金童奖", detail: "获得欧洲金童奖。" },
      { year: "2023", title: "曼城三冠王", detail: "随曼城夺得三冠王，并打破英超单季进球纪录。" },
      { year: "2023", title: "欧足联年度最佳", detail: "以超高进球效率获得欧洲个人荣誉。" }
    ] },
    { name: "厄德高", role: "前腰 / 组织核心", wikiTitle: "Martin Ødegaard", summary: "挪威中前场创造力核心，控制节奏和最后一传关键。", timeline: [
      { year: "2014", title: "国家队早熟首秀", detail: "很早进入挪威成年国家队。" },
      { year: "2022", title: "阿森纳队长", detail: "成为阿森纳年轻队长和进攻组织核心。" },
      { year: "近年", title: "英超顶级中场", detail: "连续赛季保持高创造力输出。" }
    ] }
  ],
  PAR: [
    { name: "阿尔米隆", role: "攻击中场 / 纵向推进", wikiTitle: "Miguel Almirón", summary: "巴拉圭反击推进和前场持球的核心人物。", timeline: [
      { year: "2018", title: "MLS 冠军", detail: "随亚特兰大联获得 MLS 杯冠军。" },
      { year: "2019", title: "加盟纽卡斯尔", detail: "登陆英超并逐渐成为主力。" },
      { year: "国家队", title: "巴拉圭前场核心", detail: "长期承担国家队推进与创造。" }
    ] }
  ],
  POR: [
    { name: "C罗", role: "前锋 / 历史级终结者", wikiTitle: "Cristiano Ronaldo", summary: "葡萄牙最具标志性的球星，门前终结、头球和大赛经验仍具巨大视觉与心理影响。", timeline: [
      { year: "2016", title: "欧洲杯冠军", detail: "作为葡萄牙队长帮助球队夺得欧洲杯冠军。" },
      { year: "2019", title: "欧国联冠军", detail: "随葡萄牙获得首届欧国联冠军。" },
      { year: "多次", title: "金球奖与欧冠冠军", detail: "多次获得金球奖，并随俱乐部多次赢得欧冠。" }
    ] },
    { name: "B.费尔南德斯", role: "前腰 / 传射核心", wikiTitle: "Bruno Fernandes", summary: "葡萄牙最稳定的创造和远射来源之一。", timeline: [
      { year: "2019", title: "欧国联冠军", detail: "随葡萄牙获得欧国联冠军。" },
      { year: "2020", title: "英超月最佳爆发", detail: "加盟曼联后迅速成为核心。" },
      { year: "2024", title: "国家队组织中轴", detail: "持续承担葡萄牙前场串联任务。" }
    ] },
    { name: "莱奥", role: "左路爆点 / 开放局武器", wikiTitle: "Rafael Leão", summary: "葡萄牙边路速度和一对一的最大变量。", timeline: [
      { year: "2022", title: "意甲冠军", detail: "随 AC 米兰夺得意甲并获得意甲 MVP。" },
      { year: "2022", title: "世界杯进球", detail: "卡塔尔世界杯为葡萄牙取得进球。" },
      { year: "近年", title: "欧洲顶级边锋", detail: "长期保持高威胁带球推进。" }
    ] }
  ],
  RSA: [
    { name: "莫科纳", role: "中场 / 远射与拦截", wikiTitle: "Teboho Mokoena", summary: "南非中场核心之一，远射、定位球和防守覆盖突出。", timeline: [
      { year: "2023", title: "非洲足球联赛冠军", detail: "随马梅洛迪日落获得洲际俱乐部荣誉。" },
      { year: "2024", title: "非洲杯季军", detail: "随南非获得非洲杯季军。" },
      { year: "国家队", title: "中场核心", detail: "承担南非中场攻防转换职责。" }
    ] }
  ],
  SEN: [
    { name: "马内", role: "边锋 / 队史旗帜", wikiTitle: "Sadio Mané", summary: "塞内加尔历史级攻击手，速度、压迫和关键球能力突出。", timeline: [
      { year: "2019", title: "欧冠冠军", detail: "随利物浦夺得欧冠冠军。" },
      { year: "2020", title: "英超冠军", detail: "帮助利物浦获得英超冠军。" },
      { year: "2022", title: "非洲杯冠军", detail: "带领塞内加尔夺得队史首座非洲杯。" }
    ] }
  ],
  SUI: [
    { name: "扎卡", role: "中场领袖 / 出球核心", wikiTitle: "Granit Xhaka", summary: "瑞士中场秩序核心，长传、对抗和比赛管理稳定。", timeline: [
      { year: "2017", title: "足总杯冠军", detail: "随阿森纳获得足总杯冠军。" },
      { year: "2024", title: "勒沃库森不败德甲冠军", detail: "作为中场关键人物帮助球队夺冠。" },
      { year: "长期", title: "瑞士队长级核心", detail: "国家队出场和领导力长期稳定。" }
    ] }
  ],
  SWE: [
    { name: "伊萨克", role: "中锋 / 技术型终结", wikiTitle: "Alexander Isak", summary: "瑞典锋线最有天赋的终结点，脚下技术和跑位兼具。", timeline: [
      { year: "2017", title: "登陆多特蒙德", detail: "少年阶段进入欧洲豪门体系。" },
      { year: "2019", title: "西甲成长", detail: "在皇家社会成长为高关注前锋。" },
      { year: "2022-", title: "纽卡斯尔核心", detail: "在英超逐步成为顶级中锋之一。" }
    ] }
  ],
  USA: [
    { name: "普利西奇", role: "边锋 / 主场旗帜", wikiTitle: "Christian Pulisic", summary: "美国最具号召力的攻击手，边路突破和关键球是主场势能来源。", timeline: [
      { year: "2021", title: "欧冠冠军", detail: "随切尔西获得欧冠冠军。" },
      { year: "2021", title: "中北美国家联赛冠军", detail: "帮助美国获得 CONCACAF 国家联赛冠军。" },
      { year: "2023-24", title: "AC 米兰核心赛季", detail: "在意甲重新打出稳定进攻产出。" }
    ] },
    { name: "麦肯尼", role: "中场 / 对抗推进", wikiTitle: "Weston McKennie", summary: "美国中场对抗、前插和覆盖范围的重要来源。", timeline: [
      { year: "2020", title: "加盟尤文图斯", detail: "成为美国球员登陆意甲豪门的代表。" },
      { year: "2021", title: "意大利杯冠军", detail: "随尤文图斯获得杯赛冠军。" },
      { year: "国家队", title: "中场主力", detail: "长期是美国高强度体系核心。" }
    ] }
  ]
};

export function starProfilesFor(team: TeamSnapshot) {
  return starProfilesByTeam[team.shortName] ?? team.keyPlayers.slice(0, 1).map((player) => ({
    name: player,
    role: "核心球员",
    wikiTitle: player,
    summary: `${team.name} 关键球员，承担球队主要比赛影响力。`,
    timeline: [
      { year: "俱乐部", title: "主力履历", detail: "长期在俱乐部赛事中承担重要角色。" },
      { year: "国家队", title: "国家队核心", detail: "进入本届世界杯核心名单。" },
      { year: "本届", title: "淘汰赛影响", detail: "其状态会直接影响球队上限。" }
    ]
  }));
}

export const baseline = {
  title: "世界杯淘汰赛预测台",
  timestamp: "北京时间 2026-07-03 22:30",
  note: "完整展示 32 强至决赛；已完成场次按事实，未完场次按预测递推。",
  champion: teams.brazil,
  championProbability: "18.7%",
  contenders: [
    { team: teams.brazil, probability: "18.7%", note: "攻击深度与转换质量最均衡" },
    { team: teams.france, probability: "15.9%", note: "阵容厚度和淘汰赛稳定性强" },
    { team: teams.spain, probability: "13.6%", note: "控球压制力强，强强战看防转换" }
  ],
  upsetWatch: [
    "摩洛哥拖入点球淘汰加拿大",
    "墨西哥主场强度压低英格兰进攻效率",
    "哥伦比亚借定位球淘汰瑞士"
  ],
  confirmedResults: [
    "加拿大 1-0 南非",
    "荷兰 1-1 摩洛哥（点球）",
    "德国 1-1 巴拉圭（点球）",
    "法国 3-0 瑞典",
    "巴西 2-1 日本",
    "挪威 2-1 科特迪瓦",
    "墨西哥 2-0 厄瓜多尔",
    "英格兰 2-1 民主刚果",
    "美国 2-0 波黑",
    "西班牙 3-0 奥地利",
    "葡萄牙 2-1 克罗地亚",
    "比利时 3-2 塞内加尔",
    "瑞士 2-0 阿尔及利亚",
    "哥伦比亚/阿根廷/埃及路径为预测"
  ]
};

const evidence = (
  left: string,
  right: string,
  advantage: EvidenceItem["advantage"],
  label: string,
  note: string
): EvidenceItem => ({
  label,
  left,
  right,
  advantage,
  note
});

const completedR32Match = (
  id: string,
  date: string,
  left: TeamSnapshot,
  right: TeamSnapshot,
  score: string,
  winner: string,
  method: PredictionMatch["method"],
  tags: string[]
): PredictionMatch => ({
  id,
  round: "32 强",
  date,
  status: "confirmed-context",
  stageNote: method === "点球" ? "已赛事实（点球晋级）" : "已赛事实",
  left,
  right,
  predictedScore: score,
  predictedWinner: winner,
  method,
  confidence: "高",
  tags,
  rationale: [
    `已完成比赛：${left.name} ${score} ${right.name}。`,
    `${winner} 已确认晋级下一轮，本场在对阵图中按事实结果展示。`,
    "后续轮次预测以该已赛结果为固定输入。"
  ],
  risks: ["已赛事实，无预测翻车风险；后续影响体现在晋级路径和体能消耗。"],
  evidence: [
    evidence("已完成", "已完成", "even", "赛果状态", "该场作为事实写入 bracket"),
    evidence(left.form, right.form, "even", "赛后状态", "用于解释后续路径和淘汰背景"),
    evidence(left.tacticalProfile, right.tacticalProfile, "even", "战术画像", "保留双方风格信息，便于复盘")
  ]
});

const completedR32Matches: PredictionMatch[] = [
  completedR32Match("r32-can-rsa", "6.28", teams.canada, teams.southafrica, "1-0", "加拿大", "常规时间", ["已赛", "主场", "低比分"]),
  completedR32Match("r32-ned-mar", "6.28", teams.netherlands, teams.morocco, "1-1", "摩洛哥", "点球", ["已赛", "点球", "黑马"]),
  completedR32Match("r32-ger-par", "6.29", teams.germany, teams.paraguay, "1-1", "巴拉圭", "点球", ["已赛", "点球", "冷门"]),
  completedR32Match("r32-fra-swe", "6.29", teams.france, teams.sweden, "3-0", "法国", "常规时间", ["已赛", "强队", "零封"]),
  completedR32Match("r32-bra-jpn", "6.30", teams.brazil, teams.japan, "2-1", "巴西", "常规时间", ["已赛", "强队", "边路"]),
  completedR32Match("r32-nor-civ", "6.30", teams.norway, teams.ivorycoast, "2-1", "挪威", "常规时间", ["已赛", "锋线", "身体"]),
  completedR32Match("r32-mex-ecu", "7.1", teams.mexico, teams.ecuador, "2-0", "墨西哥", "常规时间", ["已赛", "主场", "零封"]),
  completedR32Match("r32-eng-cod", "7.1", teams.england, teams.drcongo, "2-1", "英格兰", "常规时间", ["已赛", "强队", "定位球"]),
  completedR32Match("r32-por-cro", "7.2", teams.portugal, teams.croatia, "2-1", "葡萄牙", "常规时间", ["已赛", "强强", "经验"]),
  completedR32Match("r32-esp-aut", "7.2", teams.spain, teams.austria, "3-0", "西班牙", "常规时间", ["已赛", "控球", "零封"]),
  completedR32Match("r32-usa-bih", "7.2", teams.usa, teams.bosnia, "2-0", "美国", "常规时间", ["已赛", "主场", "零封"]),
  completedR32Match("r32-bel-sen", "7.2", teams.belgium, teams.senegal, "3-2", "比利时", "常规时间", ["已赛", "对攻", "强强"]),
  completedR32Match("r32-sui-alg", "7.3", teams.switzerland, teams.algeria, "2-0", "瑞士", "常规时间", ["已赛", "稳定", "零封"])
];

export const matches: PredictionMatch[] = [
  ...completedR32Matches,
  {
    id: "r32-aus-egy",
    round: "32 强",
    date: "7.3",
    status: "prediction",
    stageNote: "未完赛预测",
    left: teams.australia,
    right: teams.egypt,
    predictedScore: "1-2",
    predictedWinner: "埃及",
    method: "常规时间",
    confidence: "低",
    tags: ["防空", "反击", "定位球"],
    rationale: [
      "双方硬实力接近，埃及的反击单点更容易制造高价值机会。",
      "澳大利亚定位球和对抗强，但阵地战创造力不足。",
      "如果埃及先取得进球，比赛节奏会明显进入其低位防守舒适区。"
    ],
    risks: ["澳大利亚高空球连续冲击可能改变比赛走势。"],
    evidence: [
      evidence("对抗更强", "反击更快", "right", "风格对位", "埃及更适合打开放空间后的纵向推进"),
      evidence("稳定", "中等", "even", "近期状态", "两队都不是高压制胜类型"),
      evidence("定位球优势", "单点爆发", "even", "破局方式", "胜负可能来自一次定位球或反击")
    ]
  },
  {
    id: "r32-arg-cpv",
    round: "32 强",
    date: "7.3",
    status: "prediction",
    stageNote: "未完赛预测",
    left: teams.argentina,
    right: teams.capeverde,
    predictedScore: "3-0",
    predictedWinner: "阿根廷",
    method: "常规时间",
    confidence: "高",
    tags: ["大赛经验", "控节奏", "阵容深度"],
    rationale: [
      "阿根廷在淘汰赛节奏管理、定位球和中场控制上优势明显。",
      "佛得角黑马属性强，但面对顶级控场球队时出球压力会被放大。",
      "阿根廷替补深度足以覆盖下半场体能和节奏变化。"
    ],
    risks: ["若阿根廷久攻不下，佛得角低位防守会让比分被压低。"],
    evidence: [
      evidence("世界前列", "黑马区间", "left", "硬实力", "阵容质量和淘汰赛经验差距清楚"),
      evidence("控节奏", "低位反击", "left", "战术", "阿根廷能限制对手反击次数"),
      evidence("高压期待", "中立支持", "left", "舆论", "压力在阿根廷，但经验也更足")
    ]
  },
  {
    id: "r32-col-gha",
    round: "32 强",
    date: "7.3",
    status: "prediction",
    stageNote: "未完赛预测",
    left: teams.colombia,
    right: teams.ghana,
    predictedScore: "2-1",
    predictedWinner: "哥伦比亚",
    method: "常规时间",
    confidence: "中",
    tags: ["边路", "定位球", "转换"],
    rationale: [
      "哥伦比亚在边路推进和定位球质量上更成熟。",
      "加纳的反击速度能制造威胁，但防线持续稳定性略弱。",
      "南美球队在淘汰赛对抗和犯规节奏管理上更占优。"
    ],
    risks: ["加纳若先打出转换进球，哥伦比亚会被迫进入开放对攻。"],
    evidence: [
      evidence("定位球强", "反击快", "left", "破局方式", "哥伦比亚更容易从定位球获得稳定机会"),
      evidence("较成熟", "波动较大", "left", "比赛管理", "领先后的控场能力更好"),
      evidence("热度上行", "冷门期待", "left", "舆论", "市场更信任哥伦比亚延续表现")
    ]
  },
  {
    id: "r16-can-mar",
    round: "16 强",
    date: "7.4",
    status: "prediction",
    stageNote: "已确定对阵",
    left: teams.canada,
    right: teams.morocco,
    predictedScore: "1-1",
    predictedWinner: "摩洛哥",
    method: "点球",
    confidence: "低",
    tags: ["主场", "防守韧性", "点球"],
    rationale: [
      "加拿大主场速度和冲击力强，但摩洛哥低位防守更成熟。",
      "摩洛哥在淘汰赛消耗战经验和门前保护上更可靠。",
      "常规时间很可能是低比分，点球倾向摩洛哥。"
    ],
    risks: ["加拿大早段借主场情绪进球会迫使摩洛哥改变节奏。"],
    evidence: [
      evidence("主场加成", "防守纪律", "right", "风格对位", "摩洛哥能压低加拿大边路冲刺空间"),
      evidence("边路速度", "淘汰赛韧性", "right", "经验", "摩洛哥更习惯胶着局面"),
      evidence("热度高", "黑马叙事强", "even", "舆论", "双方都有明确情绪支撑")
    ]
  },
  {
    id: "r16-par-fra",
    round: "16 强",
    date: "7.4",
    status: "prediction",
    stageNote: "已确定对阵",
    left: teams.paraguay,
    right: teams.france,
    predictedScore: "0-2",
    predictedWinner: "法国",
    method: "常规时间",
    confidence: "高",
    tags: ["阵容深度", "转换", "防守稳定"],
    rationale: [
      "法国 32 强大胜后状态和效率都在高位。",
      "巴拉圭防守韧性强，但进攻火力不足以持续威胁法国。",
      "法国替补席能够在下半场继续拉开强度差。"
    ],
    risks: ["巴拉圭如果把比赛拖到 70 分钟后仍 0-0，定位球风险会上升。"],
    evidence: [
      evidence("中游", "世界前列", "right", "硬实力", "法国阵容深度明显占优"),
      evidence("低产出", "高效率", "right", "近期状态", "法国刚以 3-0 晋级"),
      evidence("定位球", "转换冲击", "right", "战术", "法国能惩罚巴拉圭压出后的空间")
    ]
  },
  {
    id: "r16-bra-nor",
    round: "16 强",
    date: "7.5",
    status: "prediction",
    stageNote: "已确定对阵",
    left: teams.brazil,
    right: teams.norway,
    predictedScore: "2-1",
    predictedWinner: "巴西",
    method: "常规时间",
    confidence: "中",
    tags: ["锋线", "防空", "边路"],
    rationale: [
      "挪威中锋和定位球会给巴西防线制造真实压力。",
      "巴西边路单挑和二次进攻质量更高，能持续打击挪威横移。",
      "强强对位里巴西的个人能力和替补变化更丰富。"
    ],
    risks: ["挪威若早段定位球得手，巴西会进入高风险追分局。"],
    evidence: [
      evidence("世界前列", "中上游", "left", "硬实力", "巴西整体天赋更均衡"),
      evidence("边路爆点", "强力中锋", "left", "战术", "巴西创造机会方式更多"),
      evidence("夺冠热门", "爆冷呼声", "left", "舆论", "市场更偏巴西但承认挪威威胁")
    ]
  },
  {
    id: "r16-mex-eng",
    round: "16 强",
    date: "7.5",
    status: "prediction",
    stageNote: "已确定对阵",
    left: teams.mexico,
    right: teams.england,
    predictedScore: "0-1",
    predictedWinner: "英格兰",
    method: "加时",
    confidence: "低",
    tags: ["主场压力", "定位球", "低比分"],
    rationale: [
      "墨西哥主场情绪和节奏会让比赛非常难打。",
      "英格兰防守稳定、定位球质量和替补厚度更适合胶着淘汰赛。",
      "进攻端保守会压低比分，英格兰更可能靠定位球或加时解决。"
    ],
    risks: ["英格兰若过早退守，墨西哥主场连续压迫会带来巨大波动。"],
    evidence: [
      evidence("主场强", "阵容深", "right", "硬实力", "英格兰纸面优势抵消部分主场压力"),
      evidence("高节奏", "稳防守", "even", "风格", "这是一场节奏与控制的对冲"),
      evidence("期待爆冷", "质疑保守", "even", "舆论", "双方心理压力都很重")
    ]
  },
  {
    id: "r16-por-esp",
    round: "16 强",
    date: "7.6",
    status: "prediction",
    stageNote: "已确定对阵",
    left: teams.portugal,
    right: teams.spain,
    predictedScore: "1-2",
    predictedWinner: "西班牙",
    method: "常规时间",
    confidence: "中",
    tags: ["控球", "边路", "强强战"],
    rationale: [
      "葡萄牙个人能力强，但西班牙能通过控球压缩其转换次数。",
      "西班牙 32 强大胜显示压迫和终结都在线。",
      "若葡萄牙防线被迫长时间横移，肋部空间会成为关键。"
    ],
    risks: ["葡萄牙前场单点爆发和远射会让比赛随时脱离模型判断。"],
    evidence: [
      evidence("边路单挑", "控球压迫", "right", "战术", "西班牙能用控球降低葡萄牙转换频率"),
      evidence("2-1 晋级", "3-0 晋级", "right", "近期状态", "西班牙晋级过程更轻松"),
      evidence("明星热度", "体系信任", "right", "舆论", "市场更信任西班牙稳定性")
    ]
  },
  {
    id: "r16-usa-bel",
    round: "16 强",
    date: "7.6",
    status: "prediction",
    stageNote: "已确定对阵",
    left: teams.usa,
    right: teams.belgium,
    predictedScore: "1-2",
    predictedWinner: "比利时",
    method: "加时",
    confidence: "低",
    tags: ["主场", "经验", "转换"],
    rationale: [
      "美国主场能把比赛推到高强度，但比利时前场处理关键球经验更好。",
      "双方都适合转换，比赛会有开放阶段。",
      "加时阶段的个人能力和门前冷静度更偏比利时。"
    ],
    risks: ["美国若在上半场借主场压迫领先，比利时防线速度会被持续考验。"],
    evidence: [
      evidence("主场跑动", "关键球经验", "right", "比赛管理", "比利时更会处理加时阶段"),
      evidence("2-0 晋级", "进攻天赋", "even", "近期状态", "美国状态好但上限仍需强队验证"),
      evidence("本土热度", "爆冷强队", "even", "舆论", "舆论热度会放大比赛波动")
    ]
  },
  {
    id: "r16-sui-col",
    round: "16 强",
    date: "7.7",
    status: "prediction",
    stageNote: "对阵由 32 强预测生成",
    left: teams.switzerland,
    right: teams.colombia,
    predictedScore: "1-1",
    predictedWinner: "哥伦比亚",
    method: "点球",
    confidence: "低",
    tags: ["纪律", "定位球", "点球"],
    rationale: [
      "瑞士结构稳定，很难被常规时间击穿。",
      "哥伦比亚定位球和前场个人能力更可能制造绝对机会。",
      "若进入点球，哥伦比亚更具进攻端气势，但信心很低。"
    ],
    risks: ["瑞士若先通过定位球领先，哥伦比亚会被拖入低效阵地战。"],
    evidence: [
      evidence("组织稳定", "定位球强", "even", "风格", "两队都能把比赛压成低比分"),
      evidence("2-0 晋级", "预测晋级", "left", "赛程消耗", "瑞士休整确定性更高"),
      evidence("稳健预期", "南美热度", "right", "舆论", "哥伦比亚上行动能更强")
    ]
  },
  {
    id: "r16-egy-arg",
    round: "16 强",
    date: "7.7",
    status: "prediction",
    stageNote: "对阵由 32 强预测生成",
    left: teams.egypt,
    right: teams.argentina,
    predictedScore: "0-2",
    predictedWinner: "阿根廷",
    method: "常规时间",
    confidence: "高",
    tags: ["控场", "反击限制", "经验"],
    rationale: [
      "阿根廷能通过中场控节奏限制埃及反击数量。",
      "埃及若长期低位，会面临定位球和二点球压力。",
      "淘汰赛管理能力和领先后控场明显偏阿根廷。"
    ],
    risks: ["埃及锋线若抓住第一波反击，比赛会变得非常胶着。"],
    evidence: [
      evidence("低位反击", "控节奏", "right", "战术", "阿根廷更能决定比赛速度"),
      evidence("中游", "世界前列", "right", "硬实力", "阵容层级差距明显"),
      evidence("冷门期待", "争冠压力", "right", "心理", "阿根廷更熟悉这种压力")
    ]
  },
  {
    id: "qf-mar-fra",
    round: "8 强",
    date: "7.9",
    status: "prediction",
    stageNote: "预测递推",
    left: teams.morocco,
    right: teams.france,
    predictedScore: "1-2",
    predictedWinner: "法国",
    method: "常规时间",
    confidence: "中",
    tags: ["强度", "替补", "反击"],
    rationale: [
      "摩洛哥防守能降低法国机会数量，但很难 90 分钟完全压住转换冲击。",
      "法国替补火力和边路冲击会在下半场制造差异。",
      "同风格消耗战里法国的终结点更多。"
    ],
    risks: ["摩洛哥若率先进球，法国会面对极难拆的低位防线。"],
    evidence: [
      evidence("防守纪律", "转换冲击", "right", "风格", "法国有更多破低位方式"),
      evidence("主力依赖", "阵容深", "right", "阵容深度", "法国后手优势明显"),
      evidence("黑马叙事", "夺冠热门", "right", "舆论", "压力更大但实力更足")
    ]
  },
  {
    id: "qf-bra-eng",
    round: "8 强",
    date: "7.10",
    status: "prediction",
    stageNote: "预测递推",
    left: teams.brazil,
    right: teams.england,
    predictedScore: "2-1",
    predictedWinner: "巴西",
    method: "常规时间",
    confidence: "中",
    tags: ["边路", "定位球", "强强战"],
    rationale: [
      "英格兰定位球和防守稳定性足以制造麻烦。",
      "巴西边路一对一和禁区前沿二次进攻更有爆点。",
      "若比赛进入开放阶段，巴西前场处理速度更快。"
    ],
    risks: ["英格兰定位球效率一旦打开，巴西防线会被迫进入高压模式。"],
    evidence: [
      evidence("边路爆点", "定位球强", "left", "破局", "巴西运动战创造力更高"),
      evidence("夺冠热门", "高关注", "left", "市场", "巴西预测概率更靠前"),
      evidence("转换质量", "防守稳定", "even", "强强战", "这会是一场细节局")
    ]
  },
  {
    id: "qf-esp-bel",
    round: "8 强",
    date: "7.10",
    status: "prediction",
    stageNote: "预测递推",
    left: teams.spain,
    right: teams.belgium,
    predictedScore: "2-1",
    predictedWinner: "西班牙",
    method: "常规时间",
    confidence: "中",
    tags: ["控球", "反击防守", "中场"],
    rationale: [
      "西班牙能用控球和压迫减少比利时中路推进次数。",
      "比利时单点传射仍有威胁，比赛不会轻松。",
      "西班牙中场连续性更好，后程控局优势更明显。"
    ],
    risks: ["比利时若抓住西班牙高位身后的空间，比分可能反转。"],
    evidence: [
      evidence("控球压迫", "直塞反击", "left", "战术", "西班牙能掌控更多回合"),
      evidence("体系稳定", "个人能力", "left", "稳定性", "西班牙波动更小"),
      evidence("技术流热", "爆冷潜力", "left", "舆论", "市场更看重西班牙体系")
    ]
  },
  {
    id: "qf-col-arg",
    round: "8 强",
    date: "7.11",
    status: "prediction",
    stageNote: "预测递推",
    left: teams.colombia,
    right: teams.argentina,
    predictedScore: "1-2",
    predictedWinner: "阿根廷",
    method: "常规时间",
    confidence: "中",
    tags: ["南美内战", "定位球", "控节奏"],
    rationale: [
      "哥伦比亚定位球和边路推进会给阿根廷制造高压时段。",
      "阿根廷更擅长南美内战的节奏切换和犯规管理。",
      "关键时刻的比赛管理与替补选择更偏阿根廷。"
    ],
    risks: ["哥伦比亚定位球若先得分，阿根廷会遭遇最难的一类淘汰赛。"],
    evidence: [
      evidence("定位球强", "控节奏强", "right", "风格", "阿根廷能压低对手连续冲击"),
      evidence("上行动能", "大赛经验", "right", "经验", "阿根廷淘汰赛经验优势明显"),
      evidence("南美热度", "冠军信仰", "right", "舆论", "阿根廷心理韧性更被信任")
    ]
  },
  {
    id: "sf-fra-bra",
    round: "半决赛",
    date: "7.14",
    status: "prediction",
    stageNote: "预测递推",
    left: teams.france,
    right: teams.brazil,
    predictedScore: "1-2",
    predictedWinner: "巴西",
    method: "常规时间",
    confidence: "低",
    tags: ["冠军级对决", "边路", "替补"],
    rationale: [
      "这是最接近五五开的冠军级对决。",
      "法国深度更强，但巴西边路爆点对法国右侧保护是关键考验。",
      "巴西若能限制法国转换第一脚，前场个人能力足以决定比赛。"
    ],
    risks: ["法国替补席和转换速度完全可能把比赛带向另一边。"],
    evidence: [
      evidence("阵容深", "边路爆点", "even", "硬实力", "两队都是争冠级别"),
      evidence("效率高", "创造方式多", "right", "进攻", "巴西运动战变化略多"),
      evidence("稳热门", "第一热门", "even", "市场", "概率差距很小")
    ]
  },
  {
    id: "sf-esp-arg",
    round: "半决赛",
    date: "7.15",
    status: "prediction",
    stageNote: "预测递推",
    left: teams.spain,
    right: teams.argentina,
    predictedScore: "1-1",
    predictedWinner: "阿根廷",
    method: "点球",
    confidence: "低",
    tags: ["控球", "经验", "点球"],
    rationale: [
      "西班牙控球能长时间压制节奏，但阿根廷极擅长把强强战拉入细节局。",
      "双方常规时间都不会轻易暴露身后，低比分概率高。",
      "点球与心理韧性倾向阿根廷，但置信度很低。"
    ],
    risks: ["西班牙若早段取得领先，阿根廷追分会暴露边路空间。"],
    evidence: [
      evidence("控球体系", "比赛管理", "even", "风格", "控球与经验的对冲"),
      evidence("中场连续", "淘汰赛韧性", "right", "关键时刻", "阿根廷更适应点球压力"),
      evidence("体系热", "冠军信仰", "even", "舆论", "两队支持面都很强")
    ]
  },
  {
    id: "third-fra-esp",
    round: "季军战",
    date: "7.18",
    status: "prediction",
    stageNote: "预测递推",
    left: teams.france,
    right: teams.spain,
    predictedScore: "1-2",
    predictedWinner: "西班牙",
    method: "常规时间",
    confidence: "低",
    tags: ["轮换", "控球", "心态"],
    rationale: [
      "季军战轮换和心理落差会降低可预测性。",
      "西班牙控球体系在开放心态下更容易打出流畅进攻。",
      "法国可能更重视保护核心体能，比赛强度不如半决赛。"
    ],
    risks: ["法国替补天赋足以单独改变季军战。"],
    evidence: [
      evidence("替补强", "体系稳", "right", "轮换", "季军战更看体系下限"),
      evidence("转换强", "控球强", "even", "风格", "开放局两边都有机会"),
      evidence("失落调整", "技术释放", "right", "心理", "西班牙更适合控局")
    ]
  },
  {
    id: "final-bra-arg",
    round: "决赛",
    date: "7.19",
    status: "prediction",
    stageNote: "预测递推",
    left: teams.brazil,
    right: teams.argentina,
    predictedScore: "2-1",
    predictedWinner: "巴西",
    method: "常规时间",
    confidence: "低",
    tags: ["南美决赛", "边路", "巨星时刻"],
    rationale: [
      "南美决赛会极度紧张，犯规、定位球和情绪控制会决定节奏。",
      "阿根廷经验与控场很强，但巴西边路冲击和前场变化更丰富。",
      "巴西整体进攻出口更多，预测以 2-1 小胜夺冠。"
    ],
    risks: ["阿根廷若把比赛拖入点球，巴西的优势会显著下降。"],
    evidence: [
      evidence("边路爆点", "控节奏", "left", "关键对位", "巴西运动战出口更多"),
      evidence("第一热门", "卫冕级信任", "even", "市场", "双方都是冠军候选"),
      evidence("压力极高", "压力极高", "even", "心理", "决赛信心档必须保持低")
    ]
  }
];

export const bracketRounds: BracketRound[] = [
  {
    label: "32 强",
    window: "6.28-7.3",
    matches: [
      { id: "b-r32-1", matchId: "r32-can-rsa", left: "加拿大", right: "南非", score: "1-0", winner: "加拿大", confidence: "高" },
      { id: "b-r32-2", matchId: "r32-ned-mar", left: "荷兰", right: "摩洛哥", score: "1-1 点", winner: "摩洛哥", confidence: "高" },
      { id: "b-r32-3", matchId: "r32-ger-par", left: "德国", right: "巴拉圭", score: "1-1 点", winner: "巴拉圭", confidence: "高" },
      { id: "b-r32-4", matchId: "r32-fra-swe", left: "法国", right: "瑞典", score: "3-0", winner: "法国", confidence: "高" },
      { id: "b-r32-5", matchId: "r32-bra-jpn", left: "巴西", right: "日本", score: "2-1", winner: "巴西", confidence: "高" },
      { id: "b-r32-6", matchId: "r32-nor-civ", left: "挪威", right: "科特迪瓦", score: "2-1", winner: "挪威", confidence: "高" },
      { id: "b-r32-7", matchId: "r32-mex-ecu", left: "墨西哥", right: "厄瓜多尔", score: "2-0", winner: "墨西哥", confidence: "高" },
      { id: "b-r32-8", matchId: "r32-eng-cod", left: "英格兰", right: "民主刚果", score: "2-1", winner: "英格兰", confidence: "高" },
      { id: "b-r32-9", matchId: "r32-por-cro", left: "葡萄牙", right: "克罗地亚", score: "2-1", winner: "葡萄牙", confidence: "高" },
      { id: "b-r32-10", matchId: "r32-esp-aut", left: "西班牙", right: "奥地利", score: "3-0", winner: "西班牙", confidence: "高" },
      { id: "b-r32-11", matchId: "r32-usa-bih", left: "美国", right: "波黑", score: "2-0", winner: "美国", confidence: "高" },
      { id: "b-r32-12", matchId: "r32-bel-sen", left: "比利时", right: "塞内加尔", score: "3-2", winner: "比利时", confidence: "高" },
      { id: "b-r32-13", matchId: "r32-sui-alg", left: "瑞士", right: "阿尔及利亚", score: "2-0", winner: "瑞士", confidence: "高" },
      { id: "b-r32-14", matchId: "r32-col-gha", left: "哥伦比亚", right: "加纳", score: "2-1", winner: "哥伦比亚", confidence: "中" },
      { id: "b-r32-15", matchId: "r32-aus-egy", left: "澳大利亚", right: "埃及", score: "1-2", winner: "埃及", confidence: "低" },
      { id: "b-r32-16", matchId: "r32-arg-cpv", left: "阿根廷", right: "佛得角", score: "3-0", winner: "阿根廷", confidence: "高" }
    ]
  },
  {
    label: "16 强",
    window: "7.4-7.7",
    matches: [
      { id: "b-r16-1", matchId: "r16-can-mar", left: "加拿大", right: "摩洛哥", score: "1-1 点", winner: "摩洛哥", confidence: "低" },
      { id: "b-r16-2", matchId: "r16-par-fra", left: "巴拉圭", right: "法国", score: "0-2", winner: "法国", confidence: "高" },
      { id: "b-r16-3", matchId: "r16-bra-nor", left: "巴西", right: "挪威", score: "2-1", winner: "巴西", confidence: "中" },
      { id: "b-r16-4", matchId: "r16-mex-eng", left: "墨西哥", right: "英格兰", score: "0-1 加", winner: "英格兰", confidence: "低" },
      { id: "b-r16-5", matchId: "r16-por-esp", left: "葡萄牙", right: "西班牙", score: "1-2", winner: "西班牙", confidence: "中" },
      { id: "b-r16-6", matchId: "r16-usa-bel", left: "美国", right: "比利时", score: "1-2 加", winner: "比利时", confidence: "低" },
      { id: "b-r16-7", matchId: "r16-sui-col", left: "瑞士", right: "哥伦比亚", score: "1-1 点", winner: "哥伦比亚", confidence: "低" },
      { id: "b-r16-8", matchId: "r16-egy-arg", left: "埃及", right: "阿根廷", score: "0-2", winner: "阿根廷", confidence: "高" }
    ]
  },
  {
    label: "8 强",
    window: "7.9-7.11",
    matches: [
      { id: "b-qf-1", matchId: "qf-mar-fra", left: "摩洛哥", right: "法国", score: "1-2", winner: "法国", confidence: "中" },
      { id: "b-qf-2", matchId: "qf-bra-eng", left: "巴西", right: "英格兰", score: "2-1", winner: "巴西", confidence: "中" },
      { id: "b-qf-3", matchId: "qf-esp-bel", left: "西班牙", right: "比利时", score: "2-1", winner: "西班牙", confidence: "中" },
      { id: "b-qf-4", matchId: "qf-col-arg", left: "哥伦比亚", right: "阿根廷", score: "1-2", winner: "阿根廷", confidence: "中" }
    ]
  },
  {
    label: "半决赛",
    window: "7.14-7.15",
    matches: [
      { id: "b-sf-1", matchId: "sf-fra-bra", left: "法国", right: "巴西", score: "1-2", winner: "巴西", confidence: "低" },
      { id: "b-sf-2", matchId: "sf-esp-arg", left: "西班牙", right: "阿根廷", score: "1-1 点", winner: "阿根廷", confidence: "低" }
    ]
  },
  {
    label: "季军战",
    window: "7.18",
    matches: [
      { id: "b-third", matchId: "third-fra-esp", left: "法国", right: "西班牙", score: "1-2", winner: "西班牙", confidence: "低" }
    ]
  },
  {
    label: "决赛",
    window: "7.19",
    matches: [
      { id: "b-final", matchId: "final-bra-arg", left: "巴西", right: "阿根廷", score: "2-1", winner: "巴西", confidence: "低" }
    ]
  }
];

export const sources = [
  "ESPN 赛程与 bracket",
  "SBNation 32 强赛程赛果",
  "Al Jazeera / The Guardian 赛后战报",
  "FIFA 排名与公开赛程",
  "公开赔率市场",
  "各队公开伤停与媒体舆论"
];
