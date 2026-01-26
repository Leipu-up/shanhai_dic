// 引入API服务
const {
    api
} = require('../../../../utils/app.js');

Component({
    properties: {
        // 父组件传递的属性
    },

    data: {
        showModal: false,
        isEdit: false,
        isView: false,
        formDisabled: false,
        formData: {
            id: null,
            name: '',
            nickname: '',
            employeeId: '',
            phone: '',
            position: '',
            storeName: '',
            joinDate: '',
            status: '在职',
            notes: '',
            monthlyPerformance: '¥0'
        },
        // 选项数据
        positionOptions: ['管理员', '店长', '前台', '美容师', '学徒'],
        storeOptions: ['MLife', 'YOLO'],
        // 表单验证状态
        isFormValid: false
    },

    methods: {
        // 显示弹窗
        showModal(staffData = null) {
            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
            const defaultFormData = {
                id: null,
                name: '',
                sfzh: '',
                phone: '',
                employeeId: '',
                nickname: '',
                position: '',
                storeName: '',
                joinDate: formattedDate,
                status: '在职',
                notes: '',
                monthlyPerformance: '¥0'
            };
            let formData = defaultFormData;
            let isEdit = false;
            if (staffData) {
                console.log(staffData);
                // 编辑模式
                isEdit = true;
                formData = {
                    id: staffData.id,
                    name: staffData.name || '',
                    sfzh: staffData.sfzh || '',
                    phone: staffData.phone || '',
                    employeeId: staffData.employeeId || '',
                    nickname: staffData.nickname || '',
                    position: staffData.position || '',
                    storeName: staffData.storeName || '',
                    joinDate: staffData.joinDate || formattedDate,
                    status: staffData.status || '在职',
                    notes: staffData.notes || '',
                    monthlyPerformance: staffData.monthlyPerformance || '¥0'
                };
                //查看
                if (staffData.isView) {
                    this.setData({
                        isView: true,
                        formDisabled: true,
                    });
                }
            } else {
                // 新增模式
                formData.employeeId = `JM`;
            }

            this.setData({
                showModal: true,
                isEdit,
                formData
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
            // 构建参数
            const formData = this.data.formData;
            const level = this.data.positionOptions.indexOf(formData.rolename) + 1;
            const jmygbEntity = {
                id: formData.id,
                name: formData.name,
                sfzh: formData.sfzh,
                sjh: formData.phone,
                employeeNo: formData.employeeId,
                nickname: formData.nickname,
                rolename: formData.position,
                level: level,
                jmsdbName: formData.storeName,
                joinDate: formData.joinDate,
                status: formData.status,
                bz: formData.notes,
            };
            // 处理成功响应
            this.triggerEvent('confirm',jmygbEntity);
            this.hideModal();
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

        // 职位选择
        onPositionChange(e) {
            const index = e.detail.value;
            const position = this.data.positionOptions[index];
            this.setData({
                [`formData.position`]: position
            }, () => {
                this.validateForm();
            });
        },

        // 门店选择
        onStoreChange(e) {
            const index = e.detail.value;
            const storeName = this.data.storeOptions[index];
            this.setData({
                [`formData.storeName`]: storeName
            }, () => {
                this.validateForm();
            });
        },

        // 入职日期选择
        onJoinDateChange(e) {
            const value = e.detail.value;
            this.setData({
                'formData.joinDate': value
            }, () => {
                this.validateForm();
            });
        },

        // 设置状态
        setStatus(e) {
            const status = e.currentTarget.dataset.status;
            this.setData({
                'formData.status': status
            }, () => {
                this.validateForm();
            });
        },

        // 验证表单
        validateForm() {
            const formData = this.data.formData;
            const isValid = !!(
                formData.name &&
                formData.sfzh &&
                formData.phone && formData.phone.length === 11 &&
                formData.employeeId &&
                formData.nickname &&
                formData.position &&
                formData.storeName &&
                formData.joinDate &&
                formData.status
            );
            this.setData({
                isFormValid: isValid
            });
            return isValid;
        }
    }
});