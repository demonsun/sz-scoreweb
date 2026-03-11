var scoreEngine = require('../../utils/score-engine');
var districtData = require('../../data/districts/index');

Page({
  data: {
    districtKey: '',
    districtName: '',
    stage: 'xiaoxue',
    stageLabel: '幼升小',
    questions: [],
    visibleQuestions: [],
    answers: {},
    currentStep: 0,
    allAnswered: false,
    swiperHeight: 500
  },

  onLoad: function (options) {
    var key = options.district || 'futian';
    var stage = options.stage || 'xiaoxue';
    var district = districtData.getDistrict(key);
    if (!district) {
      wx.showToast({ title: '区域数据加载失败', icon: 'none' });
      return;
    }

    var stageLabel = stage === 'chuzhong' ? '小升初' : '幼升小';
    var visible = scoreEngine.getVisibleQuestions(key, {}, stage);

    this.setData({
      districtKey: key,
      districtName: district.name,
      stage: stage,
      stageLabel: stageLabel,
      visibleQuestions: visible
    });

    wx.setNavigationBarTitle({ title: district.name + ' · ' + stageLabel + '积分' });
    this.updateSwiperHeight();
  },

  onAnswerChange: function (e) {
    var detail = e.detail;
    var answers = Object.assign({}, this.data.answers);
    answers[detail.questionId] = detail.value;

    var visible = scoreEngine.getVisibleQuestions(this.data.districtKey, answers, this.data.stage);
    var allAnswered = scoreEngine.isAllQuestionsAnswered(this.data.districtKey, answers, this.data.stage);

    var currentStep = this.data.currentStep;
    if (currentStep >= visible.length) {
      currentStep = visible.length - 1;
    }

    this.setData({
      answers: answers,
      visibleQuestions: visible,
      allAnswered: allAnswered,
      currentStep: currentStep
    });

    var currentQ = visible[currentStep];
    if (currentQ && currentQ.type === 'single' && detail.value) {
      var that = this;
      setTimeout(function () {
        if (currentStep < visible.length - 1) {
          that.setData({ currentStep: currentStep + 1 });
        }
      }, 300);
    }
  },

  onSwiperChange: function (e) {
    if (e.detail.source === 'touch' || e.detail.source === 'autoplay') {
      this.setData({ currentStep: e.detail.current });
    }
  },

  onPrev: function () {
    if (this.data.currentStep > 0) {
      this.setData({ currentStep: this.data.currentStep - 1 });
    }
  },

  onNext: function () {
    var currentQ = this.data.visibleQuestions[this.data.currentStep];
    if (!currentQ || !this.data.answers[currentQ.id]) {
      wx.showToast({ title: '请先回答当前问题', icon: 'none' });
      return;
    }
    if (this.data.currentStep < this.data.visibleQuestions.length - 1) {
      this.setData({ currentStep: this.data.currentStep + 1 });
    }
  },

  onSubmit: function () {
    if (!this.data.allAnswered) {
      wx.showToast({ title: '请完成所有问题', icon: 'none' });
      return;
    }

    var result = scoreEngine.calculateScore(this.data.districtKey, this.data.answers, this.data.stage);
    if (!result) {
      wx.showToast({ title: '计算失败', icon: 'none' });
      return;
    }

    var userArea = scoreEngine.getUserArea(this.data.answers);

    var app = getApp();
    app.globalData.currentDistrict = this.data.districtKey;
    app.globalData.currentStage = this.data.stage;
    app.globalData.userArea = userArea;
    app.globalData.answers = this.data.answers;
    app.globalData.scoreResult = result;

    var now = new Date();
    var timeStr = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' ' + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

    wx.setStorageSync('lastResult', {
      districtKey: this.data.districtKey,
      districtName: this.data.districtName,
      stage: this.data.stage,
      stageLabel: this.data.stageLabel,
      totalScore: result.totalScore,
      category: result.category,
      time: timeStr
    });

    wx.navigateTo({
      url: '/pages/result/result?district=' + this.data.districtKey + '&stage=' + this.data.stage
    });
  },

  onReset: function () {
    var that = this;
    wx.showModal({
      title: '确认重置',
      content: '将清除所有已填写的答案',
      success: function (res) {
        if (res.confirm) {
          var visible = scoreEngine.getVisibleQuestions(that.data.districtKey, {}, that.data.stage);
          that.setData({
            answers: {},
            currentStep: 0,
            visibleQuestions: visible,
            allAnswered: false
          });
        }
      }
    });
  },

  onBack: function () {
    wx.navigateBack();
  },

  onDotTap: function (e) {
    var index = e.currentTarget.dataset.index;
    this.setData({ currentStep: index });
  },

  updateSwiperHeight: function () {
    var sysInfo = wx.getSystemInfoSync();
    var headerH = 120 + (sysInfo.statusBarHeight || 44);
    var progressH = 80;
    var actionH = 160;
    var dotsH = 50;
    var available = sysInfo.windowHeight - headerH - progressH - actionH - dotsH;
    this.setData({ swiperHeight: Math.max(available, 400) });
  }
});
