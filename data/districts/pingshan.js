module.exports = {
  name: '坪山区',
  key: 'pingshan',
  description: '6类学位，满分100分，从0起算',
  color: '#558b2f',
  icon: 'pingshan',

  areas: [
    { value: 'pingshan_jd', label: '坪山街道' },
    { value: 'kengzi', label: '坑梓街道' },
    { value: 'longtian', label: '龙田街道' },
    { value: 'biling', label: '碧岭街道' },
    { value: 'shijing', label: '石井街道' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的街道',
    subtitle: '选择住所所在街道，帮你筛选对应学校',
    type: 'single',
    options: [
      { label: '坪山街道', value: 'pingshan_jd' },
      { label: '坑梓街道', value: 'kengzi' },
      { label: '龙田街道', value: 'longtian' },
      { label: '碧岭街道', value: 'biling' },
      { label: '石井街道', value: 'shijing' },
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
        { label: '坪山区户籍', value: 'pingshan' },
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
        { label: '特殊房产（自建房/军产房等）', value: 'special' },
        { label: '租房（有租赁凭证）', value: 'rent_cert' },
        { label: '租房（居住信息登记）', value: 'rent_register' },
        { label: '政府公租房/人才房', value: 'gov_rent' }
      ]
    },
    {
      id: 'residence_months',
      title: '居住时长（月）',
      subtitle: '满1年基础上的额外月数',
      type: 'number',
      placeholder: '请输入总月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'social_insurance_months',
      title: '社保累计缴纳时长（月）',
      subtitle: '同时缴纳养老和医疗保险的总月数',
      type: 'number',
      placeholder: '请输入社保月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'both_jzz',
      title: '父母是否双方均持有居住证',
      subtitle: '非深户适用，双方持证可加4分',
      type: 'single',
      showWhen: { hukou: ['non_shenzhen'] },
      options: [
        { label: '是', value: 'yes' },
        { label: '否', value: 'no' }
      ]
    },
    {
      id: 'no_property',
      title: '是否能提供深圳无房证明',
      subtitle: '深户其他区可加3分',
      type: 'single',
      showWhen: { hukou: ['shenzhen_other'] },
      options: [
        { label: '能提供', value: 'yes' },
        { label: '不能', value: 'no' }
      ]
    }
  ],

  calcScore: function (answers) {
    var hukou = answers.hukou;
    var housing = answers.housing;
    var resMonths = parseInt(answers.residence_months) || 0;
    var socialMonths = parseInt(answers.social_insurance_months) || 0;
    var bothJzz = answers.both_jzz === 'yes';
    var noProperty = answers.no_property === 'yes';

    var category = '';
    var isOwner = housing === 'commercial';
    var isRent = !isOwner;

    if (hukou === 'pingshan' && isOwner) { category = '第一类'; }
    else if (hukou === 'shenzhen_other' && isOwner) { category = '第二类'; }
    else if (hukou === 'pingshan' && isRent) { category = '第三类'; }
    else if (hukou === 'non_shenzhen' && isOwner) { category = '第四类'; }
    else if (hukou === 'shenzhen_other' && isRent) { category = '第五类'; }
    else { category = '第六类'; }

    var resBonus = Math.max(resMonths - 12, 0) * 0.3;
    var socialBonus = Math.max(socialMonths - 12, 0) * 0.2;
    var jzzBonus = (hukou === 'non_shenzhen' && bothJzz) ? 4 : 0;
    var noPropBonus = (hukou === 'shenzhen_other' && noProperty) ? 3 : 0;

    resBonus = Math.min(resBonus, 30);
    socialBonus = Math.min(socialBonus, 30);

    var totalScore = Math.round((resBonus + socialBonus + jzzBonus + noPropBonus) * 10) / 10;
    totalScore = Math.min(totalScore, 100);

    var details = [
      { label: '类别：' + category, value: 0 },
      { label: '居住时长加分', value: Math.round(resBonus * 10) / 10 },
      { label: '社保加分', value: Math.round(socialBonus * 10) / 10 }
    ];
    if (jzzBonus > 0) details.push({ label: '双居住证加分', value: jzzBonus });
    if (noPropBonus > 0) details.push({ label: '无房证明加分', value: noPropBonus });

    return { baseScore: 0, bonusScore: totalScore, totalScore: totalScore, category: category, details: details };
  },

  schools: [
    { name: '坪山实验学校（小学部）', address: '坪山区坪山街道', area: 'pingshan_jd', scores: { 2023: 48.5, 2024: 52.3, 2025: 55.6 } },
    { name: '坪山中心小学', address: '坪山区坪山街道', area: 'pingshan_jd', scores: { 2023: 42.3, 2024: 45.8, 2025: 48.2 } },
    { name: '中山小学', address: '坪山区坪山街道', area: 'pingshan_jd', scores: { 2023: 38.5, 2024: 40.2, 2025: 42.6 } },
    { name: '坪山第二小学', address: '坪山区坪山街道', area: 'pingshan_jd', scores: { 2023: 35.2, 2024: 37.8, 2025: 40.1 } },
    { name: '六联小学', address: '坪山区坪山街道', area: 'pingshan_jd', scores: { 2023: 30.5, 2024: 32.6, 2025: 34.8 } },
    { name: '碧岭小学', address: '坪山区碧岭街道', area: 'biling', scores: { 2023: 28.3, 2024: 30.1, 2025: 32.5 } },
    { name: '汤坑小学', address: '坪山区坑梓街道', area: 'kengzi', scores: { 2023: 25.6, 2024: 27.8, 2025: 29.3 } },
    { name: '锦龙小学', address: '坪山区龙田街道', area: 'longtian', scores: { 2023: 22.5, 2024: 24.6, 2025: 26.8 } }
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
    { name: '坪山实验学校（初中部）', address: '坪山区坪山街道', area: 'pingshan_jd', scores: { 2023: 52.5, 2024: 55.8, 2025: 58.2 } },
    { name: '坪山中学', address: '坪山区坪山街道', area: 'pingshan_jd', scores: { 2023: 45.6, 2024: 48.2, 2025: 50.5 } },
    { name: '光祖中学', address: '坪山区坑梓街道', area: 'kengzi', scores: { 2023: 35.2, 2024: 37.8, 2025: 40.1 } },
    { name: '坪山同心外国语学校（初中部）', address: '坪山区坪山街道', area: 'pingshan_jd', scores: { 2023: 40.5, 2024: 42.8, 2025: 45.2 } },
    { name: '锦龙学校（初中部）', address: '坪山区龙田街道', area: 'longtian', scores: { 2023: 28.5, 2024: 30.2, 2025: 32.6 } }
  ]
};
