// 引入API服务
const {
    api
} = require('../../utils/app');

Page({
    data: {
        searchValue: '',
        customerList: [],
        pageSize: 10,
        currentPage: 1,
        hasMore: true,
        loading: false,
        isRefreshing: false,
        total: 0,
        isFirstLoad: true,
        // 弹窗相关数据
        showModal: false,
        isEdit: false,
        isView: false,
        formData: {
            id: '',
            khxm: '',
            khsjh: '',
            khxb: '',
            khsr: '',
            khdj: '',
            khly: '',
            lastVisit: '',
            bz: ''
        },
        // 选择器数据
        genders: ['男', '女'],
        vipLevels: ['普通', '银卡', '金卡', '钻石', '至尊'],
        sources: ['门店到访', '朋友推荐', '线上预约', '活动引流', '电话咨询', '其他'],
    },
    onLoad: function () {
        // 只在onLoad中加载一次
        this.refreshCustomerList();
    },
    // 刷新客户列表
    refreshCustomerList: function () {
        // 如果是首次加载，设置标记
        if (this.data.isFirstLoad) {
            this.setData({
                isFirstLoad: false
            });
        }
        this.setData({
            currentPage: 1,
            hasMore: true,
            loading: true,
            isRefreshing: true
        }, () => {
            this.loadCustomerList();
        });
    },
    // 加载客户列表
    loadCustomerList: function () {
      
        const {
            searchValue,
            currentPage,
            pageSize
        } = this.data;
        // 构建参数
        const params = {
            "filter": {
                "khxm": searchValue, // 修改为按客户姓名搜索
            },
            "page": {
                "pageNum": currentPage,
                "pageSize": pageSize
            }
        };
        console.log('加载客户列表，页码:', currentPage);
        // 只在第一次加载时显示loading
        if (this.data.currentPage === 1 && this.data.isRefreshing) {
            wx.showLoading({
                title: '加载中...'
            });
        }
        api.getCustomerList(params).then(responseData => {
            wx.hideLoading();
            const mockData = responseData.data;
            const newList = mockData.list || [];
            const total = mockData.total || 0;
            const pageCount = mockData.pageCount || 0;
            console.log('第', currentPage, '页数据加载完成，共', newList.length, '条');
            console.log('总页数:', pageCount, '当前页:', currentPage);
            // 判断是否还有更多数据
            const hasMore = currentPage < pageCount && newList.length > 0;
            console.log('是否有更多数据:', hasMore);
            // 如果是第一页，替换数据；否则追加数据
            const customerList = currentPage === 1 ? newList : [...this.data.customerList, ...newList];
            this.setData({
                customerList: customerList,
                hasMore: hasMore,
                loading: false,
                isRefreshing: false,
                total: total
            }, () => {
                console.log('数据更新完成，当前总数:', customerList.length, '，是否还有更多:', hasMore);
            });
        }).catch(error => {
            wx.hideLoading();
            console.error('加载客户列表失败:', error);
            this.setData({
                loading: false,
                isRefreshing: false
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
        console.log('当前状态 - loading:', this.data.loading, 'hasMore:', this.data.hasMore);
        // 如果正在加载或没有更多数据，则不执行
        if (this.data.loading) {
            console.log('正在加载中，跳过');
            return;
        }
        if (!this.data.hasMore) {
            console.log('没有更多数据了，不加载');
            return;
        }
        // 增加页码并加载数据
        this.setData({
            currentPage: this.data.currentPage + 1,
            loading: true
        }, () => {
            console.log('开始加载第', this.data.currentPage, '页');
            this.loadCustomerList();
        });
    },
    // 搜索相关方法
    onSearchInput: function (e) {
        this.setData({
            searchValue: e.detail.value
        });
    },
    onSearch: function () {
        this.refreshCustomerList();
    },
    onSearchConfirm: function () {
        this.onSearch();
    },
    // 弹窗相关方法
    showAddModal: function () {
        this.setData({
            showModal: true,
            isEdit: false,
            isView: false,
            formData: {
                id: '',
                khxm: '',
                khsjh: '',
                khxb: '',
                khsr: '',
                khdj: '',
                khly: '',
                ljxf: '',
                bz: ''
            },
        });
    },
    showEditModal: function (id, isView) {
        const customer = this.data.customerList.find(item => item.id === id);
        if (customer) {
            this.setData({
                showModal: true,
                isEdit: true,
                isView: isView || false,
                formData: {
                    ...customer
                },
            });
        }
    },
    hideModal: function () {
        this.setData({
            showModal: false
        });
    },
    // 表单输入处理
    onFormInput: function (e) {
        const field = e.currentTarget.dataset.field;
        const value = e.detail.value;
        this.setData({
            [`formData.${field}`]: value
        });
    },
    // 性别选择
    onGenderChange: function (e) {
        const index = e.detail.value;
        const gender = this.data.genders[index];
        this.setData({
            'formData.khxb': gender
        });
    },
    // 生日选择
    onBirthdayChange: function (e) {
        const birthday = e.detail.value;
        this.setData({
            'formData.khsr': birthday
        });
    },
    // VIP等级选择
    onVipLevelChange: function (e) {
        const index = e.detail.value;
        const vipLevel = this.data.vipLevels[index];
        this.setData({
            vipLevelIndex: index,
            'formData.khdj': vipLevel
        });
    },
    // 来源选择
    onSourceChange: function (e) {
        const index = e.detail.value;
        const source = this.data.sources[index];
        this.setData({
            'formData.khly': source
        });
    },
    // 保存客户
    saveCustomer: function () {
        const {
            formData,
            isEdit
        } = this.data;
        console.log('保存客户数据:', formData);
        // 验证必填字段
        if (!formData.khxm || !formData.khxm.trim()) {
            wx.showToast({
                title: '请输入客户姓名',
                icon: 'none'
            });
            return;
        }
        if (!formData.khsjh || !formData.khsjh.trim()) {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            });
            return;
        }
        // 简单的手机号验证
        if (formData.khsjh.length !== 11 || !/^1[3-9]\d{9}$/.test(formData.khsjh)) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            });
            return;
        }
        wx.showLoading({
            title: '保存中...'
        });
        if (isEdit) {
            api.updateCustomer(formData).then(responseData => {
                wx.hideLoading();
                wx.showToast({
                    title: '编辑成功',
                    icon: 'success'
                });
                this.refreshCustomerList();
                this.hideModal();
            }).catch(error => {
                wx.hideLoading();
                api.handleApiError(error);
            });
        } else {
            console.log(formData);
            api.addCustomer(formData).then(responseData => {
                wx.hideLoading();
                wx.showToast({
                    title: '新增成功',
                    icon: 'success'
                });
                this.refreshCustomerList();
                this.hideModal();
            }).catch(error => {
                wx.hideLoading();
                api.handleApiError(error);
            });
        }
    },
    // 查看客户
    viewCustomer: function (e) {
        const id = e.currentTarget.dataset.id;
        this.showEditModal(parseInt(id), true);
    },
    // 编辑客户
    editCustomer: function (e) {
        const id = e.currentTarget.dataset.id;
        this.showEditModal(parseInt(id), false);
    },
    // 删除客户
    deleteCustomer: function (e) {
        const id = e.currentTarget.dataset.id;
        const customerName = this.data.customerList.find(item => item.id === parseInt(id))?.khxm || '';
        wx.showModal({
            title: '确认删除',
            content: `确定要删除客户"${customerName}"吗？`,
            success: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '删除中...'
                    });
                    api.deleteCustomer({
                        id: id
                    }).then(responseData => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '删除成功',
                            icon: 'success'
                        });
                        this.refreshCustomerList();
                    }).catch(error => {
                        wx.hideLoading();
                        api.handleApiError(error);
                    });
                }
            }
        });
    },
    // 停止事件冒泡
    stopPropagation: function (e) {
        // 阻止事件冒泡
    },
    // 下拉刷新
    onPullDownRefresh: function () {
        console.log('下拉刷新');
        this.refreshCustomerList();
        setTimeout(() => {
            wx.stopPullDownRefresh();
        }, 1000);
    }
});