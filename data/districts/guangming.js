module.exports = {
  name: '光明区',
  key: 'guangming',
  description: '8类基础分20~90分，加分项逐月累计',
  color: '#ef6c00',
  icon: 'guangming',

  areas: [
    { value: 'fenghuang', label: '凤凰街道' },
    { value: 'guangming_jd', label: '光明街道' },
    { value: 'gongming', label: '公明街道' },
    { value: 'matian', label: '马田街道' },
    { value: 'yutang', label: '玉塘街道' },
    { value: 'xinhu', label: '新湖街道' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的街道',
    subtitle: '选择住所所在街道，帮你筛选对应学校',
    type: 'single',
    options: [
      { label: '凤凰街道', value: 'fenghuang' },
      { label: '光明街道', value: 'guangming_jd' },
      { label: '公明街道', value: 'gongming' },
      { label: '马田街道', value: 'matian' },
      { label: '玉塘街道', value: 'yutang' },
      { label: '新湖街道', value: 'xinhu' },
      { label: '不确定/查看全部', value: 'all' }
    ]
  },

  questions: [
    {
      id: 'hukou',
      title: '孩子的户籍情况',
      subtitle: '请选择孩子当前的户籍类型',
      type: 'single',
      options: [
        { label: '光明区学区内户籍', value: 'guangming_xuequ' },
        { label: '光明区户籍（非学区）', value: 'guangming' },
        { label: '深圳其他区户籍', value: 'shenzhen_other' },
        { label: '非深圳户籍', value: 'non_shenzhen' }
      ]
    },
    {
      id: 'housing',
      title: '住房情况',
      subtitle: '请选择在学区内的住房类型',
      type: 'single',
      options: [
        { label: '自购商品房/安居房/祖屋', value: 'commercial' },
        { label: '租房（有租赁凭证）', value: 'rent_cert' },
        { label: '租房（居住信息登记）', value: 'rent_register' },
        { label: '政府公租房/人才房', value: 'gov_rent' }
      ]
    },
    {
      id: 'residence_months',
      title: '居住时长（月）',
      subtitle: '购房按房产证日期，租房按凭证日期计算',
      type: 'number',
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'hukou_months',
      title: '入户时长（月）',
      subtitle: '深户迁入时长（非深户填0）',
      type: 'number',
      showWhen: { hukou: ['guangming_xuequ', 'guangming', 'shenzhen_other'] },
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 600
    },
    {
      id: 'social_insurance_months',
      title: '社保缴纳时长（月）',
      subtitle: '同时缴纳养老和医疗保险月数',
      type: 'number',
      placeholder: '请输入社保月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'both_jzz',
      title: '父母是否双方持有居住证',
      subtitle: '非深户双居住证可加1分',
      type: 'single',
      showWhen: { hukou: ['non_shenzhen'] },
      options: [
        { label: '是', value: 'yes' },
        { label: '否', value: 'no' }
      ]
    }
  ],

  calcScore: function (answers) {
    var hukou = answers.hukou;
    var housing = answers.housing;
    var resMonths = parseInt(answers.residence_months) || 0;
    var hukouMonths = parseInt(answers.hukou_months) || 0;
    var socialMonths = parseInt(answers.social_insurance_months) || 0;
    var bothJzz = answers.both_jzz === 'yes';

    var baseScore = 0;
    var category = '';
    var isOwner = housing === 'commercial';
    var isRent = !isOwner;
    var isXuequ = hukou === 'guangming_xuequ';
    var isGM = hukou === 'guangming' || isXuequ;

    if (isXuequ && isOwner) { baseScore = 90; category = '第一类'; }
    else if (isXuequ && isRent) { baseScore = 80; category = '第二类'; }
    else if (hukou === 'guangming' && isOwner) { baseScore = 70; category = '第三类'; }
    else if (hukou === 'guangming' && isRent) { baseScore = 60; category = '第四类'; }
    else if (hukou === 'shenzhen_other' && isOwner) { baseScore = 50; category = '第五类'; }
    else if (hukou === 'shenzhen_other' && isRent) { baseScore = 40; category = '第六类'; }
    else if (hukou === 'non_shenzhen' && isOwner) { baseScore = 30; category = '第七类'; }
    else { baseScore = 20; category = '第八类'; }

    var resBonus = resMonths * 0.1;
    var hukouBonus = (isGM || hukou === 'shenzhen_other') ? hukouMonths * 0.1 : 0;
    var socialBonus = socialMonths * 0.1;
    var jzzBonus = (hukou === 'non_shenzhen' && bothJzz) ? 1 : 0;

    var bonusScore = Math.round((resBonus + hukouBonus + socialBonus + jzzBonus) * 10) / 10;
    var totalScore = Math.round((baseScore + bonusScore) * 10) / 10;

    var details = [
      { label: '基础分（' + category + '）', value: baseScore },
      { label: '居住时长加分', value: Math.round(resBonus * 10) / 10 },
      { label: '社保加分', value: Math.round(socialBonus * 10) / 10 }
    ];
    if (hukouBonus > 0) details.push({ label: '入户时长加分', value: Math.round(hukouBonus * 10) / 10 });
    if (jzzBonus > 0) details.push({ label: '双居住证加分', value: jzzBonus });

    return { baseScore: baseScore, bonusScore: bonusScore, totalScore: totalScore, category: category, details: details };
  },

  schools: [
    { name: '深圳实验光明学校（小学部）', address: '光明区凤凰街道', area: 'fenghuang', scores: { 2023: 92.5, 2024: 95.3, 2025: 97.8 } },
    { name: '光明区实验学校（小学部）', address: '光明区光明街道', area: 'guangming_jd', scores: { 2023: 78.6, 2024: 80.5, 2025: 82.3 } },
    { name: '南科大附属光明凤凰城学校', address: '光明区凤凰街道', area: 'fenghuang', scores: { 2023: 85.2, 2024: 94.1, 2025: 124.45 } },
    { name: '荔园学校（光明）', address: '光明区光明街道', area: 'guangming_jd', scores: { 2023: 45.6, 2024: 27, 2025: 83.3 } },
    { name: '曙光学校（小学部）', address: '光明区光明街道', area: 'guangming_jd', scores: { 2023: 58.3, 2024: 62.5, 2025: 68.2 } },
    { name: '东周小学', address: '光明区光明街道', area: 'guangming_jd', scores: { 2023: 55.2, 2024: 58.6, 2025: 62.3 } },
    { name: '公明第一小学', address: '光明区公明街道', area: 'gongming', scores: { 2023: 48.5, 2024: 50.8, 2025: 53.2 } },
    { name: '马田小学', address: '光明区马田街道', area: 'matian', scores: { 2023: 42.3, 2024: 44.5, 2025: 46.8 } },
    { name: '玉律小学', address: '光明区光明街道', area: 'guangming_jd', scores: { 2023: 38.6, 2024: 40.2, 2025: 42.5 } },
    { name: '凤凰学校（小学部）', address: '光明区凤凰街道', area: 'fenghuang', scores: { 2023: 52.8, 2024: 55.3, 2025: 58.1 } }
  ],

  chuzhongExtraQuestions: [
    {
      id: 'six_year_xueji',
      title: '是否具有深圳小学6年完整学籍',
      subtitle: '深户具有市小学6年学籍，或非深户具有6年学籍+父母满6年居住证和社保，可加1分',
      type: 'single',
      options: [
        { label: '是，符合条件', value: 'yes' },
        { label: '否', value: 'no' }
      ]
    }
  ],

  chuzhongSchools: [
    { name: '深圳实验光明学校（初中部）', address: '光明区凤凰街道', area: 'fenghuang', scores: { 2023: 95.2, 2024: 98.5, 2025: 100.3 } },
    { name: '光明区实验学校（初中部）', address: '光明区光明街道', area: 'guangming_jd', scores: { 2023: 80.5, 2024: 82.8, 2025: 85.2 } },
    { name: '光明区高级中学初中部', address: '光明区光明街道', area: 'guangming_jd', scores: { 2023: 75.8, 2024: 78.2, 2025: 80.5 } },
    { name: '公明中学', address: '光明区公明街道', area: 'gongming', scores: { 2023: 52.3, 2024: 55.6, 2025: 58.2 } },
    { name: '凤凰学校（初中部）', address: '光明区凤凰街道', area: 'fenghuang', scores: { 2023: 58.5, 2024: 60.8, 2025: 63.2 } },
    { name: '长圳学校（初中部）', address: '光明区光明街道', area: 'guangming_jd', scores: { 2023: 48.5, 2024: 50.2, 2025: 52.8 } },
    { name: '马田学校（初中部）', address: '光明区马田街道', area: 'matian', scores: { 2023: 45.2, 2024: 47.5, 2025: 50.1 } },
    { name: '李松蓢学校（初中部）', address: '光明区光明街道', area: 'guangming_jd', scores: { 2023: 42.5, 2024: 44.8, 2025: 46.5 } }
  ]
};
