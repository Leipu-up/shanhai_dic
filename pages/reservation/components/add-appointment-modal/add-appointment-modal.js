// 引入API服务
const {
    api
} = require('../../../../utils/app');

Component({
    properties: {
        // 员工列表
        staffList: {
            type: Array,
            value: []
        },
        // 服务列表
        serviceOptions: {
            type: Array,
            value: []
        }
    },

    data: {
        showModal: false,
        isEdit: false,
        formData: {
            id: null,
            khId: null,
            name: '',
            phone: '',
            appointmentDate: '',
            appointmentTime: '',
            duration: 60,
            service: '',
            staffId: null,
            staffName: '',
            notes: ''
        },
        // 客户搜索相关
        searchCustomerKeyword: '',
        searchCustomerResults: [],
        showCustomerResults: false,
        isSearchingCustomer: false,
        searchTimer: null,
        // 时长选项
        durationOptions: [{
                id: 60,
                name: '60分钟'
            },
            {
                id: 90,
                name: '90分钟'
            },
            {
                id: 120,
                name: '120分钟'
            },
            {
                id: 180,
                name: '180分钟'
            }
        ],
        // 当前选中索引
        serviceIndex: 0,
        durationIndex: 1, // 默认90分钟
        staffIndex: 0,
        // 员工选项（从staffList转换）
        staffOptions: [],
        // 当前用户信息
        currentUser: {},
        // 表单验证状态
        isFormValid: false,
        scrollViewHeight: 500, // 默认高度，会在组件显示时动态计算
    },

    lifetimes: {
        ready() {
            this.loadCurrentUser();
            this.initStaffOptions();
        }
    },

    methods: {
        // 加载当前用户信息
        loadCurrentUser() {
            const userInfo = wx.getStorageSync('userInfo') || {};
            this.setData({
                currentUser: userInfo,
                'formData.staffId': userInfo.userId || 1,
                'formData.staffName': userInfo.nickname || '未登录'
            });
        },
        // 初始化员工选项
        initStaffOptions() {
            console.log(this.data.staffList);
            let staffOptions = [];
            staffOptions = staffOptions.concat(this.data.staffList.map(staff => ({
                id: staff.id,
                name: staff.nickname
            })));
            console.log(staffOptions);
            // 如果是员工角色，只能选中自己
            let staffIndex = 0;
            if (this.data.currentUser.level < 3) {
                const index = staffOptions.findIndex(staff => staff.id === this.data.currentUser.userId);
                if (index !== -1) {
                    staffIndex = index;
                    this.setData({
                        staffOptions,
                        'formData.staffId': this.data.currentUser.userId,
                        'formData.staffName': this.data.currentUser.nickname || staffOptions[index].name
                    });
                }
            }
            this.setData({
                staffOptions,
                staffIndex
            });
        },

        // 客户搜索相关方法
        // 搜索输入变化
        onCustomerSearchInput(e) {
            const keyword = e.detail.value;
            this.setData({
                searchCustomerKeyword: keyword,
                showCustomerResults: keyword.length > 0
            });
            // 防抖搜索
            this.debouncedSearchCustomer(keyword);
        },

        // 防抖搜索函数
        debouncedSearchCustomer(keyword) {
            if (this.data.searchTimer) {
                clearTimeout(this.data.searchTimer);
            }
            if (!keyword || keyword.trim().length === 0) {
                this.setData({
                    searchCustomerResults: [],
                    showCustomerResults: false
                });
                return;
            }
            const timer = setTimeout(() => {
                this.searchCustomers(keyword);
            }, 300);
            this.setData({
                searchTimer: timer
            });
        },

        // 搜索客户
        async searchCustomers(keyword) {
            if (this.data.isSearchingCustomer) return;
            this.setData({
                isSearchingCustomer: true
            });
            try {
                // 调用搜索客户的API
                const response = await api.getCustomerList({
                    "filter": {
                        "khxm": keyword.trim(), // 修改为按客户姓名搜索
                    },
                    "page": {
                        "pageNum": 1,
                        "pageSize": 5
                    }
                });
                const results = response.data?.list || [];
                this.setData({
                    searchCustomerResults: results,
                    isSearchingCustomer: false
                });
            } catch (error) {
                console.error('搜索客户失败:', error);
                this.setData({
                    isSearchingCustomer: false,
                    searchCustomerResults: []
                });
            }
        },

        // 点击搜索按钮
        onCustomerSearch() {
            const keyword = this.data.searchCustomerKeyword.trim();
            if (!keyword) {
                wx.showToast({
                    title: '请输入搜索关键词',
                    icon: 'none'
                });
                return;
            }
            this.searchCustomers(keyword);
        },

        // 键盘确认搜索
        onCustomerSearchConfirm() {
            this.onCustomerSearch();
        },

        // 选择客户
        selectCustomer(e) {
            const index = e.currentTarget.dataset.index;
            const khId = e.currentTarget.dataset.id;
            const customer = this.data.searchCustomerResults[index];
            if (customer) {
                // 回填客户信息到表单
                this.setData({
                    formData: {
                        ...this.data.formData,
                        khId: khId,
                        name: customer.khxm || '',
                        phone: customer.khsjh || ''
                    },
                    // 清空搜索相关数据
                    searchCustomerKeyword: '',
                    searchCustomerResults: [],
                    showCustomerResults: false
                });
                // // 触发一个事件通知父组件（如果需要）
                // this.triggerEvent('customerSelected', {
                //     customerId: customer.id,
                //     customerName: customer.name,
                //     customerPhone: customer.phone
                // });
                // 显示成功提示
                wx.showToast({
                    title: '已选择客户',
                    icon: 'success',
                    duration: 1500
                });
                // 验证表单
                this.validateForm();
            }
        },

        // 清除已选择的客户
        clearSelectedCustomer() {
            this.setData({
                formData: {
                    ...this.data.formData,
                    name: '',
                    phone: ''
                }
            });
            // 触发事件通知父组件
            this.triggerEvent('customerCleared');
            // 重新验证表单
            this.validateForm();
        },

        // 显示弹窗
        showModal(appointmentData = null) {
            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
            const defaultFormData = {
                id: null,
                khId: null,
                name: '',
                phone: '',
                appointmentDate: formattedDate,
                appointmentTime: '',
                duration: 90,
                service: '',
                staffId: this.data.currentUser.userId || 1,
                staffName: this.data.currentUser.nickname || '当前用户',
                notes: ''
            };

            let formData = defaultFormData;
            let isEdit = false;
            if (appointmentData) {
                // 编辑模式
                isEdit = true;
                formData = {
                    id: appointmentData.id,
                    khId: appointmentData.jmkhb.id,
                    name: appointmentData.jmkhb.khxm,
                    phone: appointmentData.jmkhb.khsjh,
                    appointmentDate: appointmentData.yyrq,
                    appointmentTime: appointmentData.yysj,
                    duration: appointmentData.yysc,
                    service: appointmentData.jmfwb.fwmc,
                    staffId: appointmentData.jmygb.id,
                    staffName: appointmentData.jmygb.nickname,
                    notes: appointmentData.bz || ''
                };
                // 设置选中索引
                const serviceIndex = this.data.serviceOptions.findIndex(option => option.name === formData.service);
                const durationIndex = this.data.durationOptions.findIndex(option => option.id === formData.duration);
                const staffIndex = this.data.staffOptions.findIndex(staff => staff.name === formData.staffName);
                this.setData({
                    'formData.khId': appointmentData.jmkhb.id,
                    serviceIndex: serviceIndex !== -1 ? serviceIndex : 0,
                    durationIndex: durationIndex !== -1 ? durationIndex : 1,
                    staffIndex: staffIndex !== -1 ? staffIndex : 0
                });
            } else {
                // 新增模式，重置索引
                this.setData({
                    serviceIndex: 0,
                    durationIndex: 1,
                    staffIndex: 0
                });
            }
            // 获取屏幕高度并计算合适的高度
            const systemInfo = wx.getSystemInfoSync();
            const windowHeight = systemInfo.windowHeight;
            // 计算可用高度：窗口高度减去弹窗头部和底部的高度
            const modalHeaderHeight = 100; // 头部大约高度
            const modalFooterHeight = 150; // 底部按钮区域高度
            const scrollHeight = windowHeight * 0.85 - modalHeaderHeight - modalFooterHeight;
            this.setData({
                showModal: true,
                isEdit,
                formData,
                scrollViewHeight: Math.max(400, scrollHeight), // 设置最小高度
                // 清空搜索相关数据
                searchCustomerKeyword: '',
                searchCustomerResults: [],
                showCustomerResults: false,
                isSearchingCustomer: false
            }, () => {
                this.validateForm();
            });
        },

        // 隐藏弹窗
        hideModal() {
            this.setData({
                showModal: false
            });
        },

        // 处理取消
        handleCancel() {
            this.hideModal();
            // 清除搜索定时器
            if (this.data.searchTimer) {
                clearTimeout(this.data.searchTimer);
            }
            this.triggerEvent('cancel');
        },

        // 处理确认
        handleConfirm() {
            if (!this.validateForm()) {
                wx.showToast({
                    title: '请填写完整信息',
                    icon: 'none'
                });
                return;
            }
            // 格式化预约时间（添加结束时间）
            const startTime = this.data.formData.appointmentTime;
            const duration = this.data.formData.duration;
            const endTime = this.calculateEndTime(startTime, duration);
            const appointmentData = {
                ...this.data.formData,
                appointmentTime: `${startTime}-${endTime}`,
                appointmentStatus: 'pending',
                createdTime: new Date().toISOString()
            };
            // 构建参数
            const jmyybEntity = {
                id: appointmentData.id,
                yyrq: appointmentData.appointmentDate,
                yysj: appointmentData.appointmentTime,
                yysc: appointmentData.duration,
                zt: '待服务',
                bz: appointmentData.notes,
                jmkhb: {
                    id: this.data.formData.khId,
                    khxm: appointmentData.name,
                    khsjh: appointmentData.phone
                },
                jmygb: {
                    id: appointmentData.staffId
                },
                jmfwb: {
                    id: this.data.serviceIndex
                }
            }
            this.triggerEvent('confirm', jmyybEntity);
            this.hideModal();
        },

        // 计算结束时间
        calculateEndTime(startTime, durationMinutes) {
            if (!startTime) return '';
            const [hours, minutes] = startTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + durationMinutes;
            const endHours = Math.floor(totalMinutes / 60);
            const endMinutes = totalMinutes % 60;
            return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        },

        // 输入框变化（用于手动输入客户信息）
        onInputChange(e) {
            //清除客户id
            this.setData({
                formData: {
                    id: null,
                }
            });
            const field = e.currentTarget.dataset.field;
            const value = e.detail.value;
            this.setData({
                [`formData.${field}`]: value
            }, () => {
                this.validateForm();
            });
        },

        // 文本域变化
        onTextareaChange(e) {
            const field = e.currentTarget.dataset.field;
            const value = e.detail.value;
            this.setData({
                [`formData.${field}`]: value
            });
        },

        // 日期选择
        onDateChange(e) {
            const value = e.detail.value;
            this.setData({
                'formData.appointmentDate': value
            }, () => {
                this.validateForm();
            });
        },

        // 时间选择
        onTimeChange(e) {
            const value = e.detail.value;
            this.setData({
                'formData.appointmentTime': value
            }, () => {
                this.validateForm();
            });
        },

        // 服务时长选择
        onDurationChange(e) {
            const index = e.detail.value;
            const selected = this.data.durationOptions[index];
            this.setData({
                durationIndex: index,
                'formData.duration': selected.id
            }, () => {
                this.validateForm();
            });
        },

        // 服务项目选择
        onServiceChange(e) {
            const index = e.detail.value;
            const selected = this.data.serviceOptions[index];
            this.setData({
                serviceIndex: index,
                'formData.service': selected.name
            }, () => {
                this.validateForm();
            });
        },

        // 服务人员选择
        onStaffChange(e) {
             if (this.data.currentUser.levle <3) return;
            const index = e.detail.value;
            const selected = this.data.staffOptions[index];
            this.setData({
                staffIndex: index,
                'formData.staffId': selected.id,
                'formData.staffName': selected.name
            }, () => {
                this.validateForm();
            });
        },

        // 验证表单
        validateForm() {
            const formData = this.data.formData;
            const isValid = !!(
                formData.name &&
                formData.phone &&
                formData.phone.length === 11 &&
                formData.appointmentDate &&
                formData.appointmentTime &&
                formData.duration &&
                formData.service &&
                formData.staffName
            );
            this.setData({
                isFormValid: isValid
            });
            return isValid;
        }
    }
});