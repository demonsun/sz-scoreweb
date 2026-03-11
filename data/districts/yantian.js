module.exports = {
  name: '盐田区',
  key: 'yantian',
  description: 'ABCDEF六类，积分=类别分+累加分',
  color: '#0277bd',
  icon: 'yantian',

  areas: [
    { value: 'yantian_jd', label: '盐田街道' },
    { value: 'shatoujiao', label: '沙头角街道' },
    { value: 'meisha', label: '梅沙街道' },
    { value: 'haishan', label: '海山街道' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的街道',
    subtitle: '选择住所所在街道，帮你筛选对应学校',
    type: 'single',
    options: [
      { label: '盐田街道', value: 'yantian_jd' },
      { label: '沙头角街道', value: 'shatoujiao' },
      { label: '梅沙街道', value: 'meisha' },
      { label: '海山街道', value: 'haishan' },
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
        { label: '盐田区户籍', value: 'yantian' },
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
        { label: '自购商品房', value: 'commercial' },
        { label: '特殊房产（自建房/军产房等）', value: 'special' },
        { label: '租房（有租赁凭证-红本）', value: 'rent_cert' },
        { label: '租房（居住信息登记）', value: 'rent_register' },
        { label: '政府公租房/人才房', value: 'gov_rent' }
      ]
    },
    {
      id: 'residence_months',
      title: '居住/购房时长（月）',
      subtitle: '按房产证或租赁凭证日期计算',
      type: 'number',
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'hukou_months',
      title: '入户时长（月）',
      subtitle: '深户按户籍迁入盐田区时长（非深户填0）',
      type: 'number',
      showWhen: { hukou: ['yantian'] },
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
    }
  ],

  calcScore: function (answers) {
    var hukou = answers.hukou;
    var housing = answers.housing;
    var resMonths = parseInt(answers.residence_months) || 0;
    var hukouMonths = parseInt(answers.hukou_months) || 0;
    var socialMonths = parseInt(answers.social_insurance_months) || 0;

    var baseScore = 0;
    var category = '';
    var isOwner = housing === 'commercial';
    var isSpecial = housing === 'special';
    var isRent = housing === 'rent_cert' || housing === 'rent_register' || housing === 'gov_rent';

    if (hukou === 'yantian' && isOwner) { baseScore = 100; category = 'A类'; }
    else if (hukou === 'shenzhen_other' && isOwner) { baseScore = 90; category = 'B类'; }
    else if (hukou === 'yantian' && (isSpecial || isRent)) { baseScore = 80; category = 'C类'; }
    else if (hukou === 'non_shenzhen' && isOwner) { baseScore = 70; category = 'D类'; }
    else if (hukou === 'shenzhen_other' && (isSpecial || isRent)) { baseScore = 65; category = 'E类'; }
    else { baseScore = 60; category = 'F类'; }

    var resBonus = resMonths * 0.01;
    var hukouBonus = (hukou === 'yantian') ? hukouMonths * 0.01 : 0;
    var socialBonus = (hukou === 'non_shenzhen') ? socialMonths * 0.01 : 0;

    var bonusScore = Math.round((resBonus + hukouBonus + socialBonus) * 100) / 100;
    var totalScore = Math.round((baseScore + bonusScore) * 100) / 100;

    var details = [
      { label: '基础分（' + category + '）', value: baseScore },
      { label: '居住时长累加分', value: Math.round(resBonus * 100) / 100 }
    ];
    if (hukouBonus > 0) details.push({ label: '入户时长累加分', value: Math.round(hukouBonus * 100) / 100 });
    if (socialBonus > 0) details.push({ label: '社保累加分', value: Math.round(socialBonus * 100) / 100 });

    return { baseScore: baseScore, bonusScore: bonusScore, totalScore: totalScore, category: category, details: details };
  },

  schools: [
    { name: '盐田区外国语小学', address: '盐田区盐田路', area: 'yantian_jd', scores: { 2023: 88.5, 2024: 86.3, 2025: 85.2 } },
    { name: '田心小学', address: '盐田区沙头角街道', area: 'shatoujiao', scores: { 2023: 78.6, 2024: 76.8, 2025: 75.5 } },
    { name: '盐港小学', address: '盐田区盐田街道', area: 'yantian_jd', scores: { 2023: 72.3, 2024: 71.5, 2025: 70.8 } },
    { name: '海涛小学', address: '盐田区海涛路', area: 'haishan', scores: { 2023: 75.2, 2024: 73.8, 2025: 72.6 } },
    { name: '林园小学', address: '盐田区沙头角街道', area: 'shatoujiao', scores: { 2023: 70.5, 2024: 69.2, 2025: 68.5 } },
    { name: '梅沙小学', address: '盐田区大梅沙', area: 'meisha', scores: { 2023: 65.8, 2024: 64.5, 2025: 63.8 } },
    { name: '东和小学', address: '盐田区盐田街道', area: 'yantian_jd', scores: { 2023: 68.2, 2024: 67.5, 2025: 66.8 } }
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
    { name: '盐田区外国语学校（初中部）', address: '盐田区盐田路', area: 'yantian_jd', scores: { 2023: 85.2, 2024: 83.5, 2025: 82.1 } },
    { name: '盐田实验学校（初中部）', address: '盐田区盐田街道', area: 'yantian_jd', scores: { 2023: 78.5, 2024: 76.8, 2025: 75.5 } },
    { name: '田东中学', address: '盐田区沙头角街道', area: 'shatoujiao', scores: { 2023: 72.3, 2024: 71.2, 2025: 70.5 } },
    { name: '盐港中学', address: '盐田区盐田街道', area: 'yantian_jd', scores: { 2023: 68.5, 2024: 67.5, 2025: 66.8 } },
    { name: '梅沙双语学校（初中部）', address: '盐田区大梅沙', area: 'meisha', scores: { 2023: 65.2, 2024: 64.5, 2025: 63.8 } }
  ]
};
