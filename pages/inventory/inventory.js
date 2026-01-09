Page({
    data: {
      searchKeyword: '',
      selectedStoreIndex: 0,
      selectedStoreName: '',
      
      // 分页数据
      pageSize: 10,
      currentPage: 1,
      totalCount: 0,
      totalPages: 0,
      isLoading: false,
      hasMore: true,
      
      // 统计信息
      lowStockCount: 0,
      
      // 门店选项
      storeOptions: ['全部店名', '总店', '分店一', '分店二', '分店三', '旗舰店'],
      
      // 库存列表
      inventoryList: [],
      
      // 详情弹窗
      showDetailModal: false,
      currentDetail: {},
      
      // 入库/出库弹窗类型
      inOutType: 'in', // 'in' 或 'out'
      
      // 所有库存数据
      allInventory: []
    },
  
    onLoad(options) {
      this.loadAllInventory();
    },
  
    onShow() {
      this.refreshInventoryList();
    },
  
    onPullDownRefresh() {
      this.refreshInventoryList();
    },
  
    onReachBottom() {
      this.loadMore();
    },
  
    // 加载所有库存数据
    loadAllInventory() {
      const allInventory = this.generateMockInventory(25);
      this.setData({
        allInventory,
        totalCount: allInventory.length
      });
      
      this.refreshInventoryList();
    },
  
    // 生成模拟库存数据
    generateMockInventory(count) {
      const inventory = [];
      const categories = ['护肤', '彩妆', '工具', '仪器', '消耗品'];
      const products = [
        '水氧焕肤精华', '深层清洁面膜', '美白精华液', '补水乳液', '防晒霜',
        '眼霜', '护手霜', '身体乳', '洗发水', '沐浴露',
        '化妆棉', '棉签', '面膜纸', '酒精棉片', '一次性手套',
        '美容仪', '导入仪', '按摩棒', '蒸脸器', '脱毛仪'
      ];
      const stores = ['总店', '分店一', '分店二', '分店三', '旗舰店'];
      const units = ['瓶', '盒', '支', '个', '套', '包'];
      const persons = ['李店长', '王经理', '张美容师', '赵助理', '刘顾问'];
      
      for (let i = 1; i <= count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const store = stores[Math.floor(Math.random() * stores.length)];
        const unit = units[Math.floor(Math.random() * units.length)];
        const quantity = Math.floor(Math.random() * 100) + 1;
        const isLowStock = quantity < 20;
        
        // 随机生成入库出库时间
        const today = new Date();
        const daysAgo = Math.floor(Math.random() * 30);
        const inDate = new Date(today);
        inDate.setDate(inDate.getDate() - daysAgo);
        const outDate = new Date(inDate);
        outDate.setDate(outDate.getDate() + Math.floor(Math.random() * 10));
        
        const lastInPerson = persons[Math.floor(Math.random() * persons.length)];
        const lastOutPerson = persons[Math.floor(Math.random() * persons.length)];
        
        inventory.push({
          id: i,
          name: product,
          category: category,
          storeName: store,
          quantity: quantity,
          unit: unit,
          isLowStock: isLowStock,
          minStock: 20,
          lastInTime: this.formatDate(inDate) + ' ' + this.formatTime(inDate),
          lastInPerson: lastInPerson,
          lastInQuantity: Math.floor(Math.random() * 50) + 10,
          lastOutTime: Math.random() > 0.3 ? this.formatDate(outDate) + ' ' + this.formatTime(outDate) : '',
          lastOutPerson: Math.random() > 0.3 ? lastOutPerson : '',
          lastOutQuantity: Math.random() > 0.3 ? Math.floor(Math.random() * 30) + 5 : 0,
          lastOutPurpose: ['客户使用', '员工使用', '赠送', '报损'][Math.floor(Math.random() * 4)],
          notes: Math.random() > 0.7 ? '请注意保质期' : (Math.random() > 0.5 ? '畅销商品，及时补货' : ''),
          createdTime: '2024-01-01'
        });
      }
      
      return inventory;
    },
  
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
  
    // 格式化时间
    formatTime(date) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    },
  
    // 刷新库存列表
    refreshInventoryList() {
      const { searchKeyword, selectedStoreName, pageSize } = this.data;
      let filteredInventory = [...this.data.allInventory];
      
      // 搜索筛选
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        filteredInventory = filteredInventory.filter(item => 
          item.name.toLowerCase().includes(keyword) || 
          item.category.toLowerCase().includes(keyword)
        );
      }
      
      // 门店筛选
      if (selectedStoreName && selectedStoreName !== '全部店名') {
        filteredInventory = filteredInventory.filter(item => 
          item.storeName === selectedStoreName
        );
      }
      
      // 统计预警数量
      const lowStockCount = filteredInventory.filter(item => item.isLowStock).length;
      
      // 分页处理
      const totalCount = filteredInventory.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const currentPage = 1;
      
      // 获取第一页数据
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const pageData = filteredInventory.slice(startIndex, endIndex);
      
      this.setData({
        inventoryList: pageData,
        totalCount,
        totalPages,
        currentPage,
        lowStockCount,
        hasMore: currentPage < totalPages
      });
      
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    },
  
    // 加载更多
    loadMore() {
      if (this.data.isLoading || !this.data.hasMore) {
        return;
      }
      
      this.setData({ isLoading: true });
      
      const { searchKeyword, selectedStoreName, pageSize, currentPage } = this.data;
      let filteredInventory = [...this.data.allInventory];
      
      // 搜索筛选
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        filteredInventory = filteredInventory.filter(item => 
          item.name.toLowerCase().includes(keyword) || 
          item.category.toLowerCase().includes(keyword)
        );
      }
      
      // 门店筛选
      if (selectedStoreName && selectedStoreName !== '全部店名') {
        filteredInventory = filteredInventory.filter(item => 
          item.storeName === selectedStoreName
        );
      }
      
      const nextPage = currentPage + 1;
      const totalCount = filteredInventory.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // 获取下一页数据
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const nextPageData = filteredInventory.slice(startIndex, endIndex);
      
      // 合并数据
      const mergedData = [...this.data.inventoryList, ...nextPageData];
      
      this.setData({
        inventoryList: mergedData,
        currentPage: nextPage,
        totalPages,
        isLoading: false,
        hasMore: nextPage < totalPages
      });
    },
  
    // 搜索输入
    onSearchInput(e) {
      const value = e.detail.value;
      this.setData({
        searchKeyword: value
      });
    },
  
    // 搜索确认
    onSearchConfirm(e) {
      this.refreshInventoryList();
    },
  
    // 清除搜索
    clearSearch() {
      this.setData({
        searchKeyword: ''
      }, () => {
        this.refreshInventoryList();
      });
    },
  
    // 门店选择变化
    onStoreChange(e) {
      const index = e.detail.value;
      const storeName = this.data.storeOptions[index];
      
      this.setData({
        selectedStoreIndex: index,
        selectedStoreName: storeName === '全部店名' ? '' : storeName
      });
    },
  
    // 显示详情弹窗
    showDetailModal(e) {
      const id = e.currentTarget.dataset.id;
      const detail = this.data.inventoryList.find(item => item.id === parseInt(id));
      
      if (detail) {
        this.setData({
          showDetailModal: true,
          currentDetail: detail
        });
      }
    },
  
    // 隐藏详情弹窗
    hideDetailModal() {
      this.setData({
        showDetailModal: false
      });
    },
  
    // 显示入库弹窗
    showInModal() {
      this.setData({
        inOutType: 'in'
      });
      
      const modal = this.selectComponent('#inOutModal');
      if (modal) {
        modal.showModal();
      }
    },
  
    // 显示出库弹窗
    showOutModal() {
      this.setData({
        inOutType: 'out'
      });
      
      const modal = this.selectComponent('#inOutModal');
      if (modal) {
        modal.showModal();
      }
    },
  
    // 隐藏入库/出库弹窗
    hideInOutModal() {
      const modal = this.selectComponent('#inOutModal');
      if (modal) {
        modal.hideModal();
      }
    },
  
    // 处理入库/出库确认
    handleInOutConfirm(e) {
      const inOutData = e.detail;
      
      wx.showLoading({
        title: '处理中...',
      });
      
      // 模拟API调用
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: inOutData.type === 'in' ? '入库成功' : '出库成功',
          icon: 'success'
        });
        
        // 关闭弹窗
        this.hideDetailModal();
        this.hideInOutModal();
        
        // 重新加载数据
        this.loadAllInventory();
      }, 1500);
    },
  
    // 跳转入库记录
    gotoInRecords() {
      const id = this.data.currentDetail.id;
      wx.navigateTo({
        url: `/pages/inventory/records?type=in&inventoryId=${id}`
      });
    },
  
    // 跳转出库记录
    gotoOutRecords() {
      const id = this.data.currentDetail.id;
      wx.navigateTo({
        url: `/pages/inventory/records?type=out&inventoryId=${id}`
      });
    },
  
    // 删除库存
    deleteInventory(e) {
      const id = e.currentTarget.dataset.id;
      const inventory = this.data.inventoryList.find(item => item.id === parseInt(id));
      
      if (!inventory) return;
      
      wx.showModal({
        title: '确认删除',
        content: `确定要删除商品 "${inventory.name}" 的库存记录吗？`,
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '删除中...' });
            
            setTimeout(() => {
              wx.hideLoading();
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              
              // 重新加载数据
              this.loadAllInventory();
            }, 1000);
          }
        }
      });
    },
  
    // 停止事件冒泡
    stopPropagation(e) {
      // 阻止事件冒泡
    },
  
    // 显示新增商品弹窗
    showAddModal() {
      const modal = this.selectComponent('#addInventoryModal');
      modal.showModal();
    },
  
    // 隐藏新增商品弹窗
    hideAddModal() {
      const modal = this.selectComponent('#addInventoryModal');
      modal.hideModal();
    },
  
    // 处理新增商品
    handleAddInventory(e) {
      const inventoryData = e.detail;
      
      wx.showLoading({
        title: '保存中...',
      });
      
      // 模拟API调用
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '新增成功',
          icon: 'success'
        });
        
        // 重新加载数据
        this.loadAllInventory();
      }, 1500);
    }
  });