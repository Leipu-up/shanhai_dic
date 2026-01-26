// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        searchKeyword: '',
        staffList: [],
        pageSize: 10, // 每页显示10条
        currentPage: 1,
        totalCount: 0,
        totalPages: 0,
        isLoading: false,
        hasMore: true,
        onDutyCount: 0,
        // 全部数据,前端分页
        allStaff: [],
        // 职位选项
        positionOptions: ['管理员', '店长', '前台', '美容师', '学徒'],
        // 门店选项
        storeOptions: ['MLife', 'YOLO']
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
        // 构建参数
        const params = {
            "filter": {
                "nickname": this.data.searchValue
            },
        }
        // 调取后台api获得数据
        api.getStaffList(params).then(responseData => {
            wx.hideLoading();
            const staffData = responseData.data;
            const allStaff = [];
            if (staffData.length > 0) {
                for (let i = 0; i < staffData.length; i++) {
                    const id = staffData[i].id;
                    const employeeId = staffData[i].employeeNo;
                    const avatar = staffData[i].avatar || '/images/default-avatar.png';
                    const sfzh = staffData[i].sfzh;
                    const level = staffData[i].level;
                    const phone = staffData[i].sjh;
                    const nickname = staffData[i].nickname;
                    const name = staffData[i].name;
                    const nameView = nickname + '(' + name + ')'
                    const position = staffData[i].rolename;
                    const storeName = staffData[i].jmsdbName;
                    const status = staffData[i].status;
                    const joinDate = staffData[i].joinDate;
                    const notes = staffData[i].bz || '';
                    const yuefen = this.calculateWorkDuration(joinDate, status);
                    const workDuration = status === '在职' ? yuefen : '已离职';
                    const monthlyPerformance = '--';
                    allStaff.push({
                        id: id,
                        name: name,
                        nameView: nameView,
                        sfzh: sfzh,
                        phone: phone,
                        employeeId: employeeId,
                        nickname: nickname,
                        position: position,
                        storeName: storeName,
                        status: status,
                        workDuration: workDuration,
                        monthlyPerformance: monthlyPerformance,
                        avatar: avatar,
                        notes: notes,
                        isView: false,
                        joinDate: joinDate
                    });
                }
            }
            this.setData({
                allStaff: allStaff,
                totalCount: staffData.length
            });
            this.refreshStaffList();
        }).catch(error => {
            wx.hideLoading();
            if (error.type === 'empty') {
                wx.showToast({
                    title: '数据不存在!',
                    icon: 'none',
                    duration: 3000
                });
            } else {
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            }
        });
    },
    // 计算在职时长
    calculateWorkDuration(joinDate, status) {
        if (!joinDate || status === '离职') return '已离职';
        const join = new Date(joinDate);
        const today = new Date();
        const months = (today.getFullYear() - join.getFullYear()) * 12 + (today.getMonth() - join.getMonth());
        if (months <= 0) return '1个月';
        return `${months}个月`;
    },
    // 刷新员工列表
    refreshStaffList() {
        const {
            searchKeyword,
            pageSize
        } = this.data;
        let filteredStaff = [...this.data.allStaff];
        // 搜索筛选
        if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            filteredStaff = filteredStaff.filter(staff =>
                staff.name.toLowerCase().includes(keyword) ||
                staff.nickname.toLowerCase().includes(keyword)
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
        this.setData({
            isLoading: true
        });
        const {
            searchKeyword,
            pageSize,
            currentPage
        } = this.data;
        let filteredStaff = [...this.data.allStaff];
        // 搜索筛选
        if (searchKeyword) {
            const keyword = searchKeyword.toLowerCase();
            filteredStaff = filteredStaff.filter(staff =>
                staff.nickname.toLowerCase().includes(keyword) ||
                staff.name.toLowerCase().includes(keyword)
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
        const modal = this.selectComponent('#addStaffModal');
        // 查找要编辑的员工
        const staff = this.data.staffList.find(item => item.id === parseInt(id));
        if (staff) {
            // 创建新对象，添加 isView 属性
            const staffWithView = {
                ...staff, // 使用扩展运算符浅拷贝原对象
                isView: true // 添加新属性
            };
            modal.showModal(staffWithView);
        } else {
            wx.showToast({
                title: '数据不存在!',
                icon: 'none',
                duration: 3000
            });
        }
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
            // 创建新对象，添加 isView 属性
            const staffWithEdit = {
                ...staff, // 使用扩展运算符浅拷贝原对象
                isView: false // 添加新属性
            };
            modal.showModal(staffWithEdit);
        } else {
            wx.showToast({
                title: '数据不存在!',
                icon: 'none',
                duration: 3000
            });
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
        const jmygbEntity = e.detail;
        wx.showLoading({
            title: '保存中...',
        });
        // 调用后台api接口
        console.log(jmygbEntity);
        if (jmygbEntity.id) {
            api.updateStaff(jmygbEntity).then(responseData => {
                wx.hideLoading();
                wx.showToast({
                    title: '保存成功',
                    icon: 'success'
                });
                // 重新加载数据
                this.loadAllStaff();
            }).catch(error => {
                wx.hideLoading();
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            });
        } else {
            api.addStaff(jmygbEntity).then(responseData => {
                wx.hideLoading();
                wx.showToast({
                    title: '保存成功',
                    icon: 'success'
                });
                // 重新加载数据
                this.loadAllStaff();
            }).catch(error => {
                wx.hideLoading();
                // 根据错误类型显示不同的提示
                api.handleApiError(error);
            });
        }
    }
});