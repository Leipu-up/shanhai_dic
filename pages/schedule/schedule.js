Page({
    data: {
      // 筛选条件
      startDate: '',
      endDate: '',
      selectedStaffId: '',
      selectedStaffName: '',
      selectedStaffIndex: -1,
      selectedStatus: '',
      selectedStatusName: '',
      selectedStatusIndex: -1,
      
      // 员工选项
      staffOptions: [
        { id: '', name: '全部员工' }
      ],
      
      // 状态选项
      statusOptions: [
        { id: '', name: '全部状态' },
        { id: '在岗', name: '在岗' },
        { id: '休息', name: '休息' }
      ],
      
      // 分页数据
      pageSize: 10,
      currentPage: 1,
      totalCount: 0,
      totalPages: 0,
      isLoading: false,
      hasMore: true,
      
      // 统计信息
      onDutyCount: 0,
      offDutyCount: 0,
      totalAppointments: 0,
      
      // 排班列表
      scheduleList: [],
      
      // 员工列表
      staffList: []
    },
  
    onLoad(options) {
      this.initDefaultDates();
      this.loadStaffList();
      this.loadScheduleData();
    },
  
    onShow() {
      this.refreshScheduleList();
    },
  
    onPullDownRefresh() {
      this.refreshScheduleList();
    },
  
    onReachBottom() {
      this.loadMore();
    },
  
    // 初始化默认日期
    initDefaultDates() {
      const today = new Date();
      const formattedDate = this.formatDate(today);
      
      // 设置默认开始日期为今天，结束日期为明天
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedTomorrow = this.formatDate(tomorrow);
      
      this.setData({
        startDate: formattedDate,
        endDate: formattedTomorrow
      });
    },
  
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
  
    // 加载员工列表
    loadStaffList() {
      // 模拟员工数据
      const staffList = [
        { id: 1, name: '李美容师', avatar: '/images/default-avatar.png' },
        { id: 2, name: '王美甲师', avatar: '/images/default-avatar.png' },
        { id: 3, name: '张按摩师', avatar: '/images/default-avatar.png' },
        { id: 4, name: '赵护理师', avatar: '/images/default-avatar.png' },
        { id: 5, name: '陈顾问', avatar: '/images/default-avatar.png' }
      ];
      
      const staffOptions = [{ id: '', name: '全部员工' }, ...staffList];
      
      this.setData({
        staffList,
        staffOptions
      });
    },
  
    // 加载排班数据
    loadScheduleData() {
      const allSchedules = this.generateMockSchedules(35);
      this.refreshScheduleList();
    },
  
    // 生成模拟排班数据
    generateMockSchedules(count) {
      const schedules = [];
      const staffList = this.data.staffList;
      const statuses = ['在岗', '休息'];
      const startDate = new Date(this.data.startDate);
      const endDate = new Date(this.data.endDate);
      
      for (let i = 1; i <= count; i++) {
        const randomStaff = staffList[Math.floor(Math.random() * staffList.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        // 随机生成日期范围内的日期
        const timeDiff = endDate.getTime() - startDate.getTime();
        const randomDays = Math.floor(Math.random() * (timeDiff / (1000 * 3600 * 24) + 1));
        const scheduleDate = new Date(startDate.getTime() + randomDays * 24 * 60 * 60 * 1000);
        const formattedDate = this.formatDate(scheduleDate);
        
        const appointmentCount = randomStatus === '在岗' ? Math.floor(Math.random() * 5) : 0;
        
        schedules.push({
          id: i,
          staffId: randomStaff.id,
          staffName: randomStaff.name,
          staffAvatar: randomStaff.avatar,
          status: randomStatus,
          scheduleDate: formattedDate,
          appointmentCount: appointmentCount,
          scheduleType: randomStatus === '在岗' ? '全天班' : '休息'
        });
      }
      
      return schedules;
    },
  
    // 刷新排班列表
    refreshScheduleList() {
      const allSchedules = this.generateMockSchedules(35);
      const filteredSchedules = this.filterSchedules(allSchedules);
      
      // 统计信息
      const onDutyCount = filteredSchedules.filter(s => s.status === '在岗').length;
      const offDutyCount = filteredSchedules.filter(s => s.status === '休息').length;
      const totalAppointments = filteredSchedules.reduce((sum, s) => sum + s.appointmentCount, 0);
      
      // 分页处理
      const { pageSize } = this.data;
      const totalCount = filteredSchedules.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const currentPage = 1;
      
      // 获取第一页数据
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const pageData = filteredSchedules.slice(startIndex, endIndex);
      
      this.setData({
        scheduleList: pageData,
        totalCount,
        totalPages,
        currentPage,
        onDutyCount,
        offDutyCount,
        totalAppointments,
        hasMore: currentPage < totalPages
      });
      
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    },
  
    // 筛选排班
    filterSchedules(schedules) {
      let filtered = [...schedules];
      
      // 日期范围筛选
      const { startDate, endDate } = this.data;
      if (startDate && endDate) {
        filtered = filtered.filter(item => {
          const scheduleDate = item.scheduleDate;
          return scheduleDate >= startDate && scheduleDate <= endDate;
        });
      }
      
      // 员工筛选
      const { selectedStaffId } = this.data;
      if (selectedStaffId) {
        filtered = filtered.filter(item => item.staffId === selectedStaffId);
      }
      
      // 状态筛选
      const { selectedStatus } = this.data;
      if (selectedStatus) {
        filtered = filtered.filter(item => item.status === selectedStatus);
      }
      
      // 按日期排序
      filtered.sort((a, b) => new Date(a.scheduleDate) - new Date(b.scheduleDate));
      
      return filtered;
    },
  
    // 加载更多
    loadMore() {
      if (this.data.isLoading || !this.data.hasMore) {
        return;
      }
      
      this.setData({ isLoading: true });
      
      const allSchedules = this.generateMockSchedules(35);
      const filteredSchedules = this.filterSchedules(allSchedules);
      
      const { pageSize, currentPage } = this.data;
      const nextPage = currentPage + 1;
      const totalCount = filteredSchedules.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // 获取下一页数据
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalCount);
      const nextPageData = filteredSchedules.slice(startIndex, endIndex);
      
      // 合并数据
      const mergedData = [...this.data.scheduleList, ...nextPageData];
      
      this.setData({
        scheduleList: mergedData,
        currentPage: nextPage,
        totalPages,
        isLoading: false,
        hasMore: nextPage < totalPages
      });
    },
  
    // 日期变化事件
    onStartDateChange(e) {
      const value = e.detail.value;
      this.setData({
        startDate: value
      });
    },
  
    onEndDateChange(e) {
      const value = e.detail.value;
      this.setData({
        endDate: value
      });
    },
  
    // 员工选择变化
    onStaffChange(e) {
      const index = e.detail.value;
      const selectedStaff = this.data.staffOptions[index];
      
      this.setData({
        selectedStaffIndex: index,
        selectedStaffId: selectedStaff.id,
        selectedStaffName: selectedStaff.name
      });
    },
  
    // 状态选择变化
    onStatusChange(e) {
      const index = e.detail.value;
      const selectedStatus = this.data.statusOptions[index];
      
      this.setData({
        selectedStatusIndex: index,
        selectedStatus: selectedStatus.id,
        selectedStatusName: selectedStatus.name
      });
    },
  
    // 查询排班
    searchSchedules() {
      this.setData({
        currentPage: 1,
        hasMore: true
      });
      this.refreshScheduleList();
    },
  
    // 重置筛选条件
    resetFilters() {
      const today = new Date();
      const formattedDate = this.formatDate(today);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formattedTomorrow = this.formatDate(tomorrow);
      
      this.setData({
        startDate: formattedDate,
        endDate: formattedTomorrow,
        selectedStaffIndex: 0,
        selectedStaffId: '',
        selectedStaffName: '',
        selectedStatusIndex: 0,
        selectedStatus: '',
        selectedStatusName: '',
        currentPage: 1,
        hasMore: true
      }, () => {
        this.refreshScheduleList();
      });
    },
  
    // 编辑排班
    editSchedule(e) {
      const id = e.currentTarget.dataset.id;
      const modal = this.selectComponent('#scheduleModal');
      
      // 查找要编辑的排班
      const schedule = this.data.scheduleList.find(item => item.id === parseInt(id));
      if (schedule) {
        modal.showModal(schedule);
      }
    },
  
    // 删除排班
    deleteSchedule(e) {
      const id = e.currentTarget.dataset.id;
      const schedule = this.data.scheduleList.find(item => item.id === parseInt(id));
      
      if (!schedule) return;
      
      wx.showModal({
        title: '确认删除',
        content: `确定要删除 ${schedule.staffName} 在 ${schedule.scheduleDate} 的排班吗？`,
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
              this.refreshScheduleList();
            }, 1000);
          }
        }
      });
    },
  
    // 显示新增排班弹窗
    showAddModal() {
      const modal = this.selectComponent('#scheduleModal');
      modal.showModal();
    },
  
    // 隐藏排班弹窗
    hideScheduleModal() {
      const modal = this.selectComponent('#scheduleModal');
      modal.hideModal();
    },
  
    // 处理排班确认
    handleScheduleConfirm(e) {
      const scheduleData = e.detail;
      
      wx.showLoading({
        title: '保存中...',
      });
      
      // 模拟API调用
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: scheduleData.isEdit ? '更新成功' : '新增成功',
          icon: 'success'
        });
        
        // 重新加载数据
        this.refreshScheduleList();
      }, 1500);
    }
  });