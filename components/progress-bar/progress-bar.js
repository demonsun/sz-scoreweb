Component({
  properties: {
    current: { type: Number, value: 0 },
    total: { type: Number, value: 1 }
  },

  observers: {
    'current, total': function (current, total) {
      var percent = total > 0 ? Math.round((current / total) * 100) : 0;
      this.setData({ percent: percent });
    }
  },

  data: {
    percent: 0
  }
});
