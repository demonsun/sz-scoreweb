Component({
  properties: {
    probability: {
      type: Object,
      value: { level: '', percent: '', color: '#999', rank: 5 }
    }
  },

  observers: {
    'probability.color': function (color) {
      this.setData({ bgColor: color || '#999' });
    }
  },

  data: {
    bgColor: '#999'
  }
});
