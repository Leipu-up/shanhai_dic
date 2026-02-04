// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        // 筛选条件
        startDate: '',
        endDate: '',
        selectedStaffId: '',
        selectedStaffName: '',
        selectedStatus: '',
        selectedStatusName: '',
        staffList: [],
        // 员工选项
        staffOptions: [],
        // 状态选项
        statusOptions: [{
                id: '',
                name: '全部状态'
            },
            {
                id: '全天班',
                name: '在岗'
            },
            {
                id: '休息',
                name: '休息'
            }
        ],
        // 分页数据
        pageSize: 10,
        currentPage: 1,
        total: 0,
        hasMore: true,
        loading: false,
        isRefreshing: false,
        isFirstLoad: true,
        isLoadingData: false, // 防止重复请求的标记

        // 统计信息
        onDutyCount: 0,
        offDutyCount: 0,
        totalAppointments: 0,
        // 排班列表
        scheduleList: [],
        // 选择器索引
        selectedStaffIndex: 0,
        selectedStatusIndex: 0
    },

    onLoad(options) {
        console.log('页面onLoad开始');
        this.initDefaultDates();
        this.loadStaffList();
        // 不在这里直接加载数据
    },

    onReady() {
        console.log('页面onReady');
        // 确保页面准备就绪后再加载数据
        setTimeout(() => {
            this.refreshScheduleList();
        }, 100);
    },

    onShow() {
        // 这里保持为空，避免重复请求
    },

    // 下拉刷新
    onPullDownRefresh() {
        console.log('下拉刷新');
        // 如果正在加载中，则停止刷新
        if (this.data.isLoadingData) {
            wx.stopPullDownRefresh();
            return;
        }
        this.refreshScheduleList();
        // 设置一个超时停止下拉刷新
        setTimeout(() => {
            if (this.data.isRefreshing) {
                wx.stopPullDownRefresh();
            }
        }, 2000);
    },

    // 滑动到底部自动加载
    onReachBottom() {
        console.log('滑动到底部，触发加载更多');
        console.log('当前状态 - loading:', this.data.loading, 'hasMore:', this.data.hasMore, 'isLoadingData:', this.data.isLoadingData);
        if (!this.data.hasMore) {
            console.log('没有更多数据了，不加载');
            return;
        }
        this.setData({
            currentPage: this.data.currentPage + 1,
            loading: true,
            isLoadingData: true
        }, () => {
            console.log('开始加载第', this.data.currentPage, '页');
            this.loadScheduleList();
        });
    },

    // 初始化默认日期
    initDefaultDates() {
        const today = new Date();
        const formattedDate = this.formatDate(today);
        // 设置默认开始日期为今天，结束日期为今天（同一天）
        this.setData({
            startDate: formattedDate,
            endDate: formattedDate
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
        const params = {
            "filter": {
                "status": "在职"
            },
        };
        api.getStaffList(params).then(responseData => {
            const staffList = responseData.data || [];
            let staffOptions = [{
                id: '',
                name: '全部员工'
            }];
            // 获取用户信息
            const userInfo = wx.getStorageSync('userInfo') || {};
            const userLevel = userInfo.level || 0;
            const currentUser = userInfo;

            if (userLevel >= 3) {
                // 店长以上可以看到所有员工
                staffOptions = staffOptions.concat(staffList.map(staff => ({
                    id: staff.id,
                    name: staff.nickname || staff.name,
                    nickname: staff.nickname
                })));
            } else {
                // 普通员工只能看到自己
                if (currentUser && currentUser.id) {
                    staffOptions.push({
                        id: currentUser.id,
                        name: currentUser.nickname || currentUser.name,
                        nickname: currentUser.nickname
                    });
                }
            }

            // 更新索引
            const selectedStaffIndex = staffOptions.findIndex(item => item.id === this.data.selectedStaffId) || 0;

            this.setData({
                staffList,
                staffOptions,
                selectedStaffIndex
            });
        }).catch(error => {
            console.error('加载员工列表失败:', error);
            api.handleApiError(error);
        });
    },

    // 刷新排班列表
    refreshScheduleList() {
        // 如果已经在加载中，则跳过
        if (this.data.isLoadingData) {
            console.log('数据正在加载中，跳过刷新');
            return;
        }
        if (this.data.isFirstLoad) {
            this.setData({
                isFirstLoad: false
            });
        }
        console.log('开始刷新排班列表');
        this.setData({
            currentPage: 1,
            hasMore: true,
            loading: true,
            isRefreshing: true,
            isLoadingData: true,
            scheduleList: [] // 清空列表，重新加载
        }, () => {
            this.loadScheduleList();
        });
    },

    // 加载排班列表
    loadScheduleList() {
        const {
            startDate,
            endDate,
            selectedStaffId,
            selectedStatus,
            currentPage,
            pageSize
        } = this.data;
        // 构建筛选参数
        const params = {
            "filter": {
                "pblx": selectedStatus,
                "jmygb": {
                    "id": selectedStaffId
                }
            },
            "page": {
                "pageNum": currentPage,
                "pageSize": pageSize
            }
        };

        console.log('加载排班列表，页码:', currentPage, '参数:', params);

        // 只在第一页加载或下拉刷新时显示loading
        if ((currentPage === 1 && this.data.isRefreshing) || currentPage === 1) {
            wx.showLoading({
                title: '加载中...'
            });
        }

        // 假设有一个获取排班列表的API
        api.getScheduleList(params).then(responseData => {
            wx.hideLoading();

            const resultData = responseData.data || {};
            const newList = resultData.list || [];
            const total = resultData.total || 0;
            const pageCount = resultData.pageCount || 0;

            console.log('第', currentPage, '页数据加载完成，共', newList.length, '条');
            console.log('总页数:', pageCount, '当前页:', currentPage);

            // 判断是否还有更多数据 - 修复这里！
            const hasMore = currentPage < pageCount;
            console.log('是否有更多数据:', hasMore, '当前页:', currentPage, '总页数:', pageCount);

            // 如果是第一页，替换数据；否则追加数据
            const scheduleList = (currentPage === 1 || this.data.isRefreshing) ?
                newList :
                [...this.data.scheduleList, ...newList];

            // 计算统计信息（注意：这里计算的是当前列表的统计，不是总数据统计）
            // 如果后端没有返回统计信息，前端可以计算当前列表的统计
            const stats = this.calculateStats(scheduleList);

            this.setData({
                scheduleList: scheduleList,
                hasMore: hasMore,
                loading: false,
                isRefreshing: false,
                total: total,
                onDutyCount: stats.onDutyCount,
                offDutyCount: stats.offDutyCount,
                totalAppointments: stats.totalAppointments,
                isLoadingData: false
            }, () => {
                console.log('数据更新完成，当前总数:', scheduleList.length, '，是否还有更多:', hasMore);
                console.log('loading:', this.data.loading, 'isLoadingData:', this.data.isLoadingData);

                // 如果当前页是第一页且没有数据，显示空状态
                if (currentPage === 1 && newList.length === 0) {
                    console.log('第一页无数据，显示空状态');
                }

                // 停止下拉刷新
                if (this.data.isRefreshing) {
                    wx.stopPullDownRefresh();
                }
            });
        }).catch(error => {
            wx.hideLoading();
            console.error('加载排班列表失败:', error);
            this.setData({
                loading: false,
                isRefreshing: false,
                isLoadingData: false
            });

            // 停止下拉刷新
            if (this.data.isRefreshing) {
                wx.stopPullDownRefresh();
            }

            if (error.type === 'empty') {
                // 如果是第一页且无数据，清空列表
                if (this.data.currentPage === 1) {
                    this.setData({
                        scheduleList: [],
                        hasMore: false,
                        onDutyCount: 0,
                        offDutyCount: 0,
                        totalAppointments: 0
                    });
                }
                wx.showToast({
                    title: '暂无数据',
                    icon: 'none',
                    duration: 2000
                });
            } else {
                api.handleApiError(error);
            }
        });
    },

    // 计算统计信息
    calculateStats(scheduleList) {
        let onDutyCount = 0;
        let offDutyCount = 0;
        let totalAppointments = 0;

        // 统计去重员工（因为一个员工可能有多个排班）
        const staffMap = new Map();

        scheduleList.forEach(item => {
            const staffId = item.jmygb?.id;
            const status = item.pblx;
            const appointmentCount = item.appointmentCount || 0;

            // 统计预约总数
            totalAppointments += appointmentCount;

            // 统计员工状态（按员工去重）
            if (staffId) {
                if (!staffMap.has(staffId)) {
                    staffMap.set(staffId, status);
                    if (status === '全天班') {
                        onDutyCount++;
                    } else if (status === '休息') {
                        offDutyCount++;
                    }
                }
            }
        });

        return {
            onDutyCount,
            offDutyCount,
            totalAppointments
        };
    },

    // 日期变化事件
    onStartDateChange(e) {
        const value = e.detail.value;
        this.setData({
            startDate: value
        }, () => {
            // 日期变化后自动查询
            this.refreshScheduleList();
        });
    },

    onEndDateChange(e) {
        const value = e.detail.value;
        this.setData({
            endDate: value
        }, () => {
            // 日期变化后自动查询
            this.refreshScheduleList();
        });
    },

    // 员工选择变化
    onStaffChange(e) {
        const index = e.detail.value;
        const selectedStaff = this.data.staffOptions[index];

        this.setData({
            selectedStaffId: selectedStaff.id,
            selectedStaffName: selectedStaff.name,
            selectedStaffIndex: index
        }, () => {
            // 员工选择后自动查询
            this.refreshScheduleList();
        });
    },

    // 状态选择变化
    onStatusChange(e) {
        const index = e.detail.value;
        const selectedStatus = this.data.statusOptions[index];

        this.setData({
            selectedStatus: selectedStatus.id,
            selectedStatusName: selectedStatus.name,
            selectedStatusIndex: index
        }, () => {
            // 状态选择后自动查询
            this.refreshScheduleList();
        });
    },

    // 重置筛选条件
    resetFilters() {
        const today = new Date();
        const formattedDate = this.formatDate(today);

        this.setData({
            startDate: formattedDate,
            endDate: formattedDate,
            selectedStaffId: '',
            selectedStaffName: '',
            selectedStatus: '',
            selectedStatusName: '',
            selectedStaffIndex: 0,
            selectedStatusIndex: 0
        }, () => {
            this.refreshScheduleList();
        });
    },

    // 编辑排班
    editSchedule(e) {
        e.stopPropagation();
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
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const schedule = this.data.scheduleList.find(item => item.id === parseInt(id));

        if (!schedule) return;

        wx.showModal({
            title: '确认删除',
            content: `确定要删除 ${schedule.jmygb?.nickname || '未知员工'} 在 ${schedule.pbrq || '未知日期'} 的排班吗？`,
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '删除中...'
                    });

                    // 调用API删除排班
                    const params = {
                        id: id
                    };

                    api.deleteSchedule(params).then(() => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '删除成功',
                            icon: 'success'
                        });

                        // 重新加载数据
                        this.refreshScheduleList();
                    }).catch(error => {
                        wx.hideLoading();
                        api.handleApiError(error);
                    });
                }
            }
        });
    },

    // 显示新增排班弹窗
    showAddModal() {
        const modal = this.selectComponent('#scheduleModal');
        modal.showModal();
    },

    // 处理排班确认
    handleScheduleConfirm(e) {
        const scheduleData = e.detail;

        wx.showLoading({
            title: '保存中...',
        });

        // 调用API保存排班
        if (scheduleData.id) {
            // 编辑
            api.updateSchedule(scheduleData).then(() => {
                wx.hideLoading();
                wx.showToast({
                    title: '更新成功',
                    icon: 'success'
                });
                // 重新加载数据
                this.refreshScheduleList();
            }).catch(error => {
                wx.hideLoading();
                api.handleApiError(error);
            });
        } else {
            // 新增
            api.addSchedule(scheduleData).then(() => {
                wx.hideLoading();
                wx.showToast({
                    title: '新增成功',
                    icon: 'success'
                });
                // 重新加载数据
                this.refreshScheduleList();
            }).catch(error => {
                wx.hideLoading();
                api.handleApiError(error);
            });
        }
    },

    // 停止事件冒泡
    stopPropagation(e) {

    }
});