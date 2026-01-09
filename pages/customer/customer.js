// customer.js
Page({
    data: {
      searchValue: '',
      customerList: [],
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
        phone: '',
        wechat: '',
        gender: '',
        birthday: '',
        vipLevel: '',
        source: '',
        lastVisit: '',
        totalConsumption: '',
        remark: ''
      },
      
      // 选择器数据
      genders: ['男', '女', '保密'],
      genderIndex: 0,
      
      vipLevels: ['普通', '银卡', '金卡', '钻石', '至尊'],
      vipLevelIndex: 0,
      
      sources: ['门店到访', '朋友推荐', '线上预约', '活动引流', '电话咨询', '其他'],
      sourceIndex: 0
    },
  
    onLoad: function() {
      this.loadCustomerList();
    },
  
    // 加载客户列表
    loadCustomerList: function() {
      const { searchValue, currentPage, pageSize } = this.data;
      
      this.setData({ loading: true });
      
      // 模拟API请求
      setTimeout(() => {
        const mockData = this.generateMockData(searchValue, currentPage, pageSize);
        const newList = currentPage === 1 ? mockData : [...this.data.customerList, ...mockData];
        const hasMore = mockData.length >= pageSize;
        
        this.setData({
          customerList: newList,
          hasMore: hasMore,
          loading: false
        });
      }, 500);
    },
  
    // 生成模拟数据
    generateMockData: function(searchValue, page, pageSize) {
      const allCustomers = [
        { 
          id: 1, 
          name: '张美丽', 
          phone: '13800138001',
          wechat: 'zhangmeili',
          gender: '女',
          birthday: '1990-05-20',
          vipLevel: '钻石',
          source: '朋友推荐',
          lastVisit: '2023-10-15',
          totalConsumption: 12800,
          remark: '注重护肤，喜欢高端产品'
        },
        { 
          id: 2, 
          name: '王先生', 
          phone: '13900139002',
          gender: '男',
          vipLevel: '金卡',
          source: '门店到访',
          lastVisit: '2023-10-10',
          totalConsumption: 5800,
          remark: '主要为太太购买产品'
        },
        { 
          id: 3, 
          name: '李小姐', 
          phone: '13600136003',
          wechat: 'lily_lee',
          gender: '女',
          vipLevel: '银卡',
          source: '线上预约',
          lastVisit: '2023-10-08',
          totalConsumption: 3200,
          remark: '皮肤敏感，需要温和护理'
        },
        { 
          id: 4, 
          name: '陈太太', 
          phone: '13500135004',
          gender: '女',
          birthday: '1985-08-12',
          vipLevel: '至尊',
          source: '活动引流',
          lastVisit: '2023-10-05',
          totalConsumption: 25800,
          remark: 'VIP客户，每月固定消费'
        },
        { 
          id: 5, 
          name: '刘女士', 
          phone: '13700137005',
          wechat: 'liunvshi88',
          gender: '女',
          vipLevel: '普通',
          source: '电话咨询',
          lastVisit: '2023-09-28',
          totalConsumption: 1500,
          remark: '新客户，首次体验'
        },
        { 
          id: 6, 
          name: '赵小姐', 
          phone: '13200132006',
          gender: '女',
          vipLevel: '金卡',
          source: '朋友推荐',
          lastVisit: '2023-09-25',
          totalConsumption: 7600,
          remark: '经常做美甲和睫毛'
        },
        { 
          id: 7, 
          name: '孙先生', 
          phone: '13100131007',
          gender: '男',
          vipLevel: '普通',
          source: '门店到访',
          lastVisit: '2023-09-20',
          totalConsumption: 2800,
          remark: '购买男士护肤品'
        },
        { 
          id: 8, 
          name: '周小姐', 
          phone: '13000130008',
          wechat: 'zhouzhou',
          gender: '女',
          birthday: '1995-03-15',
          vipLevel: '银卡',
          source: '线上预约',
          lastVisit: '2023-09-18',
          totalConsumption: 4200,
          remark: '学生客户，预算有限'
        }
      ];
      
      // 筛选
      let filtered = allCustomers;
      if (searchValue) {
        filtered = allCustomers.filter(item => 
          item.name.includes(searchValue) || 
          item.phone.includes(searchValue) ||
          (item.wechat && item.wechat.includes(searchValue))
        );
      }
      
      // 分页
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return filtered.slice(start, end);
    },
  
    // 搜索输入处理
    onSearchInput: function(e) {
      const searchValue = e.detail.value;
      this.setData({
        searchValue: searchValue,
        currentPage: 1,
        customerList: []
      });
      
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.loadCustomerList();
      }, 500);
    },
  
    // 键盘搜索确认
    onSearchConfirm: function(e) {
      this.setData({
        searchValue: e.detail.value,
        currentPage: 1,
        customerList: []
      });
      this.loadCustomerList();
    },
  
    // 加载更多
    loadMore: function() {
      if (this.data.loading || !this.data.hasMore) return;
      
      this.setData({
        currentPage: this.data.currentPage + 1
      });
      this.loadCustomerList();
    },
  
    // 显示新增弹窗
    showAddModal: function() {
      this.setData({
        showModal: true,
        isEdit: false,
        editingId: null,
        formData: {
          name: '',
          phone: '',
          wechat: '',
          gender: '',
          birthday: '',
          vipLevel: '',
          source: '',
          lastVisit: '',
          totalConsumption: '',
          remark: ''
        },
        genderIndex: 0,
        vipLevelIndex: 0,
        sourceIndex: 0
      });
    },
  
    // 隐藏弹窗
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
  
    // 性别选择
    onGenderChange: function(e) {
      const index = e.detail.value;
      const gender = this.data.genders[index];
      
      this.setData({
        genderIndex: index,
        [`formData.gender`]: gender
      });
    },
  
    // 生日选择
    onBirthdayChange: function(e) {
      const birthday = e.detail.value;
      this.setData({
        [`formData.birthday`]: birthday
      });
    },
  
    // VIP等级选择
    onVipLevelChange: function(e) {
      const index = e.detail.value;
      const vipLevel = this.data.vipLevels[index];
      
      this.setData({
        vipLevelIndex: index,
        [`formData.vipLevel`]: vipLevel
      });
    },
  
    // 来源选择
    onSourceChange: function(e) {
      const index = e.detail.value;
      const source = this.data.sources[index];
      
      this.setData({
        sourceIndex: index,
        [`formData.source`]: source
      });
    },
  
    // 保存客户
    saveCustomer: function() {
      const { formData, isEdit, editingId } = this.data;
      
      // 验证必填字段
      if (!formData.name.trim()) {
        wx.showToast({
          title: '请输入客户姓名',
          icon: 'none'
        });
        return;
      }
      
      if (!formData.phone) {
        wx.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return;
      }
      
      // 简单的手机号验证
      if (formData.phone.length !== 11) {
        wx.showToast({
          title: '请输入11位手机号',
          icon: 'none'
        });
        return;
      }
      
      wx.showLoading({
        title: '保存中...'
      });
      
      // 模拟API请求
      setTimeout(() => {
        wx.hideLoading();
        
        if (isEdit) {
          // 更新现有客户
          const newList = this.data.customerList.map(item => 
            item.id === editingId ? { ...formData, id: editingId } : item
          );
          this.setData({ customerList: newList });
          wx.showToast({ title: '更新成功' });
        } else {
          // 新增客户
          const newCustomer = {
            ...formData,
            id: Date.now(), // 使用时间戳作为ID
            totalConsumption: formData.totalConsumption || 0
          };
          this.setData({ 
            customerList: [newCustomer, ...this.data.customerList]
          });
          wx.showToast({ title: '添加成功' });
        }
        
        this.hideModal();
      }, 800);
    },
  
    // 编辑客户
    editCustomer: function(e) {
      const id = e.currentTarget.dataset.id;
      const customer = this.data.customerList.find(item => item.id === parseInt(id));
      
      if (customer) {
        const genderIndex = this.data.genders.indexOf(customer.gender);
        const vipLevelIndex = this.data.vipLevels.indexOf(customer.vipLevel);
        const sourceIndex = this.data.sources.indexOf(customer.source);
        
        this.setData({
          showModal: true,
          isEdit: true,
          editingId: id,
          formData: { ...customer },
          genderIndex: genderIndex !== -1 ? genderIndex : 0,
          vipLevelIndex: vipLevelIndex !== -1 ? vipLevelIndex : 0,
          sourceIndex: sourceIndex !== -1 ? sourceIndex : 0
        });
      }
    },
  
    // 删除客户
    deleteCustomer: function(e) {
      const id = e.currentTarget.dataset.id;
      const customerName = this.data.customerList.find(item => item.id === parseInt(id))?.name || '';
      
      wx.showModal({
        title: '确认删除',
        content: `确定要删除客户"${customerName}"吗？此操作不可恢复。`,
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '删除中...' });
            
            setTimeout(() => {
              const newList = this.data.customerList.filter(item => item.id !== parseInt(id));
              this.setData({ customerList: newList });
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
        customerList: []
      });
      this.loadCustomerList();
      setTimeout(() => {
        wx.stopPullDownRefresh();
      }, 1000);
    },
  
    // 页面显示时刷新数据
    onShow: function() {
      // 可以在这里刷新数据，确保数据最新
      this.setData({
        currentPage: 1,
        customerList: []
      });
      this.loadCustomerList();
    }
  });