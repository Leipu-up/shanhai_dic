Component({
    properties: {
        inventoryId: {
            type: Number,
            value: ''
        },
        // 操作类型：'in' 或 'out'
        type: {
            type: String,
            value: 'in'
        },
        // 商品名称
        inventoryName: {
            type: String,
            value: ''
        },
        // 当前库存量
        currentQuantity: {
            type: Number,
            value: 0
        },
        // 单位
        unit: {
            type: String,
            value: ''
        }
    },

    data: {
        showModal: false,
        formData: {
            quantity: '',
            purpose: '',
            person: '',
            time: '',
            notes: ''
        },
        newQuantity: 0, // 新增：用于存储计算结果
        // 出库用途选项
        purposeOptions: ['客户使用', '员工使用', '赠送', '报损', '其他'],
        // 当前时间
        currentTime: '',
        // 表单验证
        isFormValid: false
    },
    observers: {
        // 监听相关数据变化，重新计算
        'formData.quantity, currentQuantity, type': function (quantity, currentQuantity, type) {
            this.calculateNewQuantity();
        }
    },
    lifetimes: {
        ready() {
            // 初始化当前时间
            const now = new Date();
            const timeStr = this.formatDateTime(now);
            this.setData({
                currentTime: timeStr.split(' ')[0],
                'formData.time': timeStr
            });
        }
    },

    methods: {
        // 显示弹窗
        showModal() {
            const now = new Date();
            const timeStr = this.formatDateTime(now);

            const defaultFormData = {
                quantity: '',
                purpose: '客户使用',
                person: '',
                time: timeStr,
                notes: ''
            };

            // 尝试获取当前用户
            const userInfo = wx.getStorageSync('userInfo');
            if (userInfo && userInfo.nickName) {
                defaultFormData.person = userInfo.nickName;
            }

            this.setData({
                showModal: true,
                formData: defaultFormData,
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

        // 格式化日期时间
        formatDateTime(date) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
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
            // 检查出库数量是否足够
            if (this.data.type === 'out') {
                const newQuantity = this.calculateNewQuantity();
                if (newQuantity < 0) {
                    wx.showToast({
                        title: '库存不足，无法出库',
                        icon: 'none'
                    });
                    return;
                }
            }
            // 构建参数
            const userInfo = wx.getStorageSync('userInfo');
            if (this.data.type === 'in') {
                console.log('in');
                const inOutData = {
                    rksl: parseInt(this.data.formData.quantity),
                    jjygb: {
                        id: userInfo.userId
                    },
                    jjkcb: {
                        id: this.data.inventoryId
                    },
                    rksj: this.data.formData.time,
                    bz: this.data.formData.notes,
                    inOutType: 'in'
                };
                this.triggerEvent('confirm', inOutData);
            } else {
                console.log('out');
                const inOutData = {
                    cksl: parseInt(this.data.formData.quantity),
                    ckyt: this.data.formData.purpose,
                    jjygb: {
                        id: userInfo.userId
                    },
                    jjkcb: {
                        id: this.data.inventoryId
                    },
                    cksj: this.data.formData.time,
                    bz: this.data.formData.notes,
                    kcl: this.calculateNewQuantity(),
                    inOutType: 'out'
                };
                this.triggerEvent('confirm', inOutData);
            }

            this.hideModal();
        },

        // 计算新的库存量
        calculateNewQuantity() {
            const quantity = parseInt(this.data.formData.quantity) || 0;
            const currentQuantity = parseInt(this.data.currentQuantity) || 0;
            let newQuantity = 0;

            if (this.data.type === 'in') {
                newQuantity = currentQuantity + quantity;
            } else {
                newQuantity = currentQuantity - quantity;
                // 确保库存不会为负数
                if (newQuantity < 0) {
                    newQuantity = 0;
                }
            }
            this.setData({
                newQuantity: newQuantity
            });
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

        // 用途选择变化
        onPurposeChange(e) {
            const index = e.detail.value;
            const purpose = this.data.purposeOptions[index];

            this.setData({
                'formData.purpose': purpose
            }, () => {
                this.validateForm();
            });
        },

        // 时间选择变化
        onTimeChange(e) {
            const value = e.detail.value;

            this.setData({
                'formData.time': value
            }, () => {
                this.validateForm();
            });
        },

        // 验证表单
        validateForm() {
            const formData = this.data.formData;
            const isValid = !!(
                formData.quantity &&
                !isNaN(formData.quantity) &&
                parseInt(formData.quantity) > 0 &&
                formData.person &&
                formData.time
            );

            this.setData({
                isFormValid: isValid
            });

            return isValid;
        }
    }
});