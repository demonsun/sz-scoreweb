module.exports = {
  name: '南山区',
  key: 'nanshan',
  description: '三项基础分+加分项，满分约99分',
  color: '#34a853',
  icon: 'nanshan',

  areas: [
    { value: 'shekou', label: '蛇口片区' },
    { value: 'nantou', label: '南头片区' },
    { value: 'houhai', label: '后海/科技园片区' },
    { value: 'qianhai', label: '前海片区' },
    { value: 'xuefu', label: '学府/桃源片区' },
    { value: 'nanyou', label: '南油/粤海片区' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的片区/街道',
    subtitle: '选择住所所在片区，帮你筛选学区对应学校',
    type: 'single',
    options: [
      { label: '蛇口片区', value: 'shekou' },
      { label: '南头片区', value: 'nantou' },
      { label: '后海/科技园片区', value: 'houhai' },
      { label: '前海片区', value: 'qianhai' },
      { label: '学府/桃源片区', value: 'xuefu' },
      { label: '南油/粤海片区', value: 'nanyou' },
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
        { label: '南山区学区内户籍（户主为父母）', value: 'nanshan_owner' },
        { label: '南山区户籍', value: 'nanshan' },
        { label: '深圳其他区户籍', value: 'shenzhen_other' },
        { label: '非深户（父母一方深户）', value: 'non_sz_one_parent' },
        { label: '非深户（父母均持居住证）', value: 'non_sz_both_permit' },
        { label: '非深户（仅一方有居住证）', value: 'non_sz_one_permit' }
      ]
    },
    {
      id: 'housing',
      title: '住房情况',
      subtitle: '请选择在学区内的住房类型',
      type: 'single',
      options: [
        { label: '自购商品房（产权≥51%，满3年以上）', value: 'own_3y_plus' },
        { label: '自购商品房（产权≥51%，2-3年）', value: 'own_2_3y' },
        { label: '自购商品房（产权≥51%，1-2年）', value: 'own_1_2y' },
        { label: '自购商品房（产权≥51%，不满1年）', value: 'own_under_1y' },
        { label: '自购商品房（产权<51%）', value: 'own_partial' },
        { label: '政府廉租房/公租房', value: 'gov_rent' },
        { label: '租住住宅（满5年以上）', value: 'rent_5y_plus' },
        { label: '租住住宅（3-5年）', value: 'rent_3_5y' },
        { label: '租住住宅（2-3年）', value: 'rent_2_3y' },
        { label: '租住住宅（1-2年）', value: 'rent_1_2y' },
        { label: '租住住宅（不满1年）', value: 'rent_under_1y' },
        { label: '单位自建房/集资房', value: 'unit_house' }
      ]
    },
    {
      id: 'social_insurance',
      title: '社保缴纳情况',
      subtitle: '非深户籍家庭的社保缴纳情况',
      type: 'single',
      showWhen: { hukou: ['non_sz_one_parent', 'non_sz_both_permit', 'non_sz_one_permit'] },
      options: [
        { label: '父母均在深缴满1年社保', value: 'both_1y' },
        { label: '父母一方在深缴满1年社保', value: 'one_1y' },
        { label: '未满1年', value: 'less_1y' }
      ]
    },
    {
      id: 'social_total_months',
      title: '社保连续缴纳总月数',
      subtitle: '父母在深缴纳社保（养老+医疗）时间最长一方的总月数',
      type: 'number',
      placeholder: '请输入社保月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'hukou_years',
      title: '户籍迁入年限',
      subtitle: '深圳户籍迁入到当前所在区的年数（非深户填0）',
      type: 'number',
      showWhen: { hukou: ['nanshan_owner', 'nanshan', 'shenzhen_other'] },
      placeholder: '请输入年数',
      unit: '年',
      min: 0,
      max: 30
    },
    {
      id: 'both_social_72months',
      title: '父母双方社保是否均超过72个月',
      subtitle: '满足条件可额外加1.5分',
      type: 'single',
      options: [
        { label: '是', value: 'yes' },
        { label: '否', value: 'no' }
      ]
    }
  ],

  calcScore: function (answers) {
    var hukou = answers.hukou;
    var housing = answers.housing;
    var socialIns = answers.social_insurance || '';
    var socialMonths = parseInt(answers.social_total_months) || 0;
    var hukouYears = parseInt(answers.hukou_years) || 0;
    var bothSocial72 = answers.both_social_72months === 'yes';

    var hukouScore = 0;
    switch (hukou) {
      case 'nanshan_owner': hukouScore = 30; break;
      case 'nanshan': hukouScore = 26; break;
      case 'shenzhen_other': hukouScore = 20; break;
      case 'non_sz_one_parent': hukouScore = 20; break;
      case 'non_sz_both_permit': hukouScore = 18; break;
      case 'non_sz_one_permit': hukouScore = 0; break;
      default: hukouScore = 0;
    }

    var housingScore = 0;
    switch (housing) {
      case 'own_3y_plus': housingScore = 40; break;
      case 'own_2_3y': housingScore = 35; break;
      case 'own_1_2y': housingScore = 30; break;
      case 'own_under_1y': housingScore = 25; break;
      case 'own_partial': housingScore = 20; break;
      case 'gov_rent': housingScore = 20; break;
      case 'rent_5y_plus': housingScore = 15; break;
      case 'rent_3_5y': housingScore = 12; break;
      case 'rent_2_3y': housingScore = 10; break;
      case 'rent_1_2y': housingScore = 8; break;
      case 'rent_under_1y': housingScore = 7; break;
      case 'unit_house': housingScore = 15; break;
      default: housingScore = 0;
    }

    var socialBaseScore = 0;
    var isDeepHukou = hukou === 'nanshan_owner' || hukou === 'nanshan' || hukou === 'shenzhen_other';
    if (isDeepHukou) {
      socialBaseScore = 10;
    } else {
      if (socialIns === 'both_1y') socialBaseScore = 10;
      else if (socialIns === 'one_1y') socialBaseScore = 5;
      else socialBaseScore = 0;
    }

    var baseScore = hukouScore + housingScore + socialBaseScore;

    var hukouBonus = 0;
    if (hukou === 'nanshan_owner' || hukou === 'nanshan') {
      hukouBonus = Math.min(hukouYears * 1.5, 7.5);
    } else if (hukou === 'shenzhen_other') {
      hukouBonus = Math.min(hukouYears * 1, 5);
    }

    var socialBonus = 0;
    if (isDeepHukou) {
      socialBonus = 11.5;
    } else {
      var extraMonths = Math.max(socialMonths - 12, 0);
      socialBonus = Math.min(extraMonths * 0.1, 10);
      if (bothSocial72) socialBonus += 1.5;
    }

    hukouBonus = Math.round(hukouBonus * 10) / 10;
    socialBonus = Math.round(socialBonus * 10) / 10;
    var bonusScore = Math.round((hukouBonus + socialBonus) * 10) / 10;
    var totalScore = Math.round((baseScore + bonusScore) * 10) / 10;

    var category = '';
    if (totalScore >= 85) category = '第一梯队';
    else if (totalScore >= 70) category = '第二梯队';
    else if (totalScore >= 55) category = '第三梯队';
    else category = '第四梯队';

    return {
      baseScore: baseScore,
      bonusScore: bonusScore,
      totalScore: totalScore,
      category: category,
      details: [
        { label: '户籍积分', value: hukouScore },
        { label: '住房积分', value: housingScore },
        { label: '社保基础分', value: socialBaseScore },
        { label: '户籍时长加分', value: hukouBonus },
        { label: '社保时长加分', value: socialBonus }
      ]
    };
  },

  schools: [
    { name: '南山实验学校（南头小学部）', address: '南山区南头街', area: 'nantou', scores: { 2023: 82.5, 2024: 80.1, 2025: 78.3 } },
    { name: '南二外海德小学', address: '南山区后海大道', area: 'houhai', scores: { 2023: 72.5, 2024: 68.2, 2025: 64 } },
    { name: '育才二小', address: '南山区蛇口工业区', area: 'shekou', scores: { 2023: 78.3, 2024: 76.5, 2025: 74.8 } },
    { name: '南山外国语学校（文华部）', address: '南山区科技南路', area: 'houhai', scores: { 2023: 85.6, 2024: 83.2, 2025: 81.5 } },
    { name: '深圳湾学校（小学部）', address: '南山区望海路', area: 'houhai', scores: { 2023: 80.2, 2024: 78.5, 2025: 76.3 } },
    { name: '前海小学', address: '南山区前海路', area: 'qianhai', scores: { 2023: 70.5, 2024: 68.8, 2025: 67.2 } },
    { name: '南油小学', address: '南山区南油大道', area: 'nanyou', scores: { 2023: 68.3, 2024: 66.5, 2025: 65.1 } },
    { name: '海滨实验小学', address: '南山区后海滨路', area: 'houhai', scores: { 2023: 76.8, 2024: 74.6, 2025: 73.2 } },
    { name: '蛇口学校（小学部）', address: '南山区蛇口街道', area: 'shekou', scores: { 2023: 72.1, 2024: 70.3, 2025: 68.8 } },
    { name: '学府小学', address: '南山区学府路', area: 'xuefu', scores: { 2023: 74.5, 2024: 72.8, 2025: 71.2 } },
    { name: '太子湾学校（小学部）', address: '南山区太子湾片区', area: 'shekou', scores: { 2023: 66.2, 2024: 65.1, 2025: 64.3 } },
    { name: '大冲学校（小学部）', address: '南山区高新南路', area: 'nanyou', scores: { 2023: 71.3, 2024: 69.5, 2025: 68.1 } },
    { name: '珠光小学', address: '南山区北环大道', area: 'nanyou', scores: { 2023: 69.8, 2024: 68.2, 2025: 66.9 } },
    { name: '南山第二实验学校（小学部）', address: '南山区前海路', area: 'qianhai', scores: { 2023: 77.2, 2024: 75.5, 2025: 73.8 } }
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
    { name: '南山外国语学校（高新初中部）', address: '南山区科技南路', area: 'houhai', scores: { 2023: 88.5, 2024: 86.2, 2025: 84.8 } },
    { name: '育才二中', address: '南山区蛇口工业区', area: 'shekou', scores: { 2023: 82.3, 2024: 80.5, 2025: 78.8 } },
    { name: '育才三中', address: '南山区蛇口街道', area: 'shekou', scores: { 2023: 80.5, 2024: 78.6, 2025: 76.8 } },
    { name: '南山实验教育集团麒麟中学', address: '南山区南头街道', area: 'nantou', scores: { 2023: 78.6, 2024: 76.8, 2025: 75.2 } },
    { name: '深圳湾学校（初中部）', address: '南山区望海路', area: 'houhai', scores: { 2023: 82.5, 2024: 80.2, 2025: 78.6 } },
    { name: '前海学校（初中部）', address: '南山区前海路', area: 'qianhai', scores: { 2023: 72.3, 2024: 70.5, 2025: 69.2 } },
    { name: '南山第二实验学校（初中部）', address: '南山区前海路', area: 'qianhai', scores: { 2023: 76.8, 2024: 75.2, 2025: 73.5 } },
    { name: '蛇口学校（初中部）', address: '南山区蛇口街道', area: 'shekou', scores: { 2023: 73.5, 2024: 72.1, 2025: 70.8 } },
    { name: '学府中学', address: '南山区学府路', area: 'xuefu', scores: { 2023: 75.2, 2024: 73.6, 2025: 72.1 } },
    { name: '南海中学', address: '南山区南海大道', area: 'nanyou', scores: { 2023: 68.5, 2024: 67.2, 2025: 66.1 } },
    { name: '大冲学校（初中部）', address: '南山区高新南路', area: 'nanyou', scores: { 2023: 74.5, 2024: 72.8, 2025: 71.5 } },
    { name: '太子湾学校（初中部）', address: '南山区太子湾片区', area: 'shekou', scores: { 2023: 68.2, 2024: 66.8, 2025: 65.5 } }
  ]
};
