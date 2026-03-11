module.exports = {
  name: '龙岗区',
  key: 'longgang',
  description: '7类基础分60~100分，加分上限10分',
  color: '#7b1fa2',
  icon: 'longgang',

  areas: [
    { value: 'longcheng', label: '龙城街道' },
    { value: 'buji', label: '布吉街道' },
    { value: 'bantian', label: '坂田街道' },
    { value: 'henggang', label: '横岗街道' },
    { value: 'longgang_jd', label: '龙岗街道' },
    { value: 'other_lg', label: '其他街道' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的街道',
    subtitle: '选择住所所在街道，帮你筛选对应学校',
    type: 'single',
    options: [
      { label: '龙城街道', value: 'longcheng' },
      { label: '布吉街道', value: 'buji' },
      { label: '坂田街道', value: 'bantian' },
      { label: '横岗街道', value: 'henggang' },
      { label: '龙岗街道', value: 'longgang_jd' },
      { label: '其他街道', value: 'other_lg' },
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
        { label: '龙岗区学区内户籍', value: 'longgang_xuequ' },
        { label: '龙岗区户籍（非学区）', value: 'longgang' },
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
        { label: '自购商品房（产权>50%）', value: 'commercial' },
        { label: '原居民祖屋', value: 'ancestral' },
        { label: '特殊住房（自建房/军产房/集资房等）', value: 'special' },
        { label: '租房（有房屋租赁凭证）', value: 'rent_cert' },
        { label: '租房（居住信息登记）', value: 'rent_register' },
        { label: '政府公租房/人才房', value: 'gov_rent' }
      ]
    },
    {
      id: 'residence_months',
      title: '居住时长（月）',
      subtitle: '产权证按发证日期计算，租赁凭证按登记备案日期计算，截至申请当年4月1日',
      type: 'number',
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'social_insurance_months',
      title: '社保累计缴纳时长（月）',
      subtitle: '父母一方同时缴纳养老和医疗保险的累计月数',
      type: 'number',
      placeholder: '请输入社保月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'xuequ_hukou_months',
      title: '学区户籍时长（月）',
      subtitle: '父母户籍迁入学区的月数（非学区户籍填0）',
      type: 'number',
      showWhen: { hukou: ['longgang_xuequ'] },
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'youxiang',
      title: '是否申请优享学区加分',
      subtitle: '仅在试点共享学区内选择对应优享学校作为第一志愿可加2.5分',
      type: 'single',
      options: [
        { label: '是', value: 'yes' },
        { label: '否 / 不适用', value: 'no' }
      ]
    }
  ],

  calcScore: function (answers) {
    var hukou = answers.hukou;
    var housing = answers.housing;
    var resMonths = parseInt(answers.residence_months) || 0;
    var socialMonths = parseInt(answers.social_insurance_months) || 0;
    var xqMonths = parseInt(answers.xuequ_hukou_months) || 0;
    var youxiang = answers.youxiang === 'yes';

    var baseScore = 0;
    var category = '';
    var isOwner = housing === 'commercial';
    var isAncestral = housing === 'ancestral';
    var isRent = housing === 'rent_cert' || housing === 'rent_register' || housing === 'gov_rent' || housing === 'special';

    if ((hukou === 'longgang_xuequ' || hukou === 'longgang') && isOwner) {
      baseScore = 100; category = '第一类';
    } else if (hukou === 'longgang_xuequ' && isAncestral) {
      baseScore = 100; category = '第一类';
    } else if (hukou === 'shenzhen_other' && isOwner) {
      baseScore = 95; category = '第二类';
    } else if (hukou === 'longgang_xuequ' && isRent) {
      baseScore = 90; category = '第三类';
    } else if (hukou === 'non_shenzhen' && isOwner) {
      baseScore = 80; category = '第四类';
    } else if (hukou === 'longgang' && isRent) {
      baseScore = 75; category = '第五类';
    } else if (hukou === 'shenzhen_other' && isRent) {
      baseScore = 70; category = '第六类';
    } else {
      baseScore = 60; category = '第七类';
    }

    var residenceBonus = (housing !== 'rent_register' && housing !== 'gov_rent') ? resMonths * 0.05 : 0;
    var socialBonus = Math.max(socialMonths - 12, 0) * 0.05;
    var xqBonus = (hukou === 'longgang_xuequ') ? xqMonths * 0.05 : 0;
    var youxiangBonus = youxiang ? 2.5 : 0;

    var totalBonus = residenceBonus + socialBonus + xqBonus + youxiangBonus;
    totalBonus = Math.min(totalBonus, 10);
    totalBonus = Math.round(totalBonus * 100) / 100;

    var totalScore = Math.round((baseScore + totalBonus) * 100) / 100;

    return {
      baseScore: baseScore,
      bonusScore: totalBonus,
      totalScore: totalScore,
      category: category,
      details: [
        { label: '基础分（' + category + '）', value: baseScore },
        { label: '居住时长加分', value: Math.round(residenceBonus * 100) / 100 },
        { label: '社保加分', value: Math.round(socialBonus * 100) / 100 },
        xqBonus > 0 ? { label: '学区户籍加分', value: Math.round(xqBonus * 100) / 100 } : null,
        youxiangBonus > 0 ? { label: '优享加分', value: youxiangBonus } : null
      ].filter(Boolean)
    };
  },

  schools: [
    { name: '深圳中学龙岗学校（小学部）', address: '龙岗区如意路', area: 'longcheng', scores: { 2023: 94, 2024: 100.2, 2025: 98.5 } },
    { name: '百外世纪小学（公办班）', address: '龙岗区布吉街道', area: 'buji', scores: { 2023: 107.35, 2024: 107.25, 2025: 107.9 } },
    { name: '百外世纪小学（民办班）', address: '龙岗区布吉街道', area: 'buji', scores: { 2023: 104.7, 2024: 103.5, 2025: 104.2 } },
    { name: '龙城小学', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 91.2, 2024: 93.5, 2025: 96.35 } },
    { name: '依山郡小学', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 95, 2024: 97.95, 2025: 100.1 } },
    { name: '春蕾小学', address: '龙岗区布吉街道', area: 'buji', scores: { 2023: 104.95, 2024: 103.8, 2025: 105.2 } },
    { name: '南京师范大学附属龙岗学校', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 85.6, 2024: 88.2, 2025: 90.1 } },
    { name: '怡翠实验学校（小学部）', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 82.3, 2024: 84.5, 2025: 86.8 } },
    { name: '平安里学校（小学部）', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 78.5, 2024: 80.2, 2025: 82.6 } },
    { name: '信义实验小学', address: '龙岗区布吉街道', area: 'buji', scores: { 2023: 80.1, 2024: 82.3, 2025: 84.5 } },
    { name: '石芽岭学校（小学部）', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 87.9, 2024: 85.3, 2025: 83.6 } },
    { name: '水径小学', address: '龙岗区布吉街道', area: 'buji', scores: { 2023: 90, 2024: 86.5, 2025: 84.2 } },
    { name: '木棉湾学校（小学部）', address: '龙岗区布吉街道', area: 'buji', scores: { 2023: 74, 2024: 78.6, 2025: 76.3 } },
    { name: '布吉中心小学', address: '龙岗区布吉街道', area: 'buji', scores: { 2023: 75.8, 2024: 77.2, 2025: 78.5 } },
    { name: '坂田小学', address: '龙岗区坂田街道', area: 'bantian', scores: { 2023: 72.5, 2024: 74.8, 2025: 76.1 } }
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
    { name: '深圳中学龙岗学校（初中部）', address: '龙岗区如意路', area: 'longcheng', scores: { 2023: 98.5, 2024: 102.3, 2025: 100.8 } },
    { name: '百外世纪学校（初中部·公办）', address: '龙岗区布吉街道', area: 'buji', scores: { 2023: 106.5, 2024: 107.2, 2025: 108.1 } },
    { name: '龙城初级中学', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 88.5, 2024: 90.2, 2025: 92.5 } },
    { name: '新亚洲学校（初中部）', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 82.3, 2024: 84.5, 2025: 86.2 } },
    { name: '天成学校（初中部）', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 78.5, 2024: 80.2, 2025: 82.1 } },
    { name: '布吉中学', address: '龙岗区布吉街道', area: 'buji', scores: { 2023: 76.8, 2024: 78.5, 2025: 80.2 } },
    { name: '坂田实验学校（初中部）', address: '龙岗区坂田街道', area: 'bantian', scores: { 2023: 72.5, 2024: 74.8, 2025: 76.5 } },
    { name: '平安里学校（初中部）', address: '龙岗区龙城街道', area: 'longcheng', scores: { 2023: 80.2, 2024: 82.5, 2025: 84.1 } },
    { name: '南联学校（初中部）', address: '龙岗区龙岗街道', area: 'longgang_jd', scores: { 2023: 70.5, 2024: 72.2, 2025: 73.8 } },
    { name: '横岗中学', address: '龙岗区横岗街道', area: 'henggang', scores: { 2023: 68.5, 2024: 70.2, 2025: 71.8 } }
  ]
};
