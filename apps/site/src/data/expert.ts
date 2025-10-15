// apps/site/src/data/expert.ts
// Bilingual dataset for /biobran/expert/
// Chinese is primary; original (ja/en) kept as secondary display.
// Expand this file with more records or generate from expert_raw.json.

export type ExpertItem = {
  id: string;
  year: number;
  month?: string; // for "2023.6" style
  kind: 'paper' | 'presentation';
  // Primary
  title_zh: string;
  authors_zh?: string;
  journal_zh?: string;
  // Secondary (original)
  title_orig: string;
  authors_orig?: string;
  journal_orig?: string;
  lang_orig: 'ja' | 'en';
  // Links
  doi?: string;
  url?: string;
};

export const papers: ExpertItem[] = [
  {
    id: 'paper-2024-ijms-epigenetic-aging',
    year: 2024,
    kind: 'paper',
    title_zh: '含米开菲兰的大和米蕈（BioBran®）对生物学年龄（Epigenetic Aging Clock）改善的验证研究',
    authors_zh: 'Satoshi Kawakami, Ryo Ninomiya, Yusuke Maeda',
    journal_zh: 'International Journal of Molecular Sciences 25(12):6332',
    title_orig: '米ケフィラン含有バイオブランの摂取による生物学的年齢(Epigenetic Aging Clock)の改善に対する検証',
    authors_orig: 'Satoshi Kawakami, Ryo Ninomiya, Yusuke Maeda',
    journal_orig: 'Int J Mol Sci. 2024 Jun 7; 25(12): 6332',
    lang_orig: 'ja',
    doi: '10.3390/ijms25126332',
    url: ''
  },
  {
    id: 'paper-2024-pharmbiol-review',
    year: 2024,
    kind: 'paper',
    title_zh: '作为肿瘤治疗天然产物的米糠阿拉伯木聚糖化合物：基于证据的效应与机制评估',
    authors_zh: 'Soo Liang Ooi, Peter S. Micalos, Jeanman Kim, Sok Cheon Pak',
    journal_zh: 'Pharmacognosy/Pharm Biol. 62(1):367‑393',
    title_orig: 'がん治療のための天然物としての米ぬかアラビノキシラン化合物―その効果とメカニズムのエビデンスに基づく評価',
    authors_orig: 'Soo Liang Ooi, Peter S. Micalos, Jeanman Kim, Sok Cheon Pak',
    journal_orig: 'Pharm Biol. 2024 Dec; 62(1): 367-393',
    lang_orig: 'ja',
    doi: '10.1080/13880209.2024.2349042',
    url: ''
  },
  {
    id: 'paper-2024-nutrients-covid',
    year: 2024,
    kind: 'paper',
    title_zh: '米糠阿拉伯木聚糖（大和米蕈/BioBran®/MGN‑3）在人群中的抗 COVID‑19 作用与免疫增强',
    authors_zh: 'Sudhanshu Agrawal, Anshu Agrawal, Mamdooh Ghoneum',
    journal_zh: 'Nutrients 16:881',
    title_orig: '米ぬかアラビノキシラン (バイオブラン/MGN-3) はヒトにおいて抗COVID-19効果を発揮し、免疫を増強する',
    authors_orig: 'Sudhanshu Agrawal, Anshu Agrawal and Mamdooh Ghoneum',
    journal_orig: 'Nutrients 2024, 16, 881',
    lang_orig: 'ja',
    doi: '',
    url: 'https://doi.org/10.3390/nu16060881'
  },
  {
    id: 'paper-2024-cureus-qol',
    year: 2024,
    kind: 'paper',
    title_zh: '米糠阿拉伯木聚糖与肿瘤患者生活质量（RBAC‑QoL）：RBAC‑QoL 研究的期中分析',
    authors_zh: 'Soo Liang Ooi, Peter S. Micalos, Rob Zielinski, Sok Cheon Pak',
    journal_zh: 'Cureus 16(1):e53188',
    title_orig: '米ぬかアラビノキシラン化合物とがん患者のQoL（RBAC-QoL）： RBAC-QoL研究の中間解析',
    authors_orig: 'Soo Liang Ooi, Peter S. Micalos, Rob Zielinski, Sok Cheon Pak',
    journal_orig: 'Cureus 16(1): e53188',
    lang_orig: 'ja',
    doi: '10.7759/cureus.53188',
    url: ''
  },
  {
    id: 'paper-2023-molecules-review',
    year: 2023,
    kind: 'paper',
    title_zh: '由香菇酶生成的修饰米糠阿拉伯木聚糖（大和米蕈/BioBran®）：健康与老龄的免疫制剂——综合综述',
    authors_zh: 'Soo Liang Ooi, Peter S. Micalos, Sok Cheon Pak',
    journal_zh: 'Molecules 28(17):6313',
    title_orig: 'Lentinus edodes菌糸体酵素により生み出される修飾米ぬかアラビノキシラン、健康と老化のための免疫製剤-包括的文献レビュー',
    authors_orig: 'Ooi, Soo Liang; Peter S. Micalos; Sok Cheon Pak',
    journal_orig: 'Molecules. 2023; 28(17):6313',
    lang_orig: 'ja',
    doi: '',
    url: ''
  },
  {
    id: 'paper-2023-plosone-bibliometric',
    year: 2023,
    kind: 'paper',
    title_zh: '健康与疾病中作为营养补充剂的修饰米糠阿拉伯木聚糖：计量学范围综述',
    authors_zh: 'Soo Liang Ooi, Peter S. Micalos, Sok Cheon Pak',
    journal_zh: 'PLoS One 18(8):e0290314',
    title_orig: '健康と疾病における栄養補助食品としての修飾米ぬかアラビノキシラン-計量書誌学的分析によるスコープ・レビュー',
    authors_orig: 'Soo Liang Ooi, Peter S. Micalos, Sok Cheon Pak',
    journal_orig: 'PLoS One. 2023 Aug 31;18(8):e0290314',
    lang_orig: 'ja',
    doi: '',
    url: ''
  }
];

export const presentations: ExpertItem[] = [
  {
    id: 'pres-2023-6-cd14-tlr4',
    year: 2023,
    month: '6',
    kind: 'presentation',
    title_zh: 'BioBran®（MGN‑3）通过 CD14/TLR‑4 通路在感染性糖尿病足溃疡的高糖 in vitro 模型中增强宿主‑病原体相互作用',
    authors_zh: 'Shah, Sana; El Mohtadi, Mohamed; Ashworth, Jason',
    journal_zh: 'Phagocytes Gordon Research Conference 2023',
    title_orig: 'Biobran (MGN-3) enhances host-pathogen interaction in an in vitro hyperglycaemic model of an infected diabetic foot ulcer via the CD14/TLR-4 pathway',
    authors_orig: 'Shah, Sana, El Mohtadi, Mohamed and Ashworth, Jason',
    journal_orig: 'Phagocytes Gordon Research Conference 2023',
    lang_orig: 'en',
    doi: '',
    url: ''
  },
  {
    id: 'pres-2023-6-lps-cd14-biofilm',
    year: 2023,
    month: '6',
    kind: 'presentation',
    title_zh: 'BioBran®（MGN‑3）同时逆转 LPS 诱导的 CD14 升高并改善糖尿病创口生物膜模型中巨噬细胞介导的细菌清除受损',
    authors_zh: 'Asif, Mohammed Subhan; El Mohtadi, Mohamed; Ashworth, Jason',
    journal_zh: 'Phagocytes Gordon Research Conference 2023',
    title_orig: 'Biobran (MGN-3) concurrently reverses lipopolysaccharide-induced elevation of CD14 and impairment of macrophage-mediated bacterial clearance in a model of diabetic wound biofilms',
    authors_orig: 'Asif, Mohammed Subhan, El Mohtadi, Mohamed and Ashworth, Jason',
    journal_orig: 'Phagocytes Gordon Research Conference 2023',
    lang_orig: 'en',
    doi: '',
    url: ''
  }
];
