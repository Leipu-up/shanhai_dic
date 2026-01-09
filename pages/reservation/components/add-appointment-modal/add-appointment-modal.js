Component({
    properties: {
        // 用户角色
        userRole: {
            type: String,
            value: 'staff'
        },
        // 员工列表
        staffList: {
            type: Array,
            value: []
        }
    },

    data: {
        showModal: false,
        isEdit: false,
        formData: {
            id: null,
            name: '',
            phone: '',
            appointmentDate: '',
            appointmentTime: '',
            duration: 90,
            service: '',
            staffId: null,
            staffName: '',
            notes: ''
        },
        // 服务选项
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
        ],
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
                'formData.staffId': userInfo.id || 1,
                'formData.staffName': userInfo.nickName || '当前用户'
            });
        },

        // 初始化员工选项
        initStaffOptions() {
            const staffOptions = this.data.staffList.map(staff => ({
                ...staff,
                name: staff.name
            }));

            // 如果是员工角色，默认选中自己
            let staffIndex = 0;
            if (this.data.userRole === 'staff' && this.data.currentUser.id) {
                const index = staffOptions.findIndex(staff => staff.id === this.data.currentUser.id);
                if (index !== -1) {
                    staffIndex = index;
                    this.setData({
                        'formData.staffId': this.data.currentUser.id,
                        'formData.staffName': this.data.currentUser.nickName || staffOptions[index].name
                    });
                }
            }

            this.setData({
                staffOptions,
                staffIndex
            });
        },

        // 显示弹窗
        showModal(appointmentData = null) {
            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

            const defaultFormData = {
                id: null,
                name: '',
                phone: '',
                appointmentDate: formattedDate,
                appointmentTime: '',
                duration: 90,
                service: '',
                staffId: this.data.currentUser.id || 1,
                staffName: this.data.currentUser.nickName || '当前用户',
                notes: ''
            };

            let formData = defaultFormData;
            let isEdit = false;

            if (appointmentData) {
                // 编辑模式
                isEdit = true;
                formData = {
                    id: appointmentData.id,
                    name: appointmentData.name,
                    phone: appointmentData.phone,
                    appointmentDate: appointmentData.appointmentDate === '今天' ? formattedDate : appointmentData.appointmentDate,
                    appointmentTime: appointmentData.appointmentTime ? appointmentData.appointmentTime.split('-')[0] : '',
                    duration: appointmentData.duration || 90,
                    service: appointmentData.service,
                    staffId: appointmentData.staffId || 1,
                    staffName: appointmentData.staffName,
                    notes: appointmentData.notes || ''
                };

                // 设置选中索引
                const serviceIndex = this.data.serviceOptions.findIndex(option => option.name === formData.service);
                const durationIndex = this.data.durationOptions.findIndex(option => option.id === formData.duration);
                const staffIndex = this.data.staffOptions.findIndex(staff => staff.name === formData.staffName);

                this.setData({
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
                scrollViewHeight: Math.max(400, scrollHeight) // 设置最小高度
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

            this.triggerEvent('confirm', appointmentData);
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

        // 输入框变化
        onInputChange(e) {
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
            if (this.data.userRole !== 'admin') return;

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