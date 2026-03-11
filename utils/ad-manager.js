/**
 * 广告管理器
 *
 * 使用前需在微信公众平台 -> 流量主 -> 广告管理 中创建广告位，
 * 并将返回的广告单元 ID 填入下方 AD_CONFIG。
 *
 * 开通条件：小程序累计独立用户 >= 1000，无严重违规。
 */

var AD_CONFIG = {
  // Banner 广告单元 ID（在各页面底部展示）
  bannerIndex: 'adunit-index-banner',
  bannerResult: 'adunit-result-banner',
  bannerSchoolDetail: 'adunit-school-detail-banner',

  // 插屏广告单元 ID（在页面切换时弹出）
  interstitialResult: 'adunit-result-interstitial',

  // 激励视频广告单元 ID（用户主动点击观看，解锁高级功能）
  rewardedVideo: 'adunit-rewarded-video'
};

var interstitialAd = null;
var rewardedVideoAd = null;

function initInterstitialAd() {
  if (!wx.createInterstitialAd) return null;
  if (interstitialAd) return interstitialAd;
  interstitialAd = wx.createInterstitialAd({
    adUnitId: AD_CONFIG.interstitialResult
  });
  interstitialAd.onError(function (err) {
    console.log('插屏广告加载失败', err);
  });
  return interstitialAd;
}

function showInterstitialAd() {
  var ad = initInterstitialAd();
  if (!ad) return;
  ad.show().catch(function () {
    // 广告未准备好，静默失败
  });
}

function initRewardedVideoAd(onClose) {
  if (!wx.createRewardedVideoAd) return null;
  if (rewardedVideoAd) {
    rewardedVideoAd.offClose();
    if (onClose) rewardedVideoAd.onClose(onClose);
    return rewardedVideoAd;
  }
  rewardedVideoAd = wx.createRewardedVideoAd({
    adUnitId: AD_CONFIG.rewardedVideo
  });
  rewardedVideoAd.onError(function (err) {
    console.log('激励视频广告加载失败', err);
  });
  if (onClose) rewardedVideoAd.onClose(onClose);
  return rewardedVideoAd;
}

function showRewardedVideoAd(onReward, onSkip) {
  var ad = initRewardedVideoAd(function (res) {
    if (res && res.isEnded) {
      onReward && onReward();
    } else {
      onSkip && onSkip();
    }
  });
  if (!ad) {
    onReward && onReward();
    return;
  }
  ad.show().catch(function () {
    ad.load().then(function () {
      ad.show();
    }).catch(function () {
      wx.showToast({ title: '广告加载失败，已为您解锁', icon: 'none' });
      onReward && onReward();
    });
  });
}

module.exports = {
  AD_CONFIG: AD_CONFIG,
  showInterstitialAd: showInterstitialAd,
  showRewardedVideoAd: showRewardedVideoAd,
  initInterstitialAd: initInterstitialAd,
  initRewardedVideoAd: initRewardedVideoAd
};
