module.exports = {
  name: '罗湖区',
  key: 'luohu',
  description: 'ABCDEF六类，类别优先+积分排序',
  color: '#ea4335',
  icon: 'luohu',

  areas: [
    { value: 'cuizhu', label: '翠竹片区' },
    { value: 'luoling', label: '螺岭/东门片区' },
    { value: 'liannan', label: '莲塘/莲南片区' },
    { value: 'suntou', label: '笋岗/桂园片区' },
    { value: 'dongxiao', label: '东晓/布心片区' },
    { value: 'qingshuihe', label: '清水河/银湖片区' },
    { value: 'nanhu', label: '南湖/滨河片区' },
    { value: 'caopu', label: '草埔/罗芳片区' }
  ],

  areaQuestion: {
    id: 'user_area',
    title: '你所在的片区/街道',
    subtitle: '选择住所所在片区，帮你筛选学区对应学校',
    type: 'single',
    options: [
      { label: '翠竹片区', value: 'cuizhu' },
      { label: '螺岭/东门片区', value: 'luoling' },
      { label: '莲塘/莲南片区', value: 'liannan' },
      { label: '笋岗/桂园片区', value: 'suntou' },
      { label: '东晓/布心片区', value: 'dongxiao' },
      { label: '清水河/银湖片区', value: 'qingshuihe' },
      { label: '南湖/滨河片区', value: 'nanhu' },
      { label: '草埔/罗芳片区', value: 'caopu' },
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
        { label: '罗湖区户籍', value: 'luohu' },
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
        { label: '自购住宅类商品房', value: 'commercial' },
        { label: '原居民祖屋', value: 'ancestral' },
        { label: '特殊房产（自建房/集资房/军产房/商务公寓）', value: 'special' },
        { label: '祖辈房（祖父母/外祖父母的房产）', value: 'grandparent' },
        { label: '政府人才住房/公租房/安居房（租赁）', value: 'gov_rent' },
        { label: '租房（有房屋租赁凭证-红本）', value: 'rent_cert' },
        { label: '租房（仅居住信息登记）', value: 'rent_register' }
      ]
    },
    {
      id: 'property_months',
      title: '购房/居住时长（月）',
      subtitle: '购房按房产证发证日期计算，租房按租赁凭证签发日期计算',
      type: 'number',
      placeholder: '请输入月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'social_insurance_months',
      title: '社保缴纳时长（月）',
      subtitle: '父母一方在深圳连续缴纳社保（养老+医疗）的总月数',
      type: 'number',
      showWhen: { hukou: ['non_shenzhen'] },
      placeholder: '请输入社保月数',
      unit: '个月',
      min: 0,
      max: 360
    },
    {
      id: 'is_daxuequ',
      title: '是否申请大学区学校',
      subtitle: '大学区内申请原地段学校可获得额外加分',
      type: 'single',
      options: [
        { label: '是，且选择原地段学校', value: 'yes' },
        { label: '否', value: 'no' }
      ]
    },
    {
      id: 'parent_hukou',
      title: '父母户籍/居住证情况',
      subtitle: '影响加分项',
      type: 'single',
      options: [
        { label: '父母双方均为深圳户籍', value: 'both_shenzhen' },
        { label: '一方深户 + 一方有居住证', value: 'one_sz_one_permit' },
        { label: '双方均有居住证（非深户）', value: 'both_permit' },
        { label: '仅一方有居住证', value: 'one_permit' },
        { label: '其他', value: 'other' }
      ]
    },
    {
      id: 'both_social_one_year',
      title: '父母双方是否均连续缴纳社保满1年',
      subtitle: '满足条件可额外加2分',
      type: 'single',
      options: [
        { label: '是', value: 'yes' },
        { label: '否', value: 'no' }
      ]
    },
    {
      id: 'social_permit_5years',
      title: '非深户父母居住证和社保是否同时满5年',
      subtitle: '满足条件可额外加1分',
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
    var propertyMonths = parseInt(answers.property_months) || 0;
    var socialMonths = parseInt(answers.social_insurance_months) || 0;
    var isDaxuequ = answers.is_daxuequ === 'yes';
    var parentHukou = answers.parent_hukou || 'other';
    var bothSocialYear = answers.both_social_one_year === 'yes';
    var socialPermit5 = answers.social_permit_5years === 'yes';

    var baseScore = 0;
    var category = '';
    var isOwner = housing === 'commercial' || housing === 'ancestral';
    var isSpecial = housing === 'special' || housing === 'grandparent';
    var isGovRent = housing === 'gov_rent';
    var isRent = housing === 'rent_cert' || housing === 'rent_register' || isGovRent;

    // 政府人才房/公租房本质上按"租房"类别处理
    if (hukou === 'luohu' && isOwner) {
      baseScore = 100; category = 'A类';
    } else if (hukou === 'shenzhen_other' && isOwner) {
      baseScore = 90; category = 'B类';
    } else if (hukou === 'luohu' && isSpecial) {
      baseScore = 80; category = 'C类';
    } else if ((hukou === 'luohu' && isRent) || (hukou === 'shenzhen_other' && isSpecial) || (hukou === 'non_shenzhen' && isOwner)) {
      baseScore = 70; category = 'D类';
    } else if ((hukou === 'shenzhen_other' && isRent) || (hukou === 'non_shenzhen' && isSpecial)) {
      baseScore = 65; category = 'E类';
    } else {
      baseScore = 60; category = 'F类';
    }

    var monthlyScore = 0;
    if (hukou !== 'non_shenzhen') {
      if (isOwner) {
        monthlyScore = propertyMonths * 0.3;
      } else if (isGovRent) {
        // 政府人才房/公租房一般只有居住登记，不积月分
        monthlyScore = 0;
      } else if (housing === 'rent_cert') {
        monthlyScore = propertyMonths * 0.2;
      } else {
        // 特殊房产、居住登记：不积分
        monthlyScore = 0;
      }
    } else {
      monthlyScore = Math.max(socialMonths - 12, 0) * 0.1;
    }

    var bonus = 0;
    var bonusDetails = [];

    if (isDaxuequ) {
      var daxuequBonus = (category === 'A类' || category === 'B类') ? 3 : (category === 'C类' || category === 'D类') ? 1 : 0;
      if (daxuequBonus > 0) {
        bonus += daxuequBonus;
        bonusDetails.push({ label: '大学区原地段加分', value: daxuequBonus });
      }
    }

    if (isOwner || housing === 'rent_cert') {
      bonus += 1;
      bonusDetails.push({ label: '住房证明加分', value: 1 });
    }

    if (parentHukou === 'both_shenzhen' || parentHukou === 'one_sz_one_permit' || parentHukou === 'both_permit') {
      bonus += 2;
      bonusDetails.push({ label: '父母户籍/居住证加分', value: 2 });
    }

    if (bothSocialYear) {
      bonus += 2;
      bonusDetails.push({ label: '双方社保满1年加分', value: 2 });
    }

    if (socialPermit5 && hukou === 'non_shenzhen') {
      bonus += 1;
      bonusDetails.push({ label: '居住证社保满5年加分', value: 1 });
    }

    monthlyScore = Math.round(monthlyScore * 10) / 10;
    var bonusScore = Math.round((monthlyScore + bonus) * 10) / 10;
    var totalScore = Math.round((baseScore + bonusScore) * 10) / 10;

    var details = [
      { label: '基础分（' + category + '）', value: baseScore },
      { label: '月积分', value: monthlyScore }
    ].concat(bonusDetails);

    return {
      baseScore: baseScore,
      bonusScore: bonusScore,
      totalScore: totalScore,
      category: category,
      details: details
    };
  },

  // categoryPriority 标记此区使用"类别优先，后取积分"录取模式
  categoryPriority: true,

  schools: [
    // 01学区大学区（罗湖未来学校+凤光小学+银湖实验小学）
    { name: '罗湖未来学校（小学部）', address: '罗湖区清水河街道银湖三九片区', area: 'qingshuihe', tag: '01大学区',
      scores: { 2023: { cat: 'F', score: 72.5 }, 2024: { cat: 'F', score: 70.8 }, 2025: { cat: 'F', score: 73.2 } } },
    { name: '凤光小学', address: '罗湖区泥岗西路69号', area: 'qingshuihe', tag: '01大学区',
      scores: { 2023: { cat: 'F', score: 75.8 }, 2024: { cat: 'F', score: 72.6 }, 2025: { cat: 'F', score: 74.5 } } },
    { name: '银湖实验小学', address: '罗湖区银湖路16号', area: 'qingshuihe', tag: '01大学区',
      scores: { 2023: { cat: 'F', score: 70.2 }, 2024: { cat: 'F', score: 68.5 }, 2025: { cat: 'F', score: 71.3 } } },
    // 热门学校
    { name: '翠竹外国语实验学校', address: '罗湖区翠竹路', area: 'cuizhu',
      scores: { 2023: { cat: 'B', score: 82 }, 2024: { cat: 'B', score: 82 }, 2025: { cat: 'C', score: 103.5 } } },
    { name: '螺岭外国语实验学校', address: '罗湖区文锦南路', area: 'luoling',
      scores: { 2023: { cat: 'A', score: 125.2 }, 2024: { cat: 'A', score: 122.8 }, 2025: { cat: 'A', score: 121.5 } } },
    { name: '百雅实验小学（原百仕达小学）', address: '罗湖区太安路', area: 'dongxiao',
      scores: { 2024: { cat: 'A', score: 130 }, 2025: { cat: 'A', score: 150 } } },
    { name: '深圳小学', address: '罗湖区人民北路', area: 'luoling',
      scores: { 2023: { cat: 'A', score: 118.5 }, 2024: { cat: 'A', score: 116.3 }, 2025: { cat: 'A', score: 115.1 } } },
    { name: '莲南小学', address: '罗湖区畔山路', area: 'liannan',
      scores: { 2023: { cat: 'A', score: 133 }, 2024: { cat: 'A', score: 125.6 }, 2025: { cat: 'A', score: 128.3 } } },
    { name: '翠北实验小学', address: '罗湖区翠竹路', area: 'cuizhu',
      scores: { 2023: { cat: 'C', score: 98.6 }, 2024: { cat: 'C', score: 96.2 }, 2025: { cat: 'C', score: 94.8 } } },
    { name: '红岭小学', address: '罗湖区松园路', area: 'cuizhu',
      scores: { 2023: { cat: 'B', score: 100.1 }, 2024: { cat: 'B', score: 98.6 }, 2025: { cat: 'B', score: 97.2 } } },
    { name: '人民小学', address: '罗湖区东门北路', area: 'luoling',
      scores: { 2023: { cat: 'C', score: 96.3 }, 2024: { cat: 'C', score: 94.8 }, 2025: { cat: 'C', score: 93.5 } } },
    { name: '桂园小学', address: '罗湖区红围街', area: 'suntou',
      scores: { 2023: { cat: 'A', score: 120.9 }, 2024: { cat: 'B', score: 105.2 }, 2025: { cat: 'B', score: 108.6 } } },
    { name: '东晓小学', address: '罗湖区东晓路', area: 'dongxiao',
      scores: { 2023: { cat: 'C', score: 152.4 }, 2024: { cat: 'D', score: 95.6 }, 2025: { cat: 'D', score: 88.3 } } },
    { name: '锦田小学', address: '罗湖区贝丽南路', area: 'nanhu',
      scores: { 2023: { cat: 'D', score: 82.3 }, 2024: { cat: 'D', score: 80.5 }, 2025: { cat: 'D', score: 79.2 } } },
    { name: '水库小学', address: '罗湖区太安路', area: 'dongxiao',
      scores: { 2023: { cat: 'D', score: 85.8 }, 2024: { cat: 'D', score: 83.6 }, 2025: { cat: 'D', score: 82.1 } } },
    { name: '滨河小学', address: '罗湖区金塘街', area: 'nanhu',
      scores: { 2023: { cat: 'D', score: 83.1 }, 2024: { cat: 'D', score: 81.5 }, 2025: { cat: 'D', score: 80.2 } } },
    { name: '洪湖小学', address: '罗湖区洪湖路', area: 'suntou',
      scores: { 2023: { cat: 'E', score: 80.5 }, 2024: { cat: 'E', score: 78.8 }, 2025: { cat: 'E', score: 77.6 } } },
    { name: '笋岗小学', address: '罗湖区笋岗路', area: 'suntou',
      scores: { 2023: { cat: 'D', score: 81.8 }, 2024: { cat: 'E', score: 80.2 }, 2025: { cat: 'E', score: 78.9 } } },
    { name: '布心小学', address: '罗湖区布心路', area: 'dongxiao',
      scores: { 2023: { cat: 'F', score: 76.2 }, 2024: { cat: 'F', score: 75.1 }, 2025: { cat: 'F', score: 74.5 } } },
    { name: '草埔小学', address: '罗湖区草埔西路', area: 'caopu',
      scores: { 2023: { cat: 'F', score: 74.5 }, 2024: { cat: 'F', score: 73.8 }, 2025: { cat: 'F', score: 73.2 } } },
    { name: '罗芳小学', address: '罗湖区罗芳路', area: 'caopu',
      scores: { 2023: { cat: 'F', score: 73.2 }, 2024: { cat: 'F', score: 72.5 }, 2025: { cat: 'F', score: 72.1 } } },
    { name: '香港中文大学（深圳）附属礼文学校', address: '罗湖区延芳路', area: 'dongxiao',
      scores: { 2023: { cat: 'A', score: 111.3 }, 2024: { cat: 'B', score: 98.5 }, 2025: { cat: 'B', score: 95.2 } } }
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
    { name: '翠园中学（初中部）', address: '罗湖区东门北路', area: 'luoling', scores: { 2023: { cat: 'A', score: 125.3 }, 2024: { cat: 'A', score: 122.8 }, 2025: { cat: 'A', score: 120.5 } } },
    { name: '罗湖外语学校（初中部）', address: '罗湖区莲塘路', area: 'liannan', scores: { 2023: { cat: 'A', score: 118.5 }, 2024: { cat: 'A', score: 115.2 }, 2025: { cat: 'A', score: 112.8 } } },
    { name: '翠园东晓创新学校（初中部）', address: '罗湖区东晓路', area: 'dongxiao', scores: { 2023: { cat: 'B', score: 98.6 }, 2024: { cat: 'B', score: 96.5 }, 2025: { cat: 'B', score: 95.2 } } },
    { name: '桂园中学', address: '罗湖区桂园路', area: 'suntou', scores: { 2023: { cat: 'C', score: 92.3 }, 2024: { cat: 'C', score: 90.5 }, 2025: { cat: 'C', score: 88.6 } } },
    { name: '罗湖中学', address: '罗湖区南湖路', area: 'nanhu', scores: { 2023: { cat: 'D', score: 85.6 }, 2024: { cat: 'D', score: 83.8 }, 2025: { cat: 'D', score: 82.5 } } },
    { name: '松泉中学', address: '罗湖区太白路', area: 'dongxiao', scores: { 2023: { cat: 'C', score: 95.2 }, 2024: { cat: 'C', score: 93.5 }, 2025: { cat: 'C', score: 91.8 } } },
    { name: '布心中学', address: '罗湖区布心路', area: 'dongxiao', scores: { 2023: { cat: 'E', score: 78.5 }, 2024: { cat: 'E', score: 76.8 }, 2025: { cat: 'E', score: 75.6 } } },
    { name: '笋岗中学', address: '罗湖区笋岗路', area: 'suntou', scores: { 2023: { cat: 'D', score: 82.3 }, 2024: { cat: 'D', score: 80.5 }, 2025: { cat: 'D', score: 79.2 } } },
    { name: '东湖中学', address: '罗湖区太安路', area: 'dongxiao', scores: { 2023: { cat: 'E', score: 76.2 }, 2024: { cat: 'E', score: 74.5 }, 2025: { cat: 'E', score: 73.8 } } },
    { name: '文锦中学', address: '罗湖区文锦南路', area: 'luoling', scores: { 2023: { cat: 'D', score: 80.5 }, 2024: { cat: 'D', score: 78.8 }, 2025: { cat: 'D', score: 77.5 } } },
    { name: '罗湖未来学校（初中部）', address: '罗湖区清水河街道银湖三九片区', area: 'qingshuihe', tag: '01大学区', scores: { 2023: { cat: 'F', score: 72.5 }, 2024: { cat: 'F', score: 70.8 }, 2025: { cat: 'F', score: 73.2 } } }
  ]
};
