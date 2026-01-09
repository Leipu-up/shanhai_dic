Page({
    data: {
        userRole: 'staff',
        // 筛选条件
        startDate: '',
        endDate: '',
        selectedStaffId: '',
        selectedStaffName: '',
        selectedStaffIndex: -1,
        selectedStatus: '',
        selectedStatusName: '',
        selectedStatusIndex: -1,

        // 分页数据
        pageSize: 10, // 每页显示条数
        currentPage: 1, // 当前页码
        totalCount: 0, // 总记录数
        totalPages: 0, // 总页数
        isLoading: false, // 是否正在加载
        hasMore: true, // 是否有更多数据
        // 详情弹窗相关
        showDetailModal: false,
        currentDetail: {},
        currentDetailIndex: -1,
        // 原始数据
        allCustomers: [], // 所有客户数据
        customerList: [], // 当前页显示的数据

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
                id: 'confirmed',
                name: '已确认'
            },
            {
                id: 'in_progress',
                name: '服务中'
            },
            {
                id: 'completed',
                name: '已完成'
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
        serviceOptions: [{
                id: 1,
                name: '水氧焕肤',
                duration: 60
            },
            {
                id: 2,
                name: '深层清洁',
                duration: 90
            },
            {
                id: 3,
                name: '大白肌护理',
                duration: 120
            },
            {
                id: 4,
                name: '眼部护理',
                duration: 60
            },
            {
                id: 5,
                name: '颈部护理',
                duration: 60
            },
            {
                id: 6,
                name: '全身SPA',
                duration: 120
            },
            {
                id: 7,
                name: '美甲服务',
                duration: 90
            },
            {
                id: 8,
                name: '美睫服务',
                duration: 120
            }
        ]
    },

    onLoad(options) {
        this.loadUserInfo();
        this.initDefaultDates();
        this.loadStaffList();
        this.loadAllCustomers(); // 改为加载所有数据
    },

    onShow() {
        // 刷新数据
        this.setData({
            currentPage: 1,
            hasMore: true
        });
        this.loadAllCustomers();
    },

    // 监听页面滚动到底部
    onReachBottom() {
        this.loadMore();
    },

    loadUserInfo() {
        const userInfo = wx.getStorageSync('userInfo') || {};
        this.setData({
            userRole: userInfo.role || 'staff',
            currentUser: userInfo
        });
    },
    // 显示详情弹窗
    showDetailModal(e) {
        const index = e.currentTarget.dataset.index;
        const detail = this.data.customerList[index];

        this.setData({
            showDetailModal: true,
            currentDetail: detail,
            currentDetailIndex: index
        });
    },

    // 隐藏详情弹窗
    hideDetailModal() {
        this.setData({
            showDetailModal: false
        });
    },

    // 编辑当前预约
    editCurrentAppointment() {
        this.hideDetailModal();

        const modal = this.selectComponent('#addAppointmentModal');
        if (modal && this.data.currentDetail) {
            modal.showModal(this.data.currentDetail);
        }
    },

    // 取消当前预约
    cancelCurrentAppointment() {
        wx.showModal({
            title: '确认取消',
            content: `确定要取消 ${this.data.currentDetail.name} 的预约吗？`,
            success: (res) => {
                if (res.confirm) {
                    // 模拟API调用
                    wx.showLoading({
                        title: '处理中...'
                    });

                    setTimeout(() => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '已取消',
                            icon: 'success'
                        });

                        // 关闭弹窗
                        this.hideDetailModal();

                        // 重新加载数据
                        this.loadAllCustomers();
                    }, 1000);
                }
            }
        });
    },

    // 完成当前预约
    completeCurrentAppointment() {
        wx.showModal({
            title: '确认完成',
            content: `确定要标记 ${this.data.currentDetail.name} 的预约为已完成吗？`,
            success: (res) => {
                if (res.confirm) {
                    // 模拟API调用
                    wx.showLoading({
                        title: '处理中...'
                    });

                    setTimeout(() => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '已完成',
                            icon: 'success'
                        });

                        // 关闭弹窗
                        this.hideDetailModal();

                        // 重新加载数据
                        this.loadAllCustomers();
                    }, 1000);
                }
            }
        });
    },
    // 初始化默认日期（今天）
    initDefaultDates() {
        const today = new Date();
        const formattedDate = this.formatDate(today);

        this.setData({
            startDate: formattedDate,
            endDate: formattedDate
        });
    },

    // 格式化日期为 YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    loadStaffList() {
        // 模拟员工数据
        const staffList = [{
                id: 1,
                name: '李美容师',
                phone: '13800138001'
            },
            {
                id: 2,
                name: '王美甲师',
                phone: '13800138002'
            },
            {
                id: 3,
                name: '张按摩师',
                phone: '13800138003'
            },
            {
                id: 4,
                name: '赵护理师',
                phone: '13800138004'
            },
            {
                id: 5,
                name: '陈顾问',
                phone: '13800138005'
            }
        ];

        // 如果是普通员工，只能看到自己
        let staffOptions = [{
            id: '',
            name: '全部员工'
        }];

        if (this.data.userRole === 'admin') {
            // 管理员可以看到所有员工
            staffOptions = staffOptions.concat(staffList);
        } else {
            // 普通员工只能看到自己
            const currentUser = this.data.currentUser;
            if (currentUser && currentUser.id) {
                staffOptions = [{
                    id: '',
                    name: '全部员工'
                }, currentUser];
            }
        }

        this.setData({
            staffList,
            staffOptions
        });
    },

    // 加载所有客户数据（模拟）
    loadAllCustomers() {
        // 模拟更多的客户数据
        const allCustomers = this.generateMockCustomers(35); // 生成35条模拟数据

        // 初始加载第一页
        const filteredCustomers = this.filterCustomers(allCustomers);
        const paginatedData = this.paginateData(filteredCustomers, 1);

        this.setData({
            allCustomers,
            customerList: paginatedData.data,
            totalCount: filteredCustomers.length,
            totalPages: paginatedData.totalPages,
            currentPage: 1,
            hasMore: paginatedData.hasMore
        });
    },

    // 生成模拟数据
    generateMockCustomers(count) {
        const customers = [];
        const staffs = ['李美容师', '王美甲师', '张按摩师', '赵护理师', '陈顾问'];
        const services = ['水氧焕肤', '深层清洁', '大白肌护理', '眼部护理', '颈部护理', '全身SPA', '美甲服务', '美睫服务'];
        const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'timeout'];
        const statusTexts = ['待服务', '已确认', '服务中', '已完成', '已取消', '已超时'];
        const phones = ['138', '139', '136', '137', '135', '186', '188', '189'];

        // 生成过去15天到未来15天的日期
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 15);

        for (let i = 1; i <= count; i++) {
            const randomDays = Math.floor(Math.random() * 31) - 15; // -15 到 15
            const appointmentDate = new Date(startDate);
            appointmentDate.setDate(startDate.getDate() + randomDays);
            const formattedDate = this.formatDate(appointmentDate);

            // 生成随机时间
            const hour = Math.floor(Math.random() * 8) + 9; // 9-17点
            const minute = Math.random() > 0.5 ? '00' : '30';
            const duration = [60, 90, 120][Math.floor(Math.random() * 3)];
            const endHour = hour + Math.floor(duration / 60);
            const appointmentTime = `${hour.toString().padStart(2, '0')}:${minute}-${endHour.toString().padStart(2, '0')}:${minute}`;

            const statusIndex = Math.floor(Math.random() * statuses.length);

            customers.push({
                id: i,
                name: `客户${String(i).padStart(3, '0')}`,
                phone: `${phones[Math.floor(Math.random() * phones.length)]}****${String(Math.floor(Math.random() * 9000) + 1000)}`,
                appointmentDate: formattedDate,
                appointmentTime: appointmentTime,
                service: services[Math.floor(Math.random() * services.length)],
                duration: duration,
                staffId: Math.floor(Math.random() * 5) + 1,
                staffName: staffs[Math.floor(Math.random() * staffs.length)],
                status: statuses[statusIndex],
                statusText: statusTexts[statusIndex],
                notes: i % 3 === 0 ? '有特殊要求，请注意' : (i % 5 === 0 ? 'VIP客户，优先安排' : '')
            });
        }

        // 按日期排序
        customers.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

        return customers;
    },

    // 根据筛选条件过滤客户
    filterCustomers(allCustomers) {
        let filtered = [...allCustomers];

        // 日期范围筛选
        const {
            startDate,
            endDate
        } = this.data;
        if (startDate && endDate) {
            filtered = filtered.filter(item => {
                const appointmentDate = item.appointmentDate;
                return appointmentDate >= startDate && appointmentDate <= endDate;
            });
        }

        // 员工筛选
        const {
            selectedStaffId
        } = this.data;
        if (selectedStaffId) {
            filtered = filtered.filter(item => item.staffId === selectedStaffId);
        }

        // 状态筛选
        const {
            selectedStatus
        } = this.data;
        if (selectedStatus) {
            filtered = filtered.filter(item => item.status === selectedStatus);
        }

        return filtered;
    },

    // 分页处理
    paginateData(data, page) {
        const {
            pageSize
        } = this.data;
        const totalCount = data.length;
        const totalPages = Math.ceil(totalCount / pageSize);

        // 计算起始索引
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalCount);

        // 获取当前页数据
        const pageData = data.slice(startIndex, endIndex);

        return {
            data: pageData,
            totalCount,
            totalPages,
            currentPage: page,
            hasMore: page < totalPages
        };
    },

    // 加载更多数据
    loadMore() {
        if (this.data.isLoading || !this.data.hasMore) {
            return;
        }

        this.setData({
            isLoading: true
        });

        // 模拟网络延迟
        setTimeout(() => {
            const filteredCustomers = this.filterCustomers(this.data.allCustomers);
            const nextPage = this.data.currentPage + 1;
            const paginatedData = this.paginateData(filteredCustomers, nextPage);

            // 合并数据
            const mergedData = [...this.data.customerList, ...paginatedData.data];

            this.setData({
                customerList: mergedData,
                totalCount: paginatedData.totalCount,
                totalPages: paginatedData.totalPages,
                currentPage: nextPage,
                hasMore: paginatedData.hasMore,
                isLoading: false
            });
        }, 500);
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

    // 查询按钮点击事件
    searchAppointments() {
        this.setData({
            currentPage: 1,
            hasMore: true
        });
        this.loadCustomerListByFilter();
    },

    // 根据筛选条件加载客户列表
    loadCustomerListByFilter() {
        const filteredCustomers = this.filterCustomers(this.data.allCustomers);
        const paginatedData = this.paginateData(filteredCustomers, 1);

        this.setData({
            customerList: paginatedData.data,
            totalCount: filteredCustomers.length,
            totalPages: paginatedData.totalPages,
            currentPage: 1,
            hasMore: paginatedData.hasMore
        });
    },

    // 重置筛选条件
    resetFilters() {
        const today = new Date();
        const formattedDate = this.formatDate(today);

        this.setData({
            startDate: formattedDate,
            endDate: formattedDate,
            selectedStaffIndex: 0,
            selectedStaffId: '',
            selectedStaffName: '',
            selectedStatusIndex: 0,
            selectedStatus: '',
            selectedStatusName: '',
            currentPage: 1,
            hasMore: true
        }, () => {
            this.loadCustomerListByFilter();
        });
    },

    // 查看客户详情
    viewCustomerDetail(e) {
        const id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/customer/detail?id=${id}`
        });
    },

    // 停止事件冒泡
    stopPropagation(e) {
        // 阻止事件冒泡
    },

    // 编辑预约
    editAppointment(e) {
        const id = e.currentTarget.dataset.id;
        const modal = this.selectComponent('#addAppointmentModal');

        // 查找要编辑的预约
        const appointment = this.data.customerList.find(item => item.id === parseInt(id));
        if (appointment) {
            modal.showModal(appointment);
        }
    },

    // 取消预约
    cancelAppointment(e) {
        const id = e.currentTarget.dataset.id;

        wx.showModal({
            title: '确认取消',
            content: '确定要取消这个预约吗？',
            success: (res) => {
                if (res.confirm) {
                    // 这里应该调用API取消预约
                    wx.showToast({
                        title: '已取消',
                        icon: 'success'
                    });

                    // 重新加载列表
                    setTimeout(() => {
                        this.loadAllCustomers();
                    }, 1000);
                }
            }
        });
    },

    // 完成预约
    completeAppointment(e) {
        const id = e.currentTarget.dataset.id;

        wx.showModal({
            title: '确认完成',
            content: '确定要标记这个预约为已完成吗？',
            success: (res) => {
                if (res.confirm) {
                    // 这里应该调用API完成预约
                    wx.showToast({
                        title: '已完成',
                        icon: 'success'
                    });

                    // 重新加载列表
                    setTimeout(() => {
                        this.loadAllCustomers();
                    }, 1000);
                }
            }
        });
    },

    // 显示新增预约弹窗
    showAddModal() {
        const modal = this.selectComponent('#addAppointmentModal');
        modal.showModal();
    },

    // 隐藏新增预约弹窗
    hideAddModal() {
        const modal = this.selectComponent('#addAppointmentModal');
        modal.hideModal();
    },

    // 处理新增预约
    handleAddAppointment(e) {
        const appointmentData = e.detail;

        wx.showLoading({
            title: '保存中...',
        });

        // 模拟API调用
        setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
                title: '预约成功',
                icon: 'success'
            });

            // 重新加载列表
            this.loadAllCustomers();
        }, 1500);
    }
});