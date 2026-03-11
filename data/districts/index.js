var futian = require('./futian');
var luohu = require('./luohu');
var nanshan = require('./nanshan');
var baoan = require('./baoan');
var longgang = require('./longgang');
var longhua = require('./longhua');
var yantian = require('./yantian');
var pingshan = require('./pingshan');
var guangming = require('./guangming');
var dapeng = require('./dapeng');

var districts = {
  futian: futian,
  luohu: luohu,
  nanshan: nanshan,
  baoan: baoan,
  longgang: longgang,
  longhua: longhua,
  yantian: yantian,
  pingshan: pingshan,
  guangming: guangming,
  dapeng: dapeng
};

var districtList = [
  futian, luohu, nanshan, baoan,
  longgang, longhua,
  yantian, pingshan, guangming, dapeng
];

module.exports = {
  districts: districts,
  districtList: districtList,
  getDistrict: function (key) {
    return districts[key] || null;
  }
};
