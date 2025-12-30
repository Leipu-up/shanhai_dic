// components/search-bar/search-bar.js
Component({
    properties: {
      placeholder: {
        type: String,
        value: '请输入搜索内容'
      }
    },
    
    methods: {
      onSearch(e) {
        const value = e.detail.value;
        this.triggerEvent('search', { value });
      },
      
      onFocus() {
        this.triggerEvent('focus');
      }
    }
  });