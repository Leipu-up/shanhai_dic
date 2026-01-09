Component({
    properties: {
      // 父组件传递的属性
    },
  
    data: {
      showModal: false,
      formData: {
        name: '',
        category: '',
        unit: '',
        storeName: '',
        quantity: '0',
        minStock: '10',
        notes: ''
      },
      // 选项数据
      categoryOptions: ['护肤', '彩妆', '工具', '仪器', '消耗品', '其他'],
      storeOptions: ['总店', '分店一', '分店二', '分店三', '旗舰店'],
      categoryIndex: 0,
      storeIndex: 0,
      // 表单验证
      isFormValid: false
    },
  
    methods: {
      // 显示弹窗
      showModal() {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        
        const defaultFormData = {
          name: '',
          category: '',
          unit: '',
          storeName: '',
          quantity: '0',
          minStock: '10',
          notes: ''
        };
  
        this.setData({
          showModal: true,
          formData: defaultFormData,
          categoryIndex: 0,
          storeIndex: 0
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
  
        const inventoryData = {
          ...this.data.formData,
          quantity: parseInt(this.data.formData.quantity) || 0,
          minStock: parseInt(this.data.formData.minStock) || 10,
          isLowStock: (parseInt(this.data.formData.quantity) || 0) < (parseInt(this.data.formData.minStock) || 10),
          createdTime: new Date().toISOString()
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
          categoryIndex: index,
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
          storeIndex: index,
          [`formData.storeName`]: storeName
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
          formData.storeName
        );
  
        this.setData({
          isFormValid: isValid
        });
  
        return isValid;
      }
    }
  });