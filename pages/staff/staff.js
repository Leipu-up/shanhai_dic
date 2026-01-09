Page({
    data: {
      searchKeyword: '',
      staffList: [],
      pageSize: 8, // 每页显示8条
      currentPage: 1,
      totalCount: 0,
      totalPages: 0,
      isLoading: false,
      hasMore: true,
      onDutyCount: 0,
      
      // 模拟数据
      allStaff: [],
      
      // 职位选项
      positionOptions: ['美容师', '美甲师', '按摩师', '顾问', '店长', '前台', '助理'],
      
      // 门店选项
      storeOptions: ['总店', '分店一', '分店二', '分店三', '旗舰店']
    },
  
    onLoad(options) {
      this.loadAllStaff();
    },
  
    onShow() {
      this.refreshStaffList();
    },
  
    onPullDownRefresh() {
      this.refreshStaffList();
    },
  
    onReachBottom() {
      this.loadMore();
    },
  
    // 加载所有员工数据
    loadAllStaff() {
      // 生成模拟数据
      const allStaff = this.generateMockStaff(24);
      
      this.setData({
        allStaff,
        totalCount: allStaff.length
      });
      
      this.refreshStaffList();
    },
  
    // 生成模拟员工数据
    generateMockStaff(count) {
      const staffs = [];
      const names = ['李美丽', '王优雅', '张秀英', '赵静怡', '刘佳琪', '陈晓婷', '杨雨婷', '黄梦瑶'];
      const positions = ['美容师', '美甲师', '按摩师', '顾问', '店长', '前台'];
      const stores = ['总店', '分店一', '分店二', '分店三'];
      const statuses = ['在职', '离职'];
      
      for (let i = 1; i <= count; i++) {
        const name = names[Math.floor(Math.random() * names.length)] + (i % 4 + 1);
        const position = positions[Math.floor(Math.random() * positions.length)];
        const storeName = stores[Math.floor(Math.random() * stores.length)];
        const status = Math.random() > 0.2 ? '在职' : '离职';
        const workDuration = status === '在职' 
          ? `${Math.floor(Math.random() * 60) + 1}个月` 
          : '已离职';
        
        const monthlyPerformance = status === '在职'
          ? `¥${(Math.random() * 50000 + 10000).toFixed(0)}`
          : '--';
        
        staffs.push({
          id: i,
          name: name,
          employeeId: `BY${String(i).padStart(4, '0')}`,
          phone: `138${String(Math.floor(Math.random() * 9000) + 1000)}${String(Math.floor(Math.random() * 9000) + 1000)}`,
          position: position,
          storeName: storeName,
          status: status,
          workDuration: workDuration,
          monthlyPerformance: monthlyPerformance,
          avatar: Math.random() > 0.5 ? '/images/default-avatar.png' : '',
          joinDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          email: `${name.toLowerCase().replace(/ /g, '')}@beauty.com`
        });
      }
      
      return staffs;
    },
  
    // 刷新员工列表
    refreshStaffList() {
      const { searchKeyword, pageSize } = this.data;
      let filteredStaff = [...this.data.allStaff];
      
      // 搜索筛选
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        filteredStaff = filteredStaff.filter(staff => 
          staff.name.toLowerCase().includes(keyword) || 
          staff.employeeId.toLowerCase().includes(keyword) ||
          staff.phone.includes(keyword)
        );
      }
      
      // 统计在职人数
      const onDutyCount = filteredStaff.filter(staff => staff.status === '在职').length;
      
      // 分页处理
      const totalCount = filteredStaff.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const currentPage = 1;
      
      // 获取第一页数据
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const pageData = filteredStaff.slice(startIndex, endIndex);
      
      this.setData({
        staffList: pageData,
        totalCount,
        totalPages,
        currentPage,
        onDutyCount,
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
      
      const { searchKeyword, pageSize, currentPage } = this.data;
      let filteredStaff = [...this.data.allStaff];
      
      // 搜索筛选
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        filteredStaff = filteredStaff.filter(staff => 
          staff.name.toLowerCase().includes(keyword) || 
          staff.employeeId.toLowerCase().includes(keyword) ||
          staff.phone.includes(keyword)
        );
      }
      
      const nextPage = currentPage + 1;
      const totalCount = filteredStaff.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // 获取下一页数据
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const nextPageData = filteredStaff.slice(startIndex, endIndex);
      
      // 合并数据
      const mergedData = [...this.data.staffList, ...nextPageData];
      
      this.setData({
        staffList: mergedData,
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
      this.refreshStaffList();
    },
  
    // 清除搜索
    clearSearch() {
      this.setData({
        searchKeyword: ''
      }, () => {
        this.refreshStaffList();
      });
    },
  
    // 查看员工详情
    viewStaffDetail(e) {
      const id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: `/pages/staff/detail?id=${id}`
      });
    },
  
    // 联系员工
    callStaff(e) {
      const phone = e.currentTarget.dataset.phone;
      
      wx.showModal({
        title: '联系员工',
        content: `是否要拨打 ${phone}？`,
        success: (res) => {
          if (res.confirm) {
            wx.makePhoneCall({
              phoneNumber: phone
            });
          }
        }
      });
    },
  
    // 编辑员工
    editStaff(e) {
      const id = e.currentTarget.dataset.id;
      const modal = this.selectComponent('#addStaffModal');
      
      // 查找要编辑的员工
      const staff = this.data.staffList.find(item => item.id === parseInt(id));
      if (staff) {
        modal.showModal(staff);
      }
    },
  
    // 停止事件冒泡
    stopPropagation(e) {
      // 阻止事件冒泡
    },
  
    // 显示新增员工弹窗
    showAddModal() {
      const modal = this.selectComponent('#addStaffModal');
      modal.showModal();
    },
  
    // 隐藏新增员工弹窗
    hideAddModal() {
      const modal = this.selectComponent('#addStaffModal');
      modal.hideModal();
    },
  
    // 处理新增员工
    handleAddStaff(e) {
      const staffData = e.detail;
      
      wx.showLoading({
        title: '保存中...',
      });
      
      // 模拟API调用
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        // 重新加载数据
        this.loadAllStaff();
      }, 1500);
    }
  });