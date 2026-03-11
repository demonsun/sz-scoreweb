var CATEGORY_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'];

function catRank(cat) {
  var idx = CATEGORY_ORDER.indexOf(cat);
  return idx >= 0 ? idx : 99;
}

function isCategoryScore(val) {
  return val && typeof val === 'object' && val.cat !== undefined;
}

function getNumericScore(val) {
  if (isCategoryScore(val)) return val.score;
  return typeof val === 'number' ? val : 0;
}

function getTrend(scores) {
  var years = Object.keys(scores).sort();
  if (years.length < 2) return 0;
  var diffs = [];
  for (var i = 1; i < years.length; i++) {
    diffs.push(getNumericScore(scores[years[i]]) - getNumericScore(scores[years[i - 1]]));
  }
  return diffs.reduce(function (a, b) { return a + b; }, 0) / diffs.length;
}

function evaluateProbability(userScore, userCategory, school, categoryPriority) {
  var years = Object.keys(school.scores).sort();
  if (years.length === 0) {
    return { level: '数据不足', percent: '-', color: '#999', rank: 5 };
  }

  var latestVal = school.scores[years[years.length - 1]];

  if (categoryPriority && isCategoryScore(latestVal)) {
    return evaluateCategoryPriority(userScore, userCategory, school, years);
  }

  return evaluateScoreOnly(userScore, school, years);
}

function evaluateCategoryPriority(userScore, userCategory, school, years) {
  var userCatRank = catRank(userCategory.replace('类', ''));
  var latestVal = school.scores[years[years.length - 1]];
  var schoolCatRank = catRank(latestVal.cat);

  if (userCatRank < schoolCatRank) {
    return { level: '很大', percent: '90%+', color: '#34a853', rank: 1 };
  }

  if (userCatRank > schoolCatRank + 1) {
    return { level: '很小', percent: '<10%', color: '#999', rank: 5 };
  }

  if (userCatRank > schoolCatRank) {
    return { level: '较小', percent: '10~40%', color: '#ea4335', rank: 4 };
  }

  var scoreValues = years.map(function (y) { return getNumericScore(school.scores[y]); });
  var avgScore = scoreValues.reduce(function (a, b) { return a + b; }, 0) / scoreValues.length;
  var latestScore = getNumericScore(latestVal);
  var trend = getTrend(school.scores);
  var predictedScore = latestScore + trend * 0.5;
  var refScore = Math.max(predictedScore, avgScore);
  var diff = userScore - refScore;

  if (diff >= 8) {
    return { level: '很大', percent: '90%+', color: '#34a853', rank: 1 };
  } else if (diff >= 3) {
    return { level: '较大', percent: '70~90%', color: '#4285f4', rank: 2 };
  } else if (diff >= -3) {
    return { level: '有希望', percent: '40~70%', color: '#f9ab00', rank: 3 };
  } else if (diff >= -10) {
    return { level: '较小', percent: '10~40%', color: '#ea4335', rank: 4 };
  } else {
    return { level: '很小', percent: '<10%', color: '#999', rank: 5 };
  }
}

function evaluateScoreOnly(userScore, school, years) {
  var scoreValues = years.map(function (y) { return getNumericScore(school.scores[y]); });
  var avgScore = scoreValues.reduce(function (a, b) { return a + b; }, 0) / scoreValues.length;
  var latestScore = scoreValues[scoreValues.length - 1];
  var trend = getTrend(school.scores);
  var predictedScore = latestScore + trend * 0.5;
  var refScore = Math.max(predictedScore, avgScore);
  var diff = userScore - refScore;

  if (diff >= 8) {
    return { level: '很大', percent: '90%+', color: '#34a853', rank: 1 };
  } else if (diff >= 3) {
    return { level: '较大', percent: '70~90%', color: '#4285f4', rank: 2 };
  } else if (diff >= -3) {
    return { level: '有希望', percent: '40~70%', color: '#f9ab00', rank: 3 };
  } else if (diff >= -10) {
    return { level: '较小', percent: '10~40%', color: '#ea4335', rank: 4 };
  } else {
    return { level: '很小', percent: '<10%', color: '#999', rank: 5 };
  }
}

function evaluateSchoolList(userScore, userCategory, schools, categoryPriority) {
  return schools.map(function (school) {
    var prob = evaluateProbability(userScore, userCategory, school, categoryPriority);
    return {
      name: school.name,
      address: school.address,
      tag: school.tag || '',
      scores: school.scores,
      probability: prob,
      categoryPriority: !!categoryPriority
    };
  }).sort(function (a, b) {
    if (a.probability.rank !== b.probability.rank) {
      return a.probability.rank - b.probability.rank;
    }
    var aYears = Object.keys(a.scores).sort();
    var bYears = Object.keys(b.scores).sort();
    var aLatest = aYears.length ? getNumericScore(a.scores[aYears[aYears.length - 1]]) : 0;
    var bLatest = bYears.length ? getNumericScore(b.scores[bYears[bYears.length - 1]]) : 0;
    return aLatest - bLatest;
  });
}

function formatScoreDisplay(val) {
  if (isCategoryScore(val)) {
    return val.cat + '类 ' + val.score + '分';
  }
  return val + '分';
}

module.exports = {
  evaluateProbability: evaluateProbability,
  evaluateSchoolList: evaluateSchoolList,
  getTrend: getTrend,
  getNumericScore: getNumericScore,
  isCategoryScore: isCategoryScore,
  formatScoreDisplay: formatScoreDisplay,
  CATEGORY_ORDER: CATEGORY_ORDER
};
