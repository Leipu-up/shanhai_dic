Component({
    properties: {
      // 父组件传递的属性
    },
  
    data: {
      showModal: false,
      isEdit: false,
      formData: {
        id: null,
        name: '',
        employeeId: '',
        phone: '',
        email: '',
        position: '',
        positionIndex: 0,
        storeName: '',
        storeIndex: 0,
        joinDate: '',
        status: '在职',
        notes: '',
        monthlyPerformance: '¥0'
      },
      // 选项数据
      positionOptions: ['美容师', '美甲师', '按摩师', '顾问', '店长', '前台', '助理'],
      storeOptions: ['总店', '分店一', '分店二', '分店三', '旗舰店'],
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
          employeeId: '',
          phone: '',
          email: '',
          position: '',
          positionIndex: 0,
          storeName: '',
          storeIndex: 0,
          joinDate: formattedDate,
          status: '在职',
          notes: '',
          monthlyPerformance: '¥0'
        };
  
        let formData = defaultFormData;
        let isEdit = false;
        
        if (staffData) {
          // 编辑模式
          isEdit = true;
          formData = {
            id: staffData.id,
            name: staffData.name || '',
            employeeId: staffData.employeeId || '',
            phone: staffData.phone || '',
            email: staffData.email || '',
            position: staffData.position || '',
            positionIndex: this.data.positionOptions.findIndex(option => option === staffData.position),
            storeName: staffData.storeName || '',
            storeIndex: this.data.storeOptions.findIndex(option => option === staffData.storeName),
            joinDate: staffData.joinDate || formattedDate,
            status: staffData.status || '在职',
            notes: staffData.notes || '',
            monthlyPerformance: staffData.monthlyPerformance || '¥0'
          };
        } else {
          // 新增模式
          const randomId = `BY${String(Math.floor(Math.random() * 9000) + 1000)}`;
          formData.employeeId = randomId;
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
  
        const staffData = {
          ...this.data.formData,
          // 计算在职时长
          workDuration: this.calculateWorkDuration(this.data.formData.joinDate, this.data.formData.status),
          createdTime: new Date().toISOString()
        };
  
        this.triggerEvent('confirm', staffData);
        this.hideModal();
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
          [`formData.positionIndex`]: index,
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
          [`formData.storeIndex`]: index,
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
          formData.employeeId &&
          formData.phone &&
          formData.phone.length === 11 &&
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