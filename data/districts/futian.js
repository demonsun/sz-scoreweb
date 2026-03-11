module.exports = {
  name: '福田区',
  key: 'futian',
  description: '学位类型+积分，6类基础分60~80分',
  color: '#1a73e8',
  icon: 'futian',

  areas: [
    { value: 'baihua', label: '百花片区' },
    { value: 'yuanling', label: '园岭片区' },
    { value: 'jingtian', label: '景田片区' },
    { value: 'meilin', label: '梅林片区' },
    { value: 'huafu', label: '华富片区' },
    { value: 'fumin', label: '福民/福强片区' },
    { value: 'shangbu', label: '上步/南园片区' },
    { value: 'lianhua', label: '莲花片区' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的片区/街道',
    subtitle: '选择住所所在片区，帮你筛选学区对应学校',
    type: 'single',
    options: [
      { label: '百花片区', value: 'baihua' },
      { label: '园岭片区', value: 'yuanling' },
      { label: '景田片区', value: 'jingtian' },
      { label: '梅林片区', value: 'meilin' },
      { label: '华富片区', value: 'huafu' },
      { label: '福民/福强片区', value: 'fumin' },
      { label: '上步/南园片区', value: 'shangbu' },
      { label: '莲花片区', value: 'lianhua' },
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
        { label: '福田区户籍', value: 'futian' },
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
        { label: '父母在学区购商品房（产权≥51%）', value: 'commercial_bindhouse' },
        { label: '父母在学区购商品房（产权<51%）', value: 'commercial_partial' },
        { label: '自建房/集资房/军产房等特殊房产', value: 'special_housing' },
        { label: '租房（有房屋租赁凭证）', value: 'rent_certificate' },
        { label: '租房（居住信息登记）', value: 'rent_register' }
      ]
    },
    {
      id: 'child_in_hukou',
      title: '孩子是否入户到房产地址',
      subtitle: '孩子的户口是否落在学区住房地址上',
      type: 'single',
      showWhen: { housing: ['commercial_bindhouse', 'commercial_partial', 'special_housing'] },
      options: [
        { label: '是，孩子户口在该房产', value: 'yes' },
        { label: '否，孩子户口不在该房产', value: 'no' }
      ]
    },
    {
      id: 'residence_months',
      title: '居住时长（月）',
      subtitle: '购房按房产证发证日期计算，租房按租赁凭证签发日期计算，截至申请当年4月30日',
      type: 'number',
      placeholder: '请输入居住月数',
      unit: '个月',
      min: 0,
      max: 240
    },
    {
      id: 'social_insurance_months',
      title: '社保累计缴纳时长（月）',
      subtitle: '父母一方在深圳累计缴纳社保（同时含养老和医疗）的总月数',
      type: 'number',
      placeholder: '请输入社保月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'no_property_cert',
      title: '是否能提供无房证明',
      subtitle: '租房家庭如能提供深圳市无房证明可额外加2分',
      type: 'single',
      showWhen: { housing: ['rent_certificate', 'rent_register'] },
      options: [
        { label: '能提供无房证明', value: 'yes' },
        { label: '不能提供', value: 'no' }
      ]
    }
  ],

  calcScore: function (answers) {
    var hukou = answers.hukou;
    var housing = answers.housing;
    var childInHukou = answers.child_in_hukou || 'no';
    var residenceMonths = parseInt(answers.residence_months) || 0;
    var socialMonths = parseInt(answers.social_insurance_months) || 0;
    var noPropertyCert = answers.no_property_cert || 'no';

    var baseScore = 0;
    var category = '';

    var isOwner = housing === 'commercial_bindhouse';
    var isPartialOwner = housing === 'commercial_partial';
    var isSpecial = housing === 'special_housing';
    var isRent = housing === 'rent_certificate' || housing === 'rent_register';

    if (isOwner && childInHukou === 'yes') {
      baseScore = 80; category = '第一类';
    } else if (isOwner && childInHukou === 'no') {
      baseScore = 75; category = '第二类';
    } else if ((isSpecial || isPartialOwner) && childInHukou === 'yes') {
      baseScore = 70; category = '第三类';
    } else if ((isSpecial || isPartialOwner) && childInHukou === 'no') {
      baseScore = 65; category = '第四类';
    } else if (isRent && (hukou === 'futian' || hukou === 'shenzhen_other')) {
      baseScore = 65; category = '第五类';
    } else if (isRent && hukou === 'non_shenzhen') {
      baseScore = 60; category = '第六类';
    } else {
      baseScore = 60; category = '第六类';
    }

    var residenceBonus = Math.min(residenceMonths * 0.1, 10);
    var socialBonus = Math.min(socialMonths * 0.1, 10);
    var noPropertyBonus = (isRent && noPropertyCert === 'yes') ? 2 : 0;

    var bonusScore = Math.round((residenceBonus + socialBonus + noPropertyBonus) * 10) / 10;
    var totalScore = Math.round((baseScore + bonusScore) * 10) / 10;

    return {
      baseScore: baseScore,
      bonusScore: bonusScore,
      totalScore: totalScore,
      category: category,
      details: [
        { label: '基础分（' + category + '）', value: baseScore },
        { label: '居住时长加分', value: Math.round(residenceBonus * 10) / 10 },
        { label: '社保时长加分', value: Math.round(socialBonus * 10) / 10 },
        noPropertyBonus > 0 ? { label: '无房证明加分', value: noPropertyBonus } : null
      ].filter(Boolean)
    };
  },

  schools: [
    { name: '荔园小学（北校区）', address: '福田区百花二路', area: 'baihua', scores: { 2023: 90, 2024: 85, 2025: 76.3 } },
    { name: '园岭小学', address: '福田区园岭新村', area: 'yuanling', scores: { 2023: 83.2, 2024: 80.5, 2025: 78.1 } },
    { name: '福田小学', address: '福田区福强路', area: 'fumin', scores: { 2023: 75.6, 2024: 73.2, 2025: 71.8 } },
    { name: '百花小学', address: '福田区百花六路', area: 'baihua', scores: { 2023: 82.1, 2024: 80.3, 2025: 77.5 } },
    { name: '华富小学', address: '福田区华富路', area: 'huafu', scores: { 2023: 72.5, 2024: 70.8, 2025: 69.3 } },
    { name: '福民小学', address: '福田区福民路', area: 'fumin', scores: { 2023: 76.8, 2024: 74.5, 2025: 73.2 } },
    { name: '南华小学', address: '福田区沙嘴路', area: 'shangbu', scores: { 2023: 70.2, 2024: 68.5, 2025: 67.8 } },
    { name: '景秀小学', address: '福田区景田北路', area: 'jingtian', scores: { 2023: 74.3, 2024: 72.1, 2025: 70.6 } },
    { name: '天健小学', address: '福田区天健花园', area: 'jingtian', scores: { 2023: 78.5, 2024: 76.2, 2025: 74.8 } },
    { name: '荔园小学（南校区）', address: '福田区红荔西路', area: 'baihua', scores: { 2023: 88.2, 2024: 84.7, 2025: 75.6 } },
    { name: '福南小学', address: '福田区福强路', area: 'fumin', scores: { 2023: 71.3, 2024: 69.8, 2025: 68.2 } },
    { name: '梅林小学', address: '福田区梅林一村', area: 'meilin', scores: { 2023: 77.6, 2024: 75.3, 2025: 73.5 } },
    { name: '景鹏小学', address: '福田区景田东路', area: 'jingtian', scores: { 2023: 68.5, 2024: 67.2, 2025: 65.8 } },
    { name: '上步小学', address: '福田区上步中路', area: 'shangbu', scores: { 2023: 69.8, 2024: 68.1, 2025: 66.9 } },
    { name: '莲花小学', address: '福田区莲花北村', area: 'lianhua', scores: { 2023: 80.2, 2024: 78.5, 2025: 76.8 } }
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
    { name: '深圳中学梅香学校（初中部）', address: '福田区梅亭路', area: 'meilin', scores: { 2023: 99.5, 2024: 97.2, 2025: 95.8 } },
    { name: '红岭中学（园岭初中部）', address: '福田区园岭九街', area: 'yuanling', scores: { 2023: 92.3, 2024: 90.5, 2025: 88.6 } },
    { name: '福田区外国语学校（初中部）', address: '福田区景田北路', area: 'jingtian', scores: { 2023: 88.5, 2024: 86.8, 2025: 85.2 } },
    { name: '侨香外国语学校（初中部）', address: '福田区安托山路', area: 'jingtian', scores: { 2023: 85.6, 2024: 83.8, 2025: 82.1 } },
    { name: '明德实验学校（初中部）', address: '福田区香蜜湖路', area: 'lianhua', scores: { 2023: 90.2, 2024: 88.5, 2025: 86.3 } },
    { name: '石厦学校（初中部）', address: '福田区石厦北二街', area: 'fumin', scores: { 2023: 78.5, 2024: 76.8, 2025: 75.2 } },
    { name: '北环中学', address: '福田区北环路', area: 'huafu', scores: { 2023: 80.2, 2024: 78.5, 2025: 76.8 } },
    { name: '莲花中学', address: '福田区莲花路', area: 'lianhua', scores: { 2023: 82.6, 2024: 80.3, 2025: 78.5 } },
    { name: '景秀中学', address: '福田区景田北路', area: 'jingtian', scores: { 2023: 76.3, 2024: 74.5, 2025: 73.2 } },
    { name: '上步中学', address: '福田区上步南路', area: 'shangbu', scores: { 2023: 72.5, 2024: 71.2, 2025: 70.1 } },
    { name: '华富中学', address: '福田区华富路', area: 'huafu', scores: { 2023: 74.8, 2024: 73.2, 2025: 71.6 } },
    { name: '梅山中学', address: '福田区梅林路', area: 'meilin', scores: { 2023: 76.5, 2024: 74.8, 2025: 73.5 } },
    { name: '福田中学', address: '福田区福民路', area: 'fumin', scores: { 2023: 70.8, 2024: 69.5, 2025: 68.3 } }
  ]
};
