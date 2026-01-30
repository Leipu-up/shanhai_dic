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
        // 列表数据
        customerList: [],
        // 分页数据
        pageSize: 10,
        currentPage: 1,
        hasMore: true,
        loading: false,
        isRefreshing: false,
        total: 0,
        pageCount: 0,
        isFirstLoad: true,
        isLoadingData: false, // 新增：防止重复请求标记
        // 详情弹窗相关
        showDetailModal: false,
        currentDetail: {},
        // 员工选项
        staffOptions: [{
            id: '',
            name: '全部员工'
        }],
        // 状态选项
        statusOptions: [{
                id: '',
                name: '全部状态'
            },
            {
                id: 'pending',
                name: '待服务'
            },
            {
                id: 'in_progress',
                name: '服务中'
            },
            {
                id: 'completed',
                name: '已服务'
            },
            {
                id: 'cancelled',
                name: '已取消'
            },
            {
                id: 'timeout',
                name: '已超时'
            }
        ],
        staffList: [],
        serviceOptions: []
    },

    onLoad: function (options) {
        console.log('页面onLoad开始');
        this.loadUserInfo();
        this.initDefaultDates();
        this.initSelectList();
        // 不在这里直接加载数据，等待异步操作完成
    },

    onReady: function () {
        console.log('页面onReady');
        // 确保所有异步初始化完成后再加载数据
        setTimeout(() => {
            this.refreshCustomerList();
        }, 100);
    },

    onShow: function () {
        // 如果是从其他页面返回，可以刷新数据
        // 这里保持为空，避免重复请求
    },

    // 加载用户信息
    loadUserInfo: function () {
        try {
            const userInfo = wx.getStorageSync('userInfo') || {};
            this.setData({
                userLevel: userInfo.level || 0,
                currentUser: userInfo
            });
        } catch (error) {
            console.error('加载用户信息失败:', error);
        }
    },

    // 初始化默认日期（今天）
    initDefaultDates: function () {
        const today = new Date();
        const formattedDate = this.formatDate(today);
        this.setData({
            startDate: formattedDate,
            endDate: formattedDate
        });
    },

    // 格式化日期为 YYYY-MM-DD
    formatDate: function (date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // 加载员工,服务下拉列表
    initSelectList: function () {
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
            if (this.data.userLevel >= 3) {
                // 店长以上可以看到所有员工
                staffOptions = staffOptions.concat(staffList.map(staff => ({
                    id: staff.id,
                    name: staff.nickname
                })));
            } else {
                // 普通员工只能看到自己
                const currentUser = this.data.currentUser;
                if (currentUser && currentUser.id) {
                    staffOptions.push({
                        id: currentUser.id,
                        name: currentUser.nickname
                    });
                }
            }
            this.setData({
                staffList,
                staffOptions
            });
            console.log(staffList);
            console.log(staffOptions);
        }).catch(error => {
            console.error('加载员工列表失败:', error);
            api.handleApiError(error);
        });
        api.getServiceListAll(params).then(responseData => {
            const serviceList = responseData.data || [];
            let serviceOptions = [];
            serviceOptions = serviceOptions.concat(serviceList.map(service => ({
                id: service.id,
                name: service.fwmc
            })));
            this.setData({
                serviceOptions
            });
        }).catch(error => {
            console.error('加载员工列表失败:', error);
            api.handleApiError(error);
        });
    },

    // 刷新客户列表
    refreshCustomerList: function () {
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
        console.log('开始刷新客户列表');
        this.setData({
            currentPage: 1,
            hasMore: true,
            loading: true,
            isRefreshing: true,
            isLoadingData: true
        }, () => {
            this.loadCustomerList();
        });
    },
    // 加载客户列表
    loadCustomerList: function () {
        // 如果已经在加载中，则直接返回
        if (this.data.isLoadingData && this.data.currentPage !== 1) {
            console.log('已经在加载中，跳过重复请求');
            return;
        }
        const {
            startDate,
            endDate,
            selectedStaffId,
            selectedStatusName,
            currentPage,
            pageSize
        } = this.data;
        // 构建分页参数
        const params = {
            "filter": {
                startDate: startDate,
                endDate: endDate,
                zt: selectedStatusName,
                jmygb: {
                    id: selectedStaffId
                }
            },
            "page": {
                "pageNum": currentPage,
                "pageSize": pageSize
            }
        };
        console.log('加载预约列表，页码:', currentPage, '参数:', params);
        // 只在第一次加载或下拉刷新时显示loading
        if (this.data.currentPage === 1 && this.data.isRefreshing) {
            wx.showLoading({
                title: '加载中...'
            });
        }
        api.getReservationList(params).then(responseData => {
            wx.hideLoading();
            const mockData = responseData.data;
            const newList = mockData.list || [];
            const total = mockData.total || 0;
            const pageCount = mockData.pageCount || 0;
            console.log('第', currentPage, '页数据加载完成，共', newList.length, '条');
            console.log('总页数:', pageCount, '当前页:', currentPage);
            // 判断是否还有更多数据
            const hasMore = currentPage < pageCount && newList.length > 0;
            // 如果是第一页，替换数据；否则追加数据
            const customerList = currentPage === 1 ? newList : [...this.data.customerList, ...newList];
            this.setData({
                customerList: customerList,
                hasMore: hasMore,
                loading: false,
                isRefreshing: false,
                total: total,
                pageCount: pageCount,
                isLoadingData: false
            }, () => {
                console.log('数据更新完成，当前总数:', customerList.length, '，是否还有更多:', hasMore);
            });
        }).catch(error => {
            wx.hideLoading();
            console.error('加载预约列表失败:', error);
            this.setData({
                loading: false,
                isRefreshing: false,
                isLoadingData: false
            });
            if (error.type === 'empty') {
                // 如果是第一页且无数据，清空列表
                if (this.data.currentPage === 1) {
                    this.setData({
                        customerList: [],
                        hasMore: false
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

    // 滑动到底部自动加载
    onReachBottom: function () {
        console.log('滑动到底部，触发加载更多');
        console.log('当前状态 - loading:', this.data.loading, 'hasMore:', this.data.hasMore, 'isLoadingData:', this.data.isLoadingData);
        if (this.data.loading || this.data.isLoadingData) {
            console.log('正在加载中，跳过');
            return;
        }
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
            this.loadCustomerList();
        });
    },

    // 下拉刷新
    onPullDownRefresh: function () {
        console.log('下拉刷新');
        // 如果正在加载中，则停止刷新
        if (this.data.isLoadingData) {
            wx.stopPullDownRefresh();
            return;
        }
        this.refreshCustomerList();
        // 设置一个超时停止下拉刷新
        setTimeout(() => {
            if (this.data.isRefreshing) {
                wx.stopPullDownRefresh();
            }
        }, 2000);
    },

    onSearch: function () {
        this.refreshCustomerList();
    },

    onSearchConfirm: function () {
        this.onSearch();
    },

    // 日期变化事件
    onStartDateChange: function (e) {
        const value = e.detail.value;
        this.setData({
            startDate: value
        });
    },

    onEndDateChange: function (e) {
        const value = e.detail.value;
        this.setData({
            endDate: value
        });
    },

    // 员工选择变化
    onStaffChange: function (e) {
        const index = e.detail.value;
        const selectedStaff = this.data.staffOptions[index];
        this.setData({
            selectedStaffId: selectedStaff.id,
            selectedStaffName: selectedStaff.name
        });
    },

    // 状态选择变化
    onStatusChange: function (e) {
        const index = e.detail.value;
        const selectedStatus = this.data.statusOptions[index];
        this.setData({
            selectedStatus: selectedStatus.id,
            selectedStatusName: selectedStatus.name
        });
    },

    // 重置筛选条件
    resetFilters: function () {
        const today = new Date();
        const formattedDate = this.formatDate(today);
        this.setData({
            startDate: formattedDate,
            endDate: formattedDate,
            selectedStaffId: '',
            selectedStaffName: '',
            selectedStatus: '',
            selectedStatusName: ''
        });
    },

    // 显示详情弹窗
    showDetailModal: function (e) {
        const index = e.currentTarget.dataset.index;
        const detail = this.data.customerList[index];
        this.setData({
            showDetailModal: true,
            currentDetail: detail,
        });
    },

    // 隐藏详情弹窗
    hideDetailModal: function () {
        this.setData({
            showDetailModal: false
        });
    },

    // 编辑当前预约
    editCurrentAppointment: function () {
        this.hideDetailModal();
        const modal = this.selectComponent('#addAppointmentModal');
        if (modal && this.data.currentDetail) {
            modal.showModal(this.data.currentDetail);
        }
    },

    // 取消当前预约
    cancelCurrentAppointment: function () {
        const that = this;
        wx.showModal({
            title: '确认取消',
            content: `确定要取消 ${this.data.currentDetail.jmfwb.fwmc} 的预约吗？`,
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '处理中...'
                    });
                    const params = {
                        id: that.data.currentDetail.id,
                        zt: '已取消'
                    };
                    api.updateReservation(params).then(() => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '已取消',
                            icon: 'success'
                        });
                        // 关闭弹窗并刷新数据
                        that.hideDetailModal();
                        that.refreshCustomerList();
                    }).catch(error => {
                        wx.hideLoading();
                        api.handleApiError(error);
                    });
                }
            }
        });
    },

    // 完成当前预约
    completeCurrentAppointment: function () {
        const that = this;
        wx.showModal({
            title: '确认完成',
            content: `确定要标记 ${this.data.currentDetail.jmfwb.fwmc} 的预约为服务中吗？`,
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '处理中...'
                    });
                    const params = {
                        id: that.data.currentDetail.id,
                        zt: '服务中'
                    };
                    api.updateReservation(params).then(() => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '已完成',
                            icon: 'success'
                        });
                        // 关闭弹窗并刷新数据
                        that.hideDetailModal();
                        that.refreshCustomerList();
                    }).catch(error => {
                        wx.hideLoading();
                        api.handleApiError(error);
                    });
                }
            }
        });
    },

    // 查看客户详情
    viewCustomerDetail: function (e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/customer/detail?id=${id}`
        });
    },

    // 编辑预约
    editAppointment: function (e) {
        const id = e.currentTarget.dataset.id;
        const modal = this.selectComponent('#addAppointmentModal');
        // 查找要编辑的预约
        const appointment = this.data.customerList.find(item => item.id === parseInt(id));
        if (appointment) {
            modal.showModal(appointment);
        } else {
            wx.showToast({
                title: '未找到预约信息',
                icon: 'none'
            });
        }
    },

    // 取消预约
    cancelAppointment: function (e) {
        const id = e.currentTarget.dataset.id;
        const that = this;
        wx.showModal({
            title: '确认取消',
            content: '确定要取消这个预约吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '处理中...'
                    });
                    const params = {
                        id: id,
                        zt: '已取消'
                    };
                    api.updateReservation(params).then(() => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '已取消',
                            icon: 'success'
                        });
                        // 关闭弹窗并刷新数据
                        that.hideDetailModal();
                        that.refreshCustomerList();
                    }).catch(error => {
                        wx.hideLoading();
                        api.handleApiError(error);
                    });
                }
            }
        });
    },

    // 完成预约
    completeAppointment: function (e) {
        const that = this;
        wx.showModal({
            title: '确认完成',
            content: '确定要标记这个预约为已服务吗？',
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '处理中...'
                    });
                    const params = {
                        id: that.data.currentDetail.id,
                        zt: '已服务'
                    };
                    api.updateReservation(params).then(() => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '已完成',
                            icon: 'success'
                        });
                        // 关闭弹窗并刷新数据
                        that.hideDetailModal();
                        that.refreshCustomerList();
                    }).catch(error => {
                        wx.hideLoading();
                        api.handleApiError(error);
                    });
                }
            }
        });
    },

    // 显示新增预约弹窗
    showAddModal: function () {
        const modal = this.selectComponent('#addAppointmentModal');
        if (modal) {
            modal.showModal();
        } else {
            wx.showToast({
                title: '弹窗组件加载失败',
                icon: 'none'
            });
        }
    },

    // 处理新增预约
    handleAddAppointment: function (e) {
        const appointmentData = e.detail;
        wx.showLoading({
            title: '保存中...',
        });
        if (appointmentData.id) {
            // 调用API保存预约
            api.updateReservation(appointmentData).then(() => {
                wx.hideLoading();
                wx.showToast({
                    title: '编辑成功',
                    icon: 'success'
                });
                // 重新加载列表
                this.refreshCustomerList();
            }).catch(error => {
                wx.hideLoading();
                api.handleApiError(error);
            });
        } else {
            // 调用API保存预约
            api.addReservation(appointmentData).then(() => {
                wx.hideLoading();
                wx.showToast({
                    title: '预约成功',
                    icon: 'success'
                });
                // 重新加载列表
                this.refreshCustomerList();
            }).catch(error => {
                wx.hideLoading();
                api.handleApiError(error);
            });
        }
    },

    // 停止事件冒泡
    stopPropagation: function (e) {
        // 阻止事件冒泡
    },
});