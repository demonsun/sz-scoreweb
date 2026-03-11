Component({
  properties: {
    question: { type: Object, value: {} },
    currentValue: { type: null, value: '' }
  },

  methods: {
    onOptionTap: function (e) {
      var value = e.currentTarget.dataset.value;
      this.triggerEvent('change', {
        questionId: this.data.question.id,
        value: value
      });
    },

    onNumberInput: function (e) {
      var val = e.detail.value;
      this.triggerEvent('change', {
        questionId: this.data.question.id,
        value: val
      });
    },

    onNumberBlur: function (e) {
      var val = parseFloat(e.detail.value) || 0;
      var q = this.data.question;
      if (q.min !== undefined && val < q.min) val = q.min;
      if (q.max !== undefined && val > q.max) val = q.max;
      this.triggerEvent('change', {
        questionId: q.id,
        value: String(val)
      });
    }
  }
});
