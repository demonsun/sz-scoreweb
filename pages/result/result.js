var districtData = require('../../data/districts/index');
var scoreEngine = require('../../utils/score-engine');
var probability = require('../../utils/probability');
var adManager = require('../../utils/ad-manager');

Page({
  data: {
    districtKey: '',
    districtName: '',
    scoreResult: null,
    schoolList: [],
    maxScore: 120,
    categoryColor: '#1a73e8',
    isCategoryPriority: false,
    adBannerId: adManager.AD_CONFIG.bannerResult
  },

  onLoad: function (options) {
    var key = options.district || 'futian';
    var stage = options.stage || 'xiaoxue';
    var district = districtData.getDistrict(key);
    if (!district) {
      wx.showToast({ title: '数据加载失败', icon: 'none' });
      return;
    }

    var app = getApp();
    var result = app.globalData.scoreResult;
    var stageFromApp = app.globalData.currentStage || stage;

    if (!result) {
      var saved = wx.getStorageSync('lastResult');
      if (saved && saved.districtKey === key) {
        result = {
          baseScore: saved.totalScore,
          bonusScore: 0,
          totalScore: saved.totalScore,
          category: saved.category,
          details: []
        };
        stageFromApp = saved.stage || stage;
      }
    }

    if (!result) {
      wx.showToast({ title: '请先进行积分计算', icon: 'none' });
      setTimeout(function () {
        wx.navigateTo({ url: '/pages/calculator/calculator?district=' + key + '&stage=' + stage });
      }, 1000);
      return;
    }

    var stageLabel = stageFromApp === 'chuzhong' ? '小升初' : '幼升小';
    var categoryColor = this.getCategoryColor(result.category, district.key);
    var maxScore = this.getMaxScore(district.key);
    var catPriority = !!district.categoryPriority;

    var schools = scoreEngine.getSchools(key, stageFromApp);

    var schoolList = probability.evaluateSchoolList(
      result.totalScore,
      result.category,
      schools,
      catPriority
    );

    var that = this;
    schoolList = schoolList.map(function (item) {
      var scoreYears = Object.keys(item.scores).sort();
      var numericValues = scoreYears.map(function (y) {
        return probability.getNumericScore(item.scores[y]);
      });
      var minScore = Math.min.apply(null, numericValues);
      var maxS = Math.max.apply(null, numericValues);
      var range = maxS - minScore || 1;

      var barWidth = ((result.totalScore - minScore) / range) * 100;
      barWidth = Math.max(0, Math.min(100, barWidth));

      var yearScores = scoreYears.map(function (y) {
        var val = item.scores[y];
        return {
          year: y,
          score: probability.getNumericScore(val),
          display: probability.formatScoreDisplay(val)
        };
      });

      return Object.assign({}, item, {
        minScore: minScore,
        maxScore: maxS,
        barWidth: barWidth,
        userMarker: barWidth,
        yearScores: yearScores
      });
    });

    var userArea = (app.globalData.userArea) || 'all';
    var areaSchools = [];
    var otherSchools = [];

    if (userArea && userArea !== 'all') {
      for (var i = 0; i < schoolList.length; i++) {
        if (schoolList[i].area === userArea) {
          areaSchools.push(schoolList[i]);
        } else {
          otherSchools.push(schoolList[i]);
        }
      }
    } else {
      otherSchools = schoolList;
    }

    var areaLabel = '';
    if (district.areas && userArea !== 'all') {
      for (var j = 0; j < district.areas.length; j++) {
        if (district.areas[j].value === userArea) {
          areaLabel = district.areas[j].label;
          break;
        }
      }
    }

    this.setData({
      districtKey: key,
      districtName: district.name,
      stage: stageFromApp,
      stageLabel: stageLabel,
      scoreResult: result,
      areaSchools: areaSchools,
      otherSchools: otherSchools,
      areaLabel: areaLabel,
      hasAreaFilter: userArea !== 'all' && areaSchools.length > 0,
      schoolList: schoolList,
      maxScore: maxScore,
      categoryColor: categoryColor,
      isCategoryPriority: catPriority
    });

    wx.setNavigationBarTitle({ title: stageLabel + '积分 - ' + district.name });

    setTimeout(function () {
      adManager.showInterstitialAd();
    }, 1500);
  },

  onAdError: function (e) {
    console.log('结果页广告加载失败', e.detail);
  },

  getCategoryColor: function (category, districtKey) {
    if (category.indexOf('A') >= 0 || category.indexOf('第一') >= 0) return '#34a853';
    if (category.indexOf('B') >= 0 || category.indexOf('第二') >= 0) return '#4285f4';
    if (category.indexOf('C') >= 0 || category.indexOf('第三') >= 0) return '#f9ab00';
    if (category.indexOf('D') >= 0 || category.indexOf('第四') >= 0) return '#ea4335';
    return '#6c757d';
  },

  getMaxScore: function (districtKey) {
    var maxMap = {
      futian: 100,
      luohu: 160,
      nanshan: 100,
      baoan: 120
    };
    return maxMap[districtKey] || 120;
  },

  onSchoolTap: function (e) {
    var source = e.currentTarget.dataset.source;
    var index = e.currentTarget.dataset.index;
    var school;
    if (source === 'area') {
      school = this.data.areaSchools[index];
    } else {
      school = this.data.otherSchools[index];
    }
    if (!school) return;

    var app = getApp();
    app.globalData.selectedSchool = school;

    wx.navigateTo({
      url: '/pages/school-detail/school-detail?district=' + this.data.districtKey + '&stage=' + (this.data.stage || 'xiaoxue')
    });
  },

  onGoHome: function () {
    wx.reLaunch({ url: '/pages/index/index' });
  },

  onRecalc: function () {
    wx.navigateTo({
      url: '/pages/calculator/calculator?district=' + this.data.districtKey + '&stage=' + (this.data.stage || 'xiaoxue')
    });
  },

  onShare: function () {
    wx.showToast({ title: '长按页面可分享', icon: 'none' });
  },

  onShareAppMessage: function () {
    var r = this.data.scoreResult;
    return {
      title: '我在' + this.data.districtName + '的积分是' + r.totalScore + '分（' + r.category + '），快来测测你的！',
      path: '/pages/index/index'
    };
  }
});
