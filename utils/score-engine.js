var districtData = require('../data/districts/index');

function shouldShowQuestion(question, answers) {
  if (!question.showWhen) return true;
  var conditions = question.showWhen;
  for (var key in conditions) {
    if (!conditions.hasOwnProperty(key)) continue;
    var allowed = conditions[key];
    var current = answers[key];
    if (Array.isArray(allowed)) {
      if (allowed.indexOf(current) === -1) return false;
    } else {
      if (current !== allowed) return false;
    }
  }
  return true;
}

function getQuestions(district, stage) {
  var base = district.questions || [];
  var extra = [];

  if (stage === 'chuzhong' && district.chuzhongExtraQuestions) {
    extra = extra.concat(district.chuzhongExtraQuestions);
  }

  if (district.areaQuestion) {
    extra.push(district.areaQuestion);
  }

  return base.concat(extra);
}

function getVisibleQuestions(districtKey, answers, stage) {
  var district = districtData.getDistrict(districtKey);
  if (!district) return [];
  var allQ = getQuestions(district, stage);
  return allQ.filter(function (q) {
    return shouldShowQuestion(q, answers);
  });
}

function calculateScore(districtKey, answers, stage) {
  var district = districtData.getDistrict(districtKey);
  if (!district || !district.calcScore) return null;
  var result = district.calcScore(answers);

  if (stage === 'chuzhong') {
    var sixYearBonus = answers.six_year_xueji === 'yes' ? 1 : 0;
    if (sixYearBonus > 0) {
      result.bonusScore = Math.round((result.bonusScore + sixYearBonus) * 10) / 10;
      result.totalScore = Math.round((result.totalScore + sixYearBonus) * 10) / 10;
      result.details.push({ label: '6年学籍加分（初一）', value: sixYearBonus });
    }
  }

  return result;
}

function getSchools(districtKey, stage) {
  var district = districtData.getDistrict(districtKey);
  if (!district) return [];
  if (stage === 'chuzhong' && district.chuzhongSchools) {
    return district.chuzhongSchools;
  }
  return district.schools || [];
}

function getUserArea(answers) {
  return answers.user_area || 'all';
}

function isAllQuestionsAnswered(districtKey, answers, stage) {
  var questions = getVisibleQuestions(districtKey, answers, stage);
  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];
    var val = answers[q.id];
    if (val === undefined || val === null || val === '') return false;
  }
  return true;
}

module.exports = {
  shouldShowQuestion: shouldShowQuestion,
  getVisibleQuestions: getVisibleQuestions,
  calculateScore: calculateScore,
  getSchools: getSchools,
  getUserArea: getUserArea,
  isAllQuestionsAnswered: isAllQuestionsAnswered
};
