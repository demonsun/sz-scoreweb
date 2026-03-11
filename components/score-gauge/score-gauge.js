Component({
  properties: {
    score: { type: Number, value: 0 },
    maxScore: { type: Number, value: 120 },
    category: { type: String, value: '' },
    categoryColor: { type: String, value: '#1a73e8' },
    details: { type: Array, value: [] }
  },

  data: {
    canvasSize: 160
  },

  lifetimes: {
    attached: function () {
      var sysInfo = wx.getSystemInfoSync();
      var size = Math.floor(160 * (sysInfo.screenWidth / 375));
      this.setData({ canvasSize: size });
    },
    ready: function () {
      this.drawGauge();
    }
  },

  observers: {
    'score, maxScore': function () {
      this.drawGauge();
    }
  },

  methods: {
    drawGauge: function () {
      var that = this;
      var query = this.createSelectorQuery();
      query.select('#gaugeCanvas').fields({ node: true, size: true }).exec(function (res) {
        if (!res || !res[0] || !res[0].node) return;
        var canvas = res[0].node;
        var ctx = canvas.getContext('2d');
        var dpr = wx.getSystemInfoSync().pixelRatio;
        var size = that.data.canvasSize;

        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        var cx = size / 2;
        var cy = size / 2;
        var radius = size / 2 - 8;
        var lineWidth = 10;
        var ratio = Math.min(that.data.score / that.data.maxScore, 1);

        ctx.clearRect(0, 0, size, size);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#e8e8e8';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (ratio > 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
          var gradient = ctx.createLinearGradient(0, 0, size, size);
          gradient.addColorStop(0, '#1a73e8');
          gradient.addColorStop(1, '#34a853');
          ctx.strokeStyle = gradient;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      });
    }
  }
});
