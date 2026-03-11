module.exports = {
  name: '大鹏新区',
  key: 'dapeng',
  description: '7类基础分60~90分，深户/非深户不同加分',
  color: '#5d4037',
  icon: 'dapeng',

  areas: [
    { value: 'kuiyong', label: '葵涌街道' },
    { value: 'dapeng_jd', label: '大鹏街道' },
    { value: 'nanao', label: '南澳街道' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的街道',
    subtitle: '选择住所所在街道，帮你筛选对应学校',
    type: 'single',
    options: [
      { label: '葵涌街道', value: 'kuiyong' },
      { label: '大鹏街道', value: 'dapeng_jd' },
      { label: '南澳街道', value: 'nanao' },
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
        { label: '大鹏新区户籍', value: 'dapeng' },
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
        { label: '自购商品房/祖屋', value: 'commercial' },
        { label: '特殊住房（自建房/军产房等）', value: 'special' },
        { label: '租房（有租赁凭证）', value: 'rent_cert' },
        { label: '租房（居住信息登记）', value: 'rent_register' },
        { label: '政府公租房/人才房', value: 'gov_rent' }
      ]
    },
    {
      id: 'residence_months',
      title: '居住时长（月）',
      subtitle: '按房产证或租赁凭证日期计算，截至申请当年3月31日',
      type: 'number',
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'social_insurance_months',
      title: '社保缴纳时长（月）',
      subtitle: '同时缴纳养老和医疗保险总月数',
      type: 'number',
      showWhen: { hukou: ['non_shenzhen'] },
      placeholder: '请输入社保月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'no_property',
      title: '深户租房是否有无房证明',
      subtitle: '深户租房可加5分',
      type: 'single',
      showWhen: { housing: ['rent_cert', 'rent_register', 'gov_rent'] },
      options: [
        { label: '有无房证明', value: 'yes' },
        { label: '没有', value: 'no' }
      ]
    },
    {
      id: 'huzheng_bonus',
      title: '户证情况',
      subtitle: '符合条件可加0.5分',
      type: 'single',
      options: [
        { label: '适龄儿童为大鹏户籍', value: 'yes' },
        { label: '非深户父母双方均有居住证', value: 'yes' },
        { label: '不符合以上条件', value: 'no' }
      ]
    }
  ],

  calcScore: function (answers) {
    var hukou = answers.hukou;
    var housing = answers.housing;
    var resMonths = parseInt(answers.residence_months) || 0;
    var socialMonths = parseInt(answers.social_insurance_months) || 0;
    var noProp = answers.no_property === 'yes';
    var huzheng = answers.huzheng_bonus === 'yes';

    var baseScore = 0;
    var category = '';
    var isOwner = housing === 'commercial';
    var isSpecial = housing === 'special';
    var isRent = housing === 'rent_cert' || housing === 'rent_register' || housing === 'gov_rent';
    var isDeep = hukou === 'dapeng' || hukou === 'shenzhen_other';

    if (hukou === 'dapeng' && isOwner) { baseScore = 90; category = '第一类'; }
    else if (hukou === 'dapeng' && isSpecial) { baseScore = 85; category = '第二类'; }
    else if ((hukou === 'dapeng' && isRent) || (hukou === 'shenzhen_other' && isOwner)) { baseScore = 80; category = '第三类'; }
    else if ((hukou === 'shenzhen_other' && isSpecial) || (hukou === 'non_shenzhen' && isOwner)) { baseScore = 75; category = '第四类'; }
    else if (hukou === 'shenzhen_other' && isRent) { baseScore = 70; category = '第五类'; }
    else if (hukou === 'non_shenzhen' && isSpecial) { baseScore = 65; category = '第六类'; }
    else { baseScore = 60; category = '第七类'; }

    var resBonus = 0;
    var socialBonus = 0;
    var noPropBonus = 0;
    var huzhengBonus = huzheng ? 0.5 : 0;

    if (isDeep) {
      resBonus = Math.min(resMonths * 0.1, 7.2);
      noPropBonus = (isRent && noProp) ? 5 : 0;
    } else {
      socialBonus = Math.min(Math.max(socialMonths - 24, 0) * 0.1, 6);
      resBonus = resMonths * 0.1;
    }

    var bonusScore = Math.round((resBonus + socialBonus + noPropBonus + huzhengBonus) * 10) / 10;
    var totalScore = Math.round((baseScore + bonusScore) * 10) / 10;

    var details = [
      { label: '基础分（' + category + '）', value: baseScore },
      { label: '居住时长加分', value: Math.round(resBonus * 10) / 10 }
    ];
    if (socialBonus > 0) details.push({ label: '社保加分', value: Math.round(socialBonus * 10) / 10 });
    if (noPropBonus > 0) details.push({ label: '无房证明加分', value: noPropBonus });
    if (huzhengBonus > 0) details.push({ label: '户证加分', value: huzhengBonus });

    return { baseScore: baseScore, bonusScore: bonusScore, totalScore: totalScore, category: category, details: details };
  },

  schools: [
    { name: '人大附中深圳学校（小学部）', address: '大鹏新区葵涌街道', area: 'kuiyong', scores: { 2023: 78.5, 2024: 80.2, 2025: 82.6 } },
    { name: '葵涌中心小学', address: '大鹏新区葵涌街道', area: 'kuiyong', scores: { 2023: 72.3, 2024: 74.5, 2025: 76.2 } },
    { name: '大鹏中心小学', address: '大鹏新区大鹏街道', area: 'dapeng_jd', scores: { 2023: 68.5, 2024: 70.2, 2025: 71.8 } },
    { name: '南澳中心小学', address: '大鹏新区南澳街道', area: 'nanao', scores: { 2023: 63.2, 2024: 64.8, 2025: 66.1 } },
    { name: '葵涌第二小学', address: '大鹏新区葵涌街道', area: 'kuiyong', scores: { 2023: 66.8, 2024: 68.2, 2025: 69.5 } },
    { name: '溪涌小学', address: '大鹏新区葵涌街道', area: 'kuiyong', scores: { 2023: 62.5, 2024: 63.8, 2025: 65.2 } }
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
    { name: '人大附中深圳学校（初中部）', address: '大鹏新区葵涌街道', area: 'kuiyong', scores: { 2023: 80.5, 2024: 82.2, 2025: 84.5 } },
    { name: '葵涌中学', address: '大鹏新区葵涌街道', area: 'kuiyong', scores: { 2023: 72.3, 2024: 74.2, 2025: 75.8 } },
    { name: '大鹏中学', address: '大鹏新区大鹏街道', area: 'dapeng_jd', scores: { 2023: 68.5, 2024: 70.1, 2025: 71.5 } },
    { name: '亚迪学校（初中部）', address: '大鹏新区葵涌街道', area: 'kuiyong', scores: { 2023: 65.2, 2024: 66.8, 2025: 68.2 } }
  ]
};
