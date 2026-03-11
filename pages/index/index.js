var districtData = require('../../data/districts/index');
var adManager = require('../../utils/ad-manager');

Page({
  data: {
    districts: districtData.districtList,
    lastResult: null,
    stage: 'xiaoxue',
    adBannerId: adManager.AD_CONFIG.bannerIndex
  },

  onShow: function () {
    var saved = wx.getStorageSync('lastResult');
    if (saved) {
      this.setData({ lastResult: saved });
    }
  },

  onStageChange: function (e) {
    var stage = e.currentTarget.dataset.stage;
    this.setData({ stage: stage });
  },

  onDistrictTap: function (e) {
    var key = e.currentTarget.dataset.key;
    var stage = this.data.stage;
    wx.navigateTo({
      url: '/pages/calculator/calculator?district=' + key + '&stage=' + stage
    });
  },

  onAdError: function (e) {
    console.log('首页广告加载失败', e.detail);
  },

  onHistoryTap: function () {
    var r = this.data.lastResult;
    if (r && r.districtKey) {
      var stage = r.stage || 'xiaoxue';
      wx.navigateTo({
        url: '/pages/result/result?district=' + r.districtKey + '&stage=' + stage
      });
    }
  }
});
