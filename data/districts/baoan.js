module.exports = {
  name: '宝安区',
  key: 'baoan',
  description: '8类基础分60~105分，加分不封顶',
  color: '#f9ab00',
  icon: 'baoan',

  areas: [
    { value: 'xinan', label: '新安街道' },
    { value: 'xixiang', label: '西乡街道' },
    { value: 'songgang', label: '松岗街道' },
    { value: 'shajing', label: '沙井街道' },
    { value: 'shiyan', label: '石岩街道' },
    { value: 'hangcheng', label: '航城街道' },
    { value: 'fucheng', label: '福城/福海街道' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的街道',
    subtitle: '选择住所所在街道，帮你筛选对应学校',
    type: 'single',
    options: [
      { label: '新安街道', value: 'xinan' },
      { label: '西乡街道', value: 'xixiang' },
      { label: '松岗街道', value: 'songgang' },
      { label: '沙井街道', value: 'shajing' },
      { label: '石岩街道', value: 'shiyan' },
      { label: '航城街道', value: 'hangcheng' },
      { label: '福城/福海街道', value: 'fucheng' },
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
        { label: '宝安区户籍', value: 'baoan' },
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
        { label: '学区内购商品房', value: 'purchase' },
        { label: '租房或特殊住房', value: 'rent_special' }
      ]
    },
    {
      id: 'has_other_property',
      title: '学区外是否有其他房产',
      subtitle: '深户租房家庭在深圳其他地方是否有房产（影响分类）',
      type: 'single',
      showWhen: { housing: ['rent_special'] },
      options: [
        { label: '深圳无其他房产', value: 'no' },
        { label: '深圳有其他房产', value: 'yes' }
      ]
    },
    {
      id: 'residence_months',
      title: '居住时长（月）',
      subtitle: '深户按居住登记或房产证时间计算',
      type: 'number',
      showWhen: { hukou: ['baoan', 'shenzhen_other'] },
      placeholder: '请输入居住月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'social_insurance_months',
      title: '社保缴纳时长（月）',
      subtitle: '在深累计缴纳社保（养老+医疗）的总月数',
      type: 'number',
      showWhen: { hukou: ['non_shenzhen'] },
      placeholder: '请输入社保月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'social_5years',
      title: '社保是否已满5年（60个月）',
      subtitle: '非深户小一申请社保满5年可额外加1分',
      type: 'single',
      showWhen: { hukou: ['non_shenzhen'] },
      options: [
        { label: '是', value: 'yes' },
        { label: '否', value: 'no' }
      ]
    },
    {
      id: 'huzheng_bonus',
      title: '户证情况加分',
      subtitle: '符合以下条件之一可加0.5分',
      type: 'single',
      options: [
        { label: '适龄儿童为宝安户籍', value: 'yes' },
        { label: '非深户但父母双方均有居住证', value: 'yes' },
        { label: '不符合以上条件', value: 'no' }
      ]
    }
  ],

  calcScore: function (answers) {
    var hukou = answers.hukou;
    var housing = answers.housing;
    var hasOther = answers.has_other_property || 'no';
    var residenceMonths = parseInt(answers.residence_months) || 0;
    var socialMonths = parseInt(answers.social_insurance_months) || 0;
    var social5Years = answers.social_5years === 'yes';
    var huzhengBonus = answers.huzheng_bonus === 'yes';

    var baseScore = 0;
    var category = '';

    if (hukou === 'baoan' && housing === 'purchase') {
      baseScore = 105; category = '第一类';
    } else if (hukou === 'baoan' && housing === 'rent_special' && hasOther === 'no') {
      baseScore = 95; category = '第二类';
    } else if (hukou === 'shenzhen_other' && housing === 'purchase') {
      baseScore = 100; category = '第三类';
    } else if (hukou === 'shenzhen_other' && housing === 'rent_special' && hasOther === 'no') {
      baseScore = 85; category = '第四类';
    } else if (hukou === 'non_shenzhen' && housing === 'purchase') {
      baseScore = 75; category = '第五类';
    } else if (hukou === 'baoan' && housing === 'rent_special' && hasOther === 'yes') {
      baseScore = 70; category = '第六类';
    } else if (hukou === 'shenzhen_other' && housing === 'rent_special' && hasOther === 'yes') {
      baseScore = 65; category = '第七类';
    } else if (hukou === 'non_shenzhen' && housing === 'rent_special') {
      baseScore = 60; category = '第八类';
    } else {
      baseScore = 60; category = '第八类';
    }

    var timeBonus = 0;
    var bonusDetails = [];

    if (hukou !== 'non_shenzhen') {
      timeBonus = residenceMonths * 0.1;
      bonusDetails.push({ label: '居住时长加分（' + residenceMonths + '月 x 0.1）', value: Math.round(timeBonus * 10) / 10 });
    } else {
      timeBonus = socialMonths * 0.1;
      bonusDetails.push({ label: '社保时长加分（' + socialMonths + '月 x 0.1）', value: Math.round(timeBonus * 10) / 10 });
      if (social5Years) {
        timeBonus += 1;
        bonusDetails.push({ label: '社保满5年额外加分', value: 1 });
      }
    }

    if (huzhengBonus) {
      timeBonus += 0.5;
      bonusDetails.push({ label: '户证情况加分', value: 0.5 });
    }

    var bonusScore = Math.round(timeBonus * 10) / 10;
    var totalScore = Math.round((baseScore + bonusScore) * 10) / 10;

    var details = [{ label: '基础分（' + category + '）', value: baseScore }].concat(bonusDetails);

    return {
      baseScore: baseScore,
      bonusScore: bonusScore,
      totalScore: totalScore,
      category: category,
      details: details
    };
  },

  schools: [
    { name: '宝安中学（集团）实验学校', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 102.5, 2024: 100.8, 2025: 99.2 } },
    { name: '宝安小学', address: '宝安区宝城路', area: 'xinan', scores: { 2023: 88.5, 2024: 86.3, 2025: 84.8 } },
    { name: '弘雅小学', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 85.3, 2024: 83.6, 2025: 82.1 } },
    { name: '滨海小学', address: '宝安区西乡街道', area: 'xixiang', scores: { 2023: 82.6, 2024: 80.8, 2025: 79.5 } },
    { name: '海城小学', address: '宝安区西乡街道', area: 'xixiang', scores: { 2023: 78.5, 2024: 76.8, 2025: 75.3 } },
    { name: '宝民小学', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 80.3, 2024: 78.5, 2025: 77.1 } },
    { name: '新安中学（集团）第一实验学校', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 90.2, 2024: 88.6, 2025: 87.1 } },
    { name: '天骄小学', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 76.8, 2024: 75.2, 2025: 73.8 } },
    { name: '西湾小学', address: '宝安区西乡街道', area: 'xixiang', scores: { 2023: 72.5, 2024: 71.2, 2025: 70.1 } },
    { name: '固戍小学', address: '宝安区固戍社区', area: 'xixiang', scores: { 2023: 68.3, 2024: 67.5, 2025: 66.8 } },
    { name: '黄田小学', address: '宝安区航城街道', area: 'hangcheng', scores: { 2023: 65.2, 2024: 64.5, 2025: 63.8 } },
    { name: '航城学校（小学部）', address: '宝安区航城街道', area: 'hangcheng', scores: { 2023: 70.8, 2024: 69.5, 2025: 68.3 } },
    { name: '松岗第二小学', address: '宝安区松岗街道', area: 'songgang', scores: { 2023: 66.5, 2024: 65.8, 2025: 65.2 } },
    { name: '沙井上寮学校', address: '宝安区沙井街道', area: 'shajing', scores: { 2023: 64.3, 2024: 63.8, 2025: 63.2 } },
    { name: '石岩小学', address: '宝安区石岩街道', area: 'shiyan', scores: { 2023: 67.8, 2024: 66.5, 2025: 65.8 } }
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
    { name: '宝安中学（集团）初中部', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 112.5, 2024: 111.9, 2025: 111.6 } },
    { name: '宝安中学（集团）外国语学校', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 95.8, 2024: 97.8, 2025: 68.3 } },
    { name: '海韵学校（初中部）', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 115.2, 2024: 116.2, 2025: 117.5 } },
    { name: '宝中海天初中', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 110.5, 2024: 111.8, 2025: 113.1 } },
    { name: '新安中学（集团）初中部', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 95.2, 2024: 93.5, 2025: 92.1 } },
    { name: '海湾中学', address: '宝安区西乡街道', area: 'xixiang', scores: { 2023: 82.6, 2024: 80.8, 2025: 79.5 } },
    { name: '宝安实验学校（初中部）', address: '宝安区新安街道', area: 'xinan', scores: { 2023: 88.5, 2024: 86.3, 2025: 85.1 } },
    { name: '西乡中学初中部', address: '宝安区西乡街道', area: 'xixiang', scores: { 2023: 78.5, 2024: 76.8, 2025: 75.5 } },
    { name: '松岗中学', address: '宝安区松岗街道', area: 'songgang', scores: { 2023: 70.8, 2024: 69.5, 2025: 68.6 } },
    { name: '沙井中学', address: '宝安区沙井街道', area: 'shajing', scores: { 2023: 68.5, 2024: 67.2, 2025: 66.5 } },
    { name: '石岩公学（初中部）', address: '宝安区石岩街道', area: 'shiyan', scores: { 2023: 72.3, 2024: 71.5, 2025: 70.2 } }
  ]
};
