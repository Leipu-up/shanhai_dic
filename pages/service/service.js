// service.js
Page({
    data: {
      searchValue: '',
      serviceList: [],
      pageSize: 10,
      currentPage: 1,
      hasMore: true,
      loading: false,
      
      // 弹窗相关数据
      showModal: false,
      isEdit: false,
      editingId: null,
      formData: {
        name: '',
        price: '',
        duration: '',
        category: '',
        description: ''
      },
      
      // 服务分类选项
      categories: ['面部护理', '身体护理', '美容美发', '美甲美睫', '其他服务'],
      categoryIndex: 0
    },
  
    onLoad: function() {
      this.loadServiceList();
    },
  
    // 加载服务列表
    loadServiceList: function() {
      const { searchValue, currentPage, pageSize } = this.data;
      
      // 模拟API请求
      this.setData({ loading: true });
      
      // 这里应该替换为真实的API调用
      setTimeout(() => {
        // 模拟数据
        const mockData = this.generateMockData(searchValue, currentPage, pageSize);
        const newList = currentPage === 1 ? mockData : [...this.data.serviceList, ...mockData];
        const hasMore = mockData.length >= pageSize;
        
        this.setData({
          serviceList: newList,
          hasMore: hasMore,
          loading: false
        });
      }, 500);
    },
  
    // 生成模拟数据
    generateMockData: function(searchValue, page, pageSize) {
      const allServices = [
        { id: 1, name: '基础面部护理', price: 198, duration: 60, category: '面部护理', description: '基础清洁补水护理' },
        { id: 2, name: '深层清洁护理', price: 298, duration: 90, category: '面部护理', description: '深层毛孔清洁' },
        { id: 3, name: '全身SPA按摩', price: 398, duration: 120, category: '身体护理', description: '全身放松按摩' },
        { id: 4, name: '精油开背', price: 258, duration: 60, category: '身体护理', description: '背部精油按摩' },
        { id: 5, name: '时尚剪发', price: 88, duration: 45, category: '美容美发', description: '专业发型设计' },
        { id: 6, name: '高级染发', price: 388, duration: 120, category: '美容美发', description: '进口染发剂' },
        { id: 7, name: '美甲服务', price: 128, duration: 60, category: '美甲美睫', description: '基础美甲护理' },
        { id: 8, name: '睫毛嫁接', price: 298, duration: 90, category: '美甲美睫', description: '单根睫毛嫁接' }
      ];
      
      // 筛选
      let filtered = allServices;
      if (searchValue) {
        filtered = allServices.filter(item => 
          item.name.includes(searchValue)
        );
      }
      
      // 分页
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return filtered.slice(start, end);
    },
  
    // 搜索相关方法
    onSearchInput: function(e) {
      this.setData({
        searchValue: e.detail.value
      });
    },
  
    onSearch: function() {
      this.setData({
        currentPage: 1,
        serviceList: []
      });
      this.loadServiceList();
    },
  
    onSearchConfirm: function() {
      this.onSearch();
    },
  
    // 加载更多
    loadMore: function() {
      if (this.data.loading || !this.data.hasMore) return;
      
      this.setData({
        currentPage: this.data.currentPage + 1
      });
      this.loadServiceList();
    },
  
    // 弹窗相关方法
    showAddModal: function() {
      this.setData({
        showModal: true,
        isEdit: false,
        editingId: null,
        formData: {
          name: '',
          price: '',
          duration: '',
          category: '',
          description: ''
        },
        categoryIndex: 0
      });
    },
  
    showEditModal: function(id) {
      const service = this.data.serviceList.find(item => item.id === id);
      if (service) {
        const categoryIndex = this.data.categories.indexOf(service.category);
        this.setData({
          showModal: true,
          isEdit: true,
          editingId: id,
          formData: { ...service },
          categoryIndex: categoryIndex !== -1 ? categoryIndex : 0
        });
      }
    },
  
    hideModal: function() {
      this.setData({
        showModal: false
      });
    },
  
    // 表单输入处理
    onFormInput: function(e) {
      const field = e.currentTarget.dataset.field;
      const value = e.detail.value;
      
      this.setData({
        [`formData.${field}`]: value
      });
    },
  
    onCategoryChange: function(e) {
      const index = e.detail.value;
      const category = this.data.categories[index];
      
      this.setData({
        categoryIndex: index,
        [`formData.category`]: category
      });
    },
  
    // 保存服务
    saveService: function() {
      const { formData, isEdit, editingId } = this.data;
      
      // 验证必填字段
      if (!formData.name.trim()) {
        wx.showToast({
          title: '请输入服务名称',
          icon: 'none'
        });
        return;
      }
      
      if (!formData.price) {
        wx.showToast({
          title: '请输入价格',
          icon: 'none'
        });
        return;
      }
      
      // 模拟保存操作
      wx.showLoading({
        title: '保存中...'
      });
      
      setTimeout(() => {
        wx.hideLoading();
        
        // 这里应该替换为真实的API调用
        if (isEdit) {
          // 更新现有服务
          const newList = this.data.serviceList.map(item => 
            item.id === editingId ? { ...formData, id: editingId } : item
          );
          this.setData({ serviceList: newList });
          wx.showToast({ title: '更新成功' });
        } else {
          // 新增服务
          const newService = {
            ...formData,
            id: Date.now() // 使用时间戳作为ID
          };
          this.setData({ 
            serviceList: [newService, ...this.data.serviceList]
          });
          wx.showToast({ title: '添加成功' });
        }
        
        this.hideModal();
      }, 800);
    },
  
    // 编辑服务
    editService: function(e) {
      const id = e.currentTarget.dataset.id;
      this.showEditModal(parseInt(id));
    },
  
    // 删除服务
    deleteService: function(e) {
      const id = e.currentTarget.dataset.id;
      const serviceName = this.data.serviceList.find(item => item.id === parseInt(id))?.name || '';
      
      wx.showModal({
        title: '确认删除',
        content: `确定要删除"${serviceName}"服务吗？`,
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '删除中...' });
            
            setTimeout(() => {
              const newList = this.data.serviceList.filter(item => item.id !== parseInt(id));
              this.setData({ serviceList: newList });
              wx.hideLoading();
              wx.showToast({ title: '删除成功' });
            }, 600);
          }
        }
      });
    },
  
    // 下拉刷新
    onPullDownRefresh: function() {
      this.setData({
        currentPage: 1,
        serviceList: []
      });
      this.loadServiceList();
      setTimeout(() => {
        wx.stopPullDownRefresh();
      }, 1000);
    }
  });