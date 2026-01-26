Component({
    properties: {
        // 父组件传递的属性
    },

    data: {
        showModal: false,
        formData: {
            id: '',
            name: '',
            category: '',
            unit: '',
            store: '',
            quantity: '0',
            minStock: '5',
            notes: ''
        },
        // 选项数据
        categoryOptions: ['护肤', '工具', '仪器', '消耗品', '其他'],
        storeOptions: ['MLife', 'YOLO'],
        // 表单验证
        isFormValid: false
    },

    methods: {
        // 显示弹窗
        showModal(inventoryData = null) {
            const defaultFormData = {
                id: '',
                name: '',
                category: '',
                unit: '',
                store: '',
                quantity: '0',
                minStock: '5',
                notes: ''
            };

            let formData = defaultFormData;
            if (inventoryData) {
                console.log(inventoryData);
                // 编辑模式
                formData = {
                    id: inventoryData.id,
                    name: inventoryData.name || '',
                    category: inventoryData.category || '',
                    unit: inventoryData.unit || '',
                    quantity: inventoryData.quantity || '',
                    minStock: inventoryData.isLowStock || '',
                    notes: inventoryData.notes || '',
                    store: inventoryData.store || '',
                };
            } 
            this.setData({
                showModal: true,
                formData,
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
            const inventoryData = {
                id: formData.id,
                spmc: formData.name,
                spfl: formData.category,
                spdw: formData.unit,
                dqkc: formData.quantity,
                kcyj: formData.minStock,
                bz: formData.notes,
                jmsdbName: formData.store,
            };
            this.triggerEvent('confirm', inventoryData);
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

        // 分类选择
        onCategoryChange(e) {
            const index = e.detail.value;
            const category = this.data.categoryOptions[index];
            this.setData({
                [`formData.category`]: category
            }, () => {
                this.validateForm();
            });
        },

        // 店铺选择
        onStoreChange(e) {
            const index = e.detail.value;
            const storeName = this.data.storeOptions[index];
            this.setData({
                [`formData.store`]: storeName
            }, () => {
                this.validateForm();
            });
        },

        // 验证表单
        validateForm() {
            const formData = this.data.formData;
            const isValid = !!(
                formData.name &&
                formData.unit &&
                formData.store
            );

            this.setData({
                isFormValid: isValid
            });
            return isValid;
        }
    }
});