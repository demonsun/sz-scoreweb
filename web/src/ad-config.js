/**
 * Google AdSense 广告配置
 *
 * 使用前请：
 * 1. 在 https://www.google.com/adsense/ 注册并审核通过
 * 2. 将 index.html 中的 ca-pub-XXXXXXXXXXXXXXXX 替换为你的发布商 ID
 * 3. 在 AdSense 后台创建广告单元，把返回的 slot ID 填到下方对应位置
 */
export const ADSENSE_CONFIG = {
  client: "ca-pub-2204370792669375",

  slots: {
    homeBanner:       "1234567890",  // 首页 - 区域卡片下方横幅
    calcBanner:       "1234567891",  // 计算器 - 问答卡片下方横幅
    resultTop:        "1234567892",  // 结果页 - 分数区与明细之间
    resultMid:        "1234567893",  // 结果页 - 明细与学校列表之间
    detailBottom:     "1234567894",  // 学校详情 - 页面底部
  },
};
