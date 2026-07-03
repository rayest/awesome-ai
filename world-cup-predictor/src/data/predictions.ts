export type Confidence = "高" | "中" | "低";
export type MatchStatus = "confirmed-context" | "prediction";

export type TeamSnapshot = {
  name: string;
  shortName: string;
  flag: string;
  rankBand: string;
  form: string;
  fitness: string;
  tacticalProfile: string;
  sentiment: string;
};

export type EvidenceItem = {
  label: string;
  left: string;
  right: string;
  note: string;
  advantage: "left" | "right" | "even";
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
};

export type BracketRound = {
  label: string;
  window: string;
  matches: Array<{
    id: string;
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
    flag: "🇧🇷",
    rankBand: "世界前列",
    form: "进攻端稳定，小组赛后段提速",
    fitness: "主力框架完整，边路轮换充足",
    tacticalProfile: "边路爆点 + 中前场压迫 + 快速二次进攻",
    sentiment: "夺冠呼声最高之一，舆论压力也最高"
  },
  france: {
    name: "法国",
    shortName: "FRA",
    flag: "🇫🇷",
    rankBand: "世界前列",
    form: "淘汰赛首轮 3-0 瑞典，效率和防守都在线",
    fitness: "阵容深度极强，个别位置需关注疲劳",
    tacticalProfile: "转换速度、禁区冲击和替补火力突出",
    sentiment: "媒体普遍视为最稳热门之一"
  },
  spain: {
    name: "西班牙",
    shortName: "ESP",
    flag: "🇪🇸",
    rankBand: "世界前列",
    form: "控球质量稳定，32 强 3-0 奥地利",
    fitness: "中前场选择丰富，防线抗冲击仍需验证",
    tacticalProfile: "控球压迫 + 肋部渗透 + 高位夺回",
    sentiment: "技术流拥趸强，强强战抗转换被反复讨论"
  },
  argentina: {
    name: "阿根廷",
    shortName: "ARG",
    flag: "🇦🇷",
    rankBand: "世界前列",
    form: "大赛经验强，节奏控制仍是核心优势",
    fitness: "老将经验与年轻跑动之间需要平衡",
    tacticalProfile: "中场控节奏 + 定位球 + 淘汰赛管理",
    sentiment: "球迷信心高，但对体能曲线有担忧"
  },
  england: {
    name: "英格兰",
    shortName: "ENG",
    flag: "🏴",
    rankBand: "世界前列",
    form: "防守稳定，进攻端仍偏谨慎",
    fitness: "豪华阵容但磨合与用人选择受关注",
    tacticalProfile: "定位球、边后卫推进、禁区二点球",
    sentiment: "热度高，舆论对临场保守有质疑"
  },
  portugal: {
    name: "葡萄牙",
    shortName: "POR",
    flag: "🇵🇹",
    rankBand: "世界前列",
    form: "32 强 2-1 克罗地亚，个人能力仍很强",
    fitness: "攻击线深度好，防线回追压力较大",
    tacticalProfile: "边路单挑 + 远射 + 前场自由换位",
    sentiment: "明星效应明显，强强战稳定性受讨论"
  },
  belgium: {
    name: "比利时",
    shortName: "BEL",
    flag: "🇧🇪",
    rankBand: "强队区间",
    form: "进攻天赋仍在，防守速度是隐患",
    fitness: "核心球员健康程度决定上限",
    tacticalProfile: "中路推进 + 反击直塞 + 禁区终结",
    sentiment: "舆论认为仍有爆冷强队能力"
  },
  usa: {
    name: "美国",
    shortName: "USA",
    flag: "🇺🇸",
    rankBand: "中上游",
    form: "32 强 2-0 波黑，主场势能明显",
    fitness: "跑动和对抗充足，经验深度略弱于豪门",
    tacticalProfile: "高强度跑动 + 边路推进 + 主场节奏",
    sentiment: "本土热度高，市场预期升温"
  },
  morocco: {
    name: "摩洛哥",
    shortName: "MAR",
    flag: "🇲🇦",
    rankBand: "中上游",
    form: "防守组织可靠，淘汰赛韧性强",
    fitness: "主力依赖度较高，边路强点健康关键",
    tacticalProfile: "低位纪律 + 反击速度 + 防空保护",
    sentiment: "延续大赛黑马叙事，支持度很高"
  },
  canada: {
    name: "加拿大",
    shortName: "CAN",
    flag: "🇨🇦",
    rankBand: "中游",
    form: "32 强 1-0 南非，主场推进强",
    fitness: "核心边路速度好，阵容厚度有限",
    tacticalProfile: "边路冲刺 + 主场压迫 + 快速转换",
    sentiment: "主场情绪热烈，冷门期待上升"
  },
  norway: {
    name: "挪威",
    shortName: "NOR",
    flag: "🇳🇴",
    rankBand: "中上游",
    form: "锋线威胁巨大，比赛波动也明显",
    fitness: "锋线依赖高，防守横移需保护",
    tacticalProfile: "强力中锋 + 直塞冲击 + 定位球",
    sentiment: "球迷相信能制造强队麻烦"
  },
  mexico: {
    name: "墨西哥",
    shortName: "MEX",
    flag: "🇲🇽",
    rankBand: "中上游",
    form: "主场氛围强，对抗和节奏感好",
    fitness: "中后场消耗较大，进攻终结波动",
    tacticalProfile: "高节奏逼抢 + 边路传中 + 情绪动员",
    sentiment: "主场加成巨大，舆论期待爆冷英格兰"
  },
  switzerland: {
    name: "瑞士",
    shortName: "SUI",
    flag: "🇨🇭",
    rankBand: "中上游",
    form: "32 强 2-0 阿尔及利亚，组织纪律稳定",
    fitness: "主力结构成熟，冲击力不如南美球队",
    tacticalProfile: "紧凑阵型 + 中场拦截 + 稳定出球",
    sentiment: "被视为很难被轻松击穿的对手"
  },
  colombia: {
    name: "哥伦比亚",
    shortName: "COL",
    flag: "🇨🇴",
    rankBand: "中上游",
    form: "近期进攻质量好，定位球威胁突出",
    fitness: "前场核心状态是胜负杠杆",
    tacticalProfile: "边路推进 + 定位球 + 身体对抗",
    sentiment: "南美球迷看好继续上行"
  },
  ghana: {
    name: "加纳",
    shortName: "GHA",
    flag: "🇬🇭",
    rankBand: "中游",
    form: "转换进攻有爆点，防守稳定性一般",
    fitness: "年轻球员冲击力强，经验略欠",
    tacticalProfile: "纵向推进 + 反击速度 + 对抗强度",
    sentiment: "冷门呼声存在，但市场信心有限"
  },
  egypt: {
    name: "埃及",
    shortName: "EGY",
    flag: "🇪🇬",
    rankBand: "中游",
    form: "防守韧性强，反击效率是生命线",
    fitness: "锋线核心牵制力大，阵容厚度一般",
    tacticalProfile: "低位防守 + 快速反击 + 定位球",
    sentiment: "舆论认为有机会从五五开对局突围"
  },
  australia: {
    name: "澳大利亚",
    shortName: "AUS",
    flag: "🇦🇺",
    rankBand: "中游",
    form: "身体对抗稳定，阵地战创造力偏少",
    fitness: "整体跑动可靠，前场变化不足",
    tacticalProfile: "防空 + 直接打法 + 定位球",
    sentiment: "被看作硬仗型球队，冷门空间有限"
  },
  capeverde: {
    name: "佛得角",
    shortName: "CPV",
    flag: "🇨🇻",
    rankBand: "黑马区间",
    form: "历史性突破，防守专注度高",
    fitness: "阵容深度和大赛经验是短板",
    tacticalProfile: "低位收缩 + 反击寻找单点",
    sentiment: "中立球迷支持度高，压力相对较小"
  },
  paraguay: {
    name: "巴拉圭",
    shortName: "PAR",
    flag: "🇵🇾",
    rankBand: "中游",
    form: "淘汰赛韧性强，进球产量不高",
    fitness: "防线对抗好，前场缺少稳定破局点",
    tacticalProfile: "压缩空间 + 定位球 + 慢节奏消耗",
    sentiment: "外界普遍视为法国面前的挑战者"
  }
};

export const baseline = {
  title: "世界杯淘汰赛预测台",
  timestamp: "北京时间 2026-07-03 22:30",
  note: "以已确认 32 强赛果为事实；7 月 3 日未完赛场次作为预测递推。",
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
    "法国 3-0 瑞典",
    "加拿大 1-0 南非",
    "巴西 2-1 日本",
    "美国 2-0 波黑",
    "西班牙 3-0 奥地利",
    "葡萄牙 2-1 克罗地亚",
    "瑞士 2-0 阿尔及利亚"
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

export const matches: PredictionMatch[] = [
  {
    id: "r32-aus-egy",
    round: "32 强剩余",
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
    round: "32 强剩余",
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
    round: "32 强剩余",
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
    label: "32 强剩余",
    window: "7.3",
    matches: [
      { id: "b-r32-1", left: "澳大利亚", right: "埃及", score: "1-2", winner: "埃及", confidence: "低" },
      { id: "b-r32-2", left: "阿根廷", right: "佛得角", score: "3-0", winner: "阿根廷", confidence: "高" },
      { id: "b-r32-3", left: "哥伦比亚", right: "加纳", score: "2-1", winner: "哥伦比亚", confidence: "中" }
    ]
  },
  {
    label: "16 强",
    window: "7.4-7.7",
    matches: [
      { id: "b-r16-1", left: "加拿大", right: "摩洛哥", score: "1-1 点", winner: "摩洛哥", confidence: "低" },
      { id: "b-r16-2", left: "巴拉圭", right: "法国", score: "0-2", winner: "法国", confidence: "高" },
      { id: "b-r16-3", left: "巴西", right: "挪威", score: "2-1", winner: "巴西", confidence: "中" },
      { id: "b-r16-4", left: "墨西哥", right: "英格兰", score: "0-1 加", winner: "英格兰", confidence: "低" },
      { id: "b-r16-5", left: "葡萄牙", right: "西班牙", score: "1-2", winner: "西班牙", confidence: "中" },
      { id: "b-r16-6", left: "美国", right: "比利时", score: "1-2 加", winner: "比利时", confidence: "低" },
      { id: "b-r16-7", left: "瑞士", right: "哥伦比亚", score: "1-1 点", winner: "哥伦比亚", confidence: "低" },
      { id: "b-r16-8", left: "埃及", right: "阿根廷", score: "0-2", winner: "阿根廷", confidence: "高" }
    ]
  },
  {
    label: "8 强",
    window: "7.9-7.11",
    matches: [
      { id: "b-qf-1", left: "摩洛哥", right: "法国", score: "1-2", winner: "法国", confidence: "中" },
      { id: "b-qf-2", left: "巴西", right: "英格兰", score: "2-1", winner: "巴西", confidence: "中" },
      { id: "b-qf-3", left: "西班牙", right: "比利时", score: "2-1", winner: "西班牙", confidence: "中" },
      { id: "b-qf-4", left: "哥伦比亚", right: "阿根廷", score: "1-2", winner: "阿根廷", confidence: "中" }
    ]
  },
  {
    label: "半决赛",
    window: "7.14-7.15",
    matches: [
      { id: "b-sf-1", left: "法国", right: "巴西", score: "1-2", winner: "巴西", confidence: "低" },
      { id: "b-sf-2", left: "西班牙", right: "阿根廷", score: "1-1 点", winner: "阿根廷", confidence: "低" }
    ]
  },
  {
    label: "决赛",
    window: "7.19",
    matches: [
      { id: "b-final", left: "巴西", right: "阿根廷", score: "2-1", winner: "巴西", confidence: "低" }
    ]
  }
];

export const sources = [
  "FIFA Match Centre / 官方赛程",
  "SBNation 32 强赛程赛果",
  "The Guardian 实时战报",
  "NY Post 美国队赛况报道",
  "FIFA 排名与公开赔率市场",
  "各队公开伤停与媒体舆论"
];
