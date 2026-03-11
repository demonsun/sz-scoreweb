module.exports = {
  name: '龙华区',
  key: 'longhua',
  description: '6类统一基础分60分，加分不封顶',
  color: '#00897b',
  icon: 'longhua',

  areas: [
    { value: 'minzhi', label: '民治街道' },
    { value: 'longhua_jd', label: '龙华街道' },
    { value: 'guanlan', label: '观澜街道' },
    { value: 'fucheng_lh', label: '福城街道' },
    { value: 'dalang', label: '大浪街道' },
    { value: 'other_lh', label: '其他街道' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的街道',
    subtitle: '选择住所所在街道，帮你筛选对应学校',
    type: 'single',
    options: [
      { label: '民治街道', value: 'minzhi' },
      { label: '龙华街道', value: 'longhua_jd' },
      { label: '观澜街道', value: 'guanlan' },
      { label: '福城街道', value: 'fucheng_lh' },
      { label: '大浪街道', value: 'dalang' },
      { label: '其他街道', value: 'other_lh' },
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
        { label: '龙华区户籍', value: 'longhua' },
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
        { label: '自购商品房/安居商品房', value: 'commercial' },
        { label: '原著居民住房', value: 'ancestral' },
        { label: '租房（有房屋租赁凭证）', value: 'rent_cert' },
        { label: '公共租赁房/人才房', value: 'gov_rent' },
        { label: '其他类住房（居住信息登记）', value: 'other' }
      ]
    },
    {
      id: 'residence_months',
      title: '居住时长（月）',
      subtitle: '商品房按房产证发证日期计算，租房按租赁凭证签发日期计算，截至申请当年3月31日',
      type: 'number',
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'hukou_months',
      title: '深户入户时长（月）',
      subtitle: '父母一方入深户的最长时长（非深户填0）',
      type: 'number',
      showWhen: { hukou: ['longhua', 'shenzhen_other'] },
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 600
    },
    {
      id: 'social_insurance_months',
      title: '社保累计缴纳时长（月）',
      subtitle: '父母一方同时缴纳养老和医疗保险的月数',
      type: 'number',
      showWhen: { hukou: ['non_shenzhen'] },
      placeholder: '请输入社保月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'juzhuzheng_months',
      title: '居住证办理时长（月）',
      subtitle: '父母一方《深圳经济特区居住证》办理时长（非深户填写）',
      type: 'number',
      showWhen: { hukou: ['non_shenzhen'] },
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 360
    }
  ],

  calcScore: function (answers) {
    var hukou = answers.hukou;
    var housing = answers.housing;
    var resMonths = parseInt(answers.residence_months) || 0;
    var hukouMonths = parseInt(answers.hukou_months) || 0;
    var socialMonths = parseInt(answers.social_insurance_months) || 0;
    var jzzMonths = parseInt(answers.juzhuzheng_months) || 0;

    var baseScore = 60;
    var category = '';
    var isOwner = housing === 'commercial' || housing === 'ancestral';
    var isRent = !isOwner;
    var isDeep = hukou === 'longhua' || hukou === 'shenzhen_other';

    if (hukou === 'longhua' && isOwner) { category = '第一类'; }
    else if (hukou === 'shenzhen_other' && isOwner) { category = '第二类'; }
    else if (hukou === 'longhua' && isRent) { category = '第三类'; }
    else if (hukou === 'shenzhen_other' && isRent) { category = '第四类'; }
    else if (hukou === 'non_shenzhen' && isOwner) { category = '第五类'; }
    else { category = '第六类'; }

    var residenceBonus = 0;
    var hukouBonus = 0;
    var socialBonus = 0;
    var jzzBonus = 0;
    var details = [{ label: '基础分（' + category + '）', value: baseScore }];

    if (isDeep) {
      residenceBonus = resMonths * 0.1;
      hukouBonus = hukouMonths * 0.1;
      details.push({ label: '居住时长加分（' + resMonths + '月×0.1）', value: Math.round(residenceBonus * 10) / 10 });
      details.push({ label: '户籍时长加分（' + hukouMonths + '月×0.1）', value: Math.round(hukouBonus * 10) / 10 });
    } else {
      socialBonus = socialMonths * 0.1;
      jzzBonus = jzzMonths * 0.1;
      details.push({ label: '社保加分（' + socialMonths + '月×0.1）', value: Math.round(socialBonus * 10) / 10 });
      details.push({ label: '居住证加分（' + jzzMonths + '月×0.1）', value: Math.round(jzzBonus * 10) / 10 });
    }

    var bonusScore = Math.round((residenceBonus + hukouBonus + socialBonus + jzzBonus) * 10) / 10;
    var totalScore = Math.round((baseScore + bonusScore) * 10) / 10;

    return {
      baseScore: baseScore,
      bonusScore: bonusScore,
      totalScore: totalScore,
      category: category,
      details: details
    };
  },

  schools: [
    { name: '深圳高级中学北校区（小学部）', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 98.5, 2024: 102.3, 2025: 105.6 } },
    { name: '龙华中心小学', address: '龙华区龙华街道', area: 'longhua_jd', scores: { 2023: 85.6, 2024: 88.2, 2025: 90.5 } },
    { name: '民治小学', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 82.3, 2024: 84.8, 2025: 87.2 } },
    { name: '龙华实验学校（小学部）', address: '龙华区龙华街道', area: 'longhua_jd', scores: { 2023: 88.2, 2024: 90.6, 2025: 93.1 } },
    { name: '书香小学', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 80.5, 2024: 82.8, 2025: 85.3 } },
    { name: '深圳外国语学校龙华学校（小学部）', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 92.1, 2024: 95.3, 2025: 98.6 } },
    { name: '行知实验小学', address: '龙华区龙华街道', area: 'longhua_jd', scores: { 2023: 78.6, 2024: 80.5, 2025: 82.8 } },
    { name: '玉龙学校（小学部）', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 76.8, 2024: 78.5, 2025: 80.2 } },
    { name: '观澜中心小学', address: '龙华区观澜街道', area: 'guanlan', scores: { 2023: 72.3, 2024: 74.5, 2025: 76.8 } },
    { name: '福苑学校（小学部）', address: '龙华区福城街道', area: 'fucheng_lh', scores: { 2023: 68.5, 2024: 70.2, 2025: 72.6 } },
    { name: '丹堤实验学校（小学部）', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 75.2, 2024: 77.6, 2025: 79.8 } },
    { name: '龙华第二小学', address: '龙华区龙华街道', area: 'longhua_jd', scores: { 2023: 74.5, 2024: 76.8, 2025: 78.5 } }
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
    { name: '深圳高级中学北校区（初中部）', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 102.5, 2024: 105.8, 2025: 108.2 } },
    { name: '深圳外国语学校龙华学校（初中部）', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 95.6, 2024: 98.2, 2025: 101.5 } },
    { name: '龙华实验学校（初中部）', address: '龙华区龙华街道', area: 'longhua_jd', scores: { 2023: 90.5, 2024: 92.8, 2025: 95.2 } },
    { name: '民治中学', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 82.3, 2024: 84.5, 2025: 86.8 } },
    { name: '龙华中学', address: '龙华区龙华街道', area: 'longhua_jd', scores: { 2023: 78.5, 2024: 80.2, 2025: 82.5 } },
    { name: '观澜中学', address: '龙华区观澜街道', area: 'guanlan', scores: { 2023: 72.3, 2024: 74.5, 2025: 76.2 } },
    { name: '新华中学', address: '龙华区龙华街道', area: 'longhua_jd', scores: { 2023: 75.8, 2024: 77.5, 2025: 79.6 } },
    { name: '丹堤实验学校（初中部）', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 76.5, 2024: 78.8, 2025: 80.5 } },
    { name: '福苑学校（初中部）', address: '龙华区福城街道', area: 'fucheng_lh', scores: { 2023: 68.5, 2024: 70.2, 2025: 72.5 } },
    { name: '玉龙学校（初中部）', address: '龙华区民治街道', area: 'minzhi', scores: { 2023: 78.2, 2024: 80.5, 2025: 82.1 } }
  ]
};
