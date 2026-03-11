var districtData = require('../../data/districts/index');
var prob = require('../../utils/probability');
var adManager = require('../../utils/ad-manager');

Page({
  data: {
    school: null,
    userScore: 0,
    latestYear: '',
    latestScore: 0,
    diffAbs: 0,
    diffPositive: true,
    yearData: [],
    avgScore: 0,
    maxHistoryScore: 0,
    minHistoryScore: 0,
    trendText: '',
    trendDirection: '',
    suggestion: '',
    suggestionUnlocked: false,
    adBannerId: adManager.AD_CONFIG.bannerSchoolDetail
  },

  onLoad: function (options) {
    var app = getApp();
    var school = app.globalData.selectedSchool;
    var result = app.globalData.scoreResult;

    if (!school || !result) {
      wx.showToast({ title: '数据加载失败', icon: 'none' });
      return;
    }

    var userScore = result.totalScore;
    var scores = school.scores;
    var years = Object.keys(scores).sort();
    var scoreValues = years.map(function (y) { return prob.getNumericScore(scores[y]); });

    var latestYear = years[years.length - 1];
    var latestVal = scores[latestYear];
    var latestScore = prob.getNumericScore(latestVal);
    var latestDisplay = prob.formatScoreDisplay(latestVal);
    var diff = Math.round((userScore - latestScore) * 10) / 10;

    var isCatPriority = school.categoryPriority;
    var catNote = '';
    if (isCatPriority && prob.isCategoryScore(latestVal)) {
      var schoolCat = latestVal.cat + '类';
      var userCat = result.category;
      catNote = '该校录取到' + schoolCat + '，你是' + userCat;
    }

    var avgScore = Math.round(scoreValues.reduce(function (a, b) { return a + b; }, 0) / scoreValues.length * 10) / 10;
    var maxS = Math.max.apply(null, scoreValues);
    var minS = Math.min.apply(null, scoreValues);

    var yearData = years.map(function (y) {
      var numVal = prob.getNumericScore(scores[y]);
      var d = Math.round((userScore - numVal) * 10) / 10;
      return { year: y, score: numVal, display: prob.formatScoreDisplay(scores[y]), diff: d };
    });

    var trend = prob.getTrend(scores);
    var trendText = '';
    var trendDirection = '';
    if (trend > 1) {
      trendText = '持续上涨（年均+' + Math.round(trend * 10) / 10 + '分）';
      trendDirection = 'up';
    } else if (trend < -1) {
      trendText = '持续下降（年均' + Math.round(trend * 10) / 10 + '分）';
      trendDirection = 'down';
    } else {
      trendText = '基本持平';
      trendDirection = 'flat';
    }

    var suggestion = this.generateSuggestion(school.probability.rank, diff, trendDirection);

    this.setData({
      school: school,
      userScore: userScore,
      latestYear: latestYear,
      latestScore: latestScore,
      latestDisplay: latestDisplay,
      diffAbs: Math.abs(diff),
      diffPositive: diff >= 0,
      isCatPriority: isCatPriority,
      catNote: catNote,
      yearData: yearData,
      avgScore: avgScore,
      maxHistoryScore: maxS,
      minHistoryScore: minS,
      trendText: trendText,
      trendDirection: trendDirection,
      suggestion: suggestion
    });

    wx.setNavigationBarTitle({ title: school.name });

    var unlocked = wx.getStorageSync('suggestion_unlocked') || false;
    this.setData({ suggestionUnlocked: unlocked });

    var that = this;
    setTimeout(function () {
      that.drawTrendChart(years, scoreValues, userScore);
    }, 300);
  },

  onWatchAd: function () {
    var that = this;
    adManager.showRewardedVideoAd(
      function () {
        that.setData({ suggestionUnlocked: true });
        wx.setStorageSync('suggestion_unlocked', true);
        wx.showToast({ title: '已解锁详细建议', icon: 'success' });
      },
      function () {
        wx.showToast({ title: '需完整观看视频才能解锁', icon: 'none' });
      }
    );
  },

  onAdError: function (e) {
    console.log('学校详情页广告加载失败', e.detail);
  },

  generateSuggestion: function (rank, diff, trendDir) {
    if (rank <= 2) {
      var s = '您的积分较高，录取该校的可能性较大。';
      if (trendDir === 'up') {
        s += '但需注意该校录取分数线呈上涨趋势，建议持续关注最新政策变化，做好备选方案。';
      } else {
        s += '该校录取分数线较为稳定或有所下降，可以作为第一志愿重点考虑。';
      }
      return s;
    } else if (rank === 3) {
      return '您的积分与该校录取线接近，存在一定录取可能。建议：1）关注是否有其他加分项可以争取；2）准备1-2所分数线略低的备选学校；3）密切关注当年招生政策变化。';
    } else if (rank === 4) {
      return '您的积分低于该校往年录取线，录取难度较大。建议：1）优先考虑分数线更匹配的学校；2）了解是否有大学区分流等政策可以利用；3）提前做好多校申请的准备。';
    } else {
      return '您的积分与该校录取线差距较大，建议选择其他更匹配的学校申请。可以在结果页查看录取概率更高的学校列表。';
    }
  },

  drawTrendChart: function (years, scoreValues, userScore) {
    var that = this;
    var query = this.createSelectorQuery();
    query.select('#trendChart').fields({ node: true, size: true }).exec(function (res) {
      if (!res || !res[0] || !res[0].node) return;

      var canvas = res[0].node;
      var ctx = canvas.getContext('2d');
      var dpr = wx.getSystemInfoSync().pixelRatio;
      var width = res[0].width;
      var height = res[0].height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      var padding = { top: 30, right: 30, bottom: 40, left: 50 };
      var chartW = width - padding.left - padding.right;
      var chartH = height - padding.top - padding.bottom;

      var allValues = scoreValues.concat([userScore]);
      var minVal = Math.min.apply(null, allValues) - 5;
      var maxVal = Math.max.apply(null, allValues) + 5;
      var range = maxVal - minVal || 1;

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      var gridCount = 4;
      for (var g = 0; g <= gridCount; g++) {
        var gy = padding.top + (chartH / gridCount) * g;
        ctx.beginPath();
        ctx.moveTo(padding.left, gy);
        ctx.lineTo(width - padding.right, gy);
        ctx.stroke();

        var gridVal = Math.round(maxVal - (range / gridCount) * g);
        ctx.fillStyle = '#bbb';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(String(gridVal), padding.left - 8, gy + 4);
      }

      var points = [];
      for (var i = 0; i < years.length; i++) {
        var x = padding.left + (chartW / Math.max(years.length - 1, 1)) * i;
        var y = padding.top + chartH - ((scoreValues[i] - minVal) / range) * chartH;
        points.push({ x: x, y: y });

        ctx.fillStyle = '#888';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(years[i], x, height - padding.bottom + 20);
      }

      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var j = 1; j < points.length; j++) {
          var cpx1 = points[j - 1].x + (points[j].x - points[j - 1].x) / 3;
          var cpy1 = points[j - 1].y;
          var cpx2 = points[j].x - (points[j].x - points[j - 1].x) / 3;
          var cpy2 = points[j].y;
          ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, points[j].x, points[j].y);
        }
        ctx.strokeStyle = '#1a73e8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        var gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, 'rgba(26, 115, 232, 0.15)');
        gradient.addColorStop(1, 'rgba(26, 115, 232, 0)');
        ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
        ctx.lineTo(points[0].x, padding.top + chartH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      for (var k = 0; k < points.length; k++) {
        ctx.beginPath();
        ctx.arc(points[k].x, points[k].y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#1a73e8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#1a73e8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(scoreValues[k]), points[k].x, points[k].y - 12);
      }

      var userY = padding.top + chartH - ((userScore - minVal) / range) * chartH;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, userY);
      ctx.lineTo(width - padding.right, userY);
      ctx.strokeStyle = '#ea4335';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ea4335';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('你: ' + userScore, width - padding.right + 4, userY + 4);
    });
  }
});
