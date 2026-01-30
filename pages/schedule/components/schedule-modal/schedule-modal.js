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
      
      // 表单数据
      selectedStaff: null,
      staffIndex: 0,
      scheduleType: '全天班',
      selectedDates: [],
      
      // 日历数据
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth(),
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      daysInMonth: [],
      firstDayOfMonth: 0,
      
      // 员工选项
      staffOptions: [],
      
      // 表单验证
      isFormValid: false
    },
  
    methods: {
      // 显示弹窗
      showModal(scheduleData = null) {
        this.loadStaffOptions();
        this.initCalendar();
        
        let isEdit = false;
        let formData = {
          selectedStaff: null,
          staffIndex: 0,
          scheduleType: '全天班',
          selectedDates: []
        };
        
        if (scheduleData) {
          // 编辑模式
          isEdit = true;
          const staffIndex = this.data.staffOptions.findIndex(staff => staff.id === scheduleData.staffId);
          const selectedDate = scheduleData.scheduleDate;
          
          formData = {
            selectedStaff: this.data.staffOptions[staffIndex] || null,
            staffIndex: staffIndex >= 0 ? staffIndex : 0,
            scheduleType: scheduleData.scheduleType || '全天班',
            selectedDates: [selectedDate]
          };
        }
        
        this.setData({
          showModal: true,
          isEdit,
          ...formData
        }, () => {
          this.updateCalendar();
          this.validateForm();
        });
      },
  
      // 隐藏弹窗
      hideModal() {
        this.setData({
          showModal: false
        });
      },
  
      // 加载员工选项
      loadStaffOptions() {
        // 模拟员工数据
        const staffOptions = [
          { id: 1, name: '李美容师' },
          { id: 2, name: '王美甲师' },
          { id: 3, name: '张按摩师' },
          { id: 4, name: '赵护理师' },
          { id: 5, name: '陈顾问' }
        ];
        
        this.setData({ staffOptions });
      },
  
      // 初始化日历
      initCalendar() {
        const today = new Date();
        this.setData({
          currentYear: today.getFullYear(),
          currentMonth: today.getMonth()
        }, () => {
          this.updateCalendar();
        });
      },
  
      // 更新日历数据
      updateCalendar() {
        const { currentYear, currentMonth, selectedDates } = this.data;
        
        // 获取当月第一天是星期几
        const firstDay = new Date(currentYear, currentMonth, 1);
        const firstDayOfMonth = firstDay.getDay();
        
        // 获取当月天数
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // 生成日期数组
        const daysArray = [];
        for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
          const isSelected = selectedDates.includes(dateStr);
          const isToday = this.isToday(dateStr);
          
          daysArray.push({
            day: i,
            date: dateStr,
            isSelected: isSelected,
            isToday: isToday,
            status: isSelected ? '已选' : (isToday ? '今天' : '')
          });
        }
        
        this.setData({
          firstDayOfMonth,
          daysInMonth: daysArray
        });
      },
  
      // 判断是否是今天
      isToday(dateStr) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        return dateStr === todayStr;
      },
  
      // 获取日期样式类
      getDateClass(item) {
        let className = '';
        if (item.isSelected) className += ' selected';
        if (item.isToday) className += ' today';
        return className;
      },
  
      // 上个月
      prevMonth() {
        let { currentYear, currentMonth } = this.data;
        
        if (currentMonth === 0) {
          currentMonth = 11;
          currentYear -= 1;
        } else {
          currentMonth -= 1;
        }
        
        this.setData({
          currentYear,
          currentMonth
        }, () => {
          this.updateCalendar();
        });
      },
  
      // 下个月
      nextMonth() {
        let { currentYear, currentMonth } = this.data;
        
        if (currentMonth === 11) {
          currentMonth = 0;
          currentYear += 1;
        } else {
          currentMonth += 1;
        }
        
        this.setData({
          currentYear,
          currentMonth
        }, () => {
          this.updateCalendar();
        });
      },
  
      // 选择日期
      selectDate(e) {
        const date = e.currentTarget.dataset.date;
        let { selectedDates } = this.data;
        
        // 检查是否已选中
        const index = selectedDates.indexOf(date);
        
        if (index > -1) {
          // 如果已选中，则取消选中
          selectedDates.splice(index, 1);
        } else {
          // 如果未选中，检查是否已达到上限
          if (selectedDates.length >= 6) {
            wx.showToast({
              title: '最多选择6个日期',
              icon: 'none'
            });
            return;
          }
          // 添加选中
          selectedDates.push(date);
        }
        
        // 排序日期
        selectedDates.sort((a, b) => new Date(a) - new Date(b));
        
        this.setData({
          selectedDates
        }, () => {
          this.updateCalendar();
          this.validateForm();
        });
      },
  
      // 移除日期
      removeDate(e) {
        const index = e.currentTarget.dataset.index;
        let { selectedDates } = this.data;
        
        selectedDates.splice(index, 1);
        
        this.setData({
          selectedDates
        }, () => {
          this.updateCalendar();
          this.validateForm();
        });
      },
  
      // 员工选择变化
      onStaffChange(e) {
        const index = e.detail.value;
        const selectedStaff = this.data.staffOptions[index];
        
        this.setData({
          staffIndex: index,
          selectedStaff
        }, () => {
          this.validateForm();
        });
      },
  
      // 设置排班类型
      setScheduleType(e) {
        const type = e.currentTarget.dataset.type;
        
        this.setData({
          scheduleType: type
        }, () => {
          this.validateForm();
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
  
        const scheduleData = {
          isEdit: this.data.isEdit,
          staffId: this.data.selectedStaff.id,
          staffName: this.data.selectedStaff.name,
          scheduleType: this.data.scheduleType,
          status: this.data.scheduleType === '全天班' ? '在岗' : '休息',
          selectedDates: this.data.selectedDates,
          // 如果是编辑模式，生成单条数据
          scheduleItems: this.generateScheduleItems()
        };
  
        this.triggerEvent('confirm', scheduleData);
        this.hideModal();
      },
  
      // 生成排班项
      generateScheduleItems() {
        const { selectedStaff, scheduleType, selectedDates } = this.data;
        const status = scheduleType === '全天班' ? '在岗' : '休息';
        
        return selectedDates.map(date => ({
          staffId: selectedStaff.id,
          staffName: selectedStaff.name,
          scheduleDate: date,
          scheduleType: scheduleType,
          status: status,
          appointmentCount: status === '在岗' ? 0 : 0
        }));
      },
  
      // 验证表单
      validateForm() {
        const { selectedStaff, selectedDates } = this.data;
        const isValid = !!selectedStaff && selectedDates.length > 0;
        
        this.setData({
          isFormValid: isValid
        });
        
        return isValid;
      }
    }
  });