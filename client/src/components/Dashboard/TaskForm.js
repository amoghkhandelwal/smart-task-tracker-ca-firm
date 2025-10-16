import React, { useEffect, useState } from 'react';
import * as chrono from 'chrono-node';

const CATEGORIES = ['Work', 'Personal', 'Health', 'Study', 'Other'];
const TITLE_OPTIONS = [
  'INCOME TAX RETURN  ',
  'GST TAX RETURN ',
  'Partnership Registration',
  'ROF Registration',
  'ROC Registration',
  'GST Registration',
  'AUDIT',
  'Other'
];

const TaskForm = ({ onAdd, editingTask, onUpdate, usersUnderAdmin, currentUser }) => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    category: '',
    isCompleted: false,
  });
  const [customCategory, setCustomCategory] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [useTime, setUseTime] = useState(false);
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmPm] = useState('AM');
  const [titleInput, setTitleInput] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTask({
        ...editingTask,
        dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : '',
      });
      setTitleInput(editingTask.title || '');
      const isCustom = editingTask.category && !CATEGORIES.includes(editingTask.category);
      setCustomCategory(isCustom ? editingTask.category : '');
      setIsOtherSelected(isCustom);
      setSubtasks(editingTask.subtasks || []);
      setRecurrenceType(editingTask.recurrenceType || 'none');
      setRecurrenceInterval(editingTask.recurrenceInterval || 1);
      setReminderMinutesBefore(editingTask.reminderMinutesBefore ?? null);
      const dateObj = editingTask.dueDate ? new Date(editingTask.dueDate) : null;
      setDueDate(dateObj ? dateObj.toISOString().slice(0, 10) : '');
      if (dateObj && (dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0)) {
        setUseTime(true);
        let h = dateObj.getHours();
        setAmPm(h >= 12 ? 'PM' : 'AM');
        h = h % 12;
        h = h ? h : 12;
        setHour(h.toString().padStart(2, '0'));
        setMinute(dateObj.getMinutes().toString().padStart(2, '0'));
      } else {
        setUseTime(false);
        setHour('12');
        setMinute('00');
        setAmPm('AM');
      }
      setAssignedTo(editingTask.assignedTo || '');
    } else {
      // Reset form when not editing
      setTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        category: '',
        isCompleted: false,
      });
      setCustomCategory('');
      setIsOtherSelected(false);
      setSubtasks([]);
      setRecurrenceType('none');
      setRecurrenceInterval(1);
      setReminderMinutesBefore(null);
      setDueDate('');
      setUseTime(false);
      setHour('12');
      setMinute('00');
      setAmPm('AM');
      setTitleInput('');
      setAssignedTo('');
    }
  }, [editingTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dueDate') {
      setDueDate(value);
    } else if (name === 'useTime') {
      setUseTime(e.target.checked);
    } else if (name === 'hour') {
      setHour(value);
    } else if (name === 'minute') {
      setMinute(value);
    } else if (name === 'ampm') {
      setAmPm(value);
    } else if (name === 'category') {
      if (value === 'Other') {
        setIsOtherSelected(true);
        setTask((prev) => ({ ...prev, category: 'Other' }));
      } else {
        setIsOtherSelected(false);
        setCustomCategory('');
        setTask((prev) => ({ ...prev, category: value }));
      }
    } else {
      setTask((prev) => ({
        ...prev,
        [name]: name === 'isCompleted' ? value === 'true' : value,
      }));
    }
  };

  const handleCustomCategoryChange = (e) => {
    setCustomCategory(e.target.value);
  };

  const handleSubtaskChange = (idx, field, value) => {
    setSubtasks((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const handleAddSubtask = () => {
    setSubtasks((prev) => [...prev, { title: '', completed: false }]);
  };

  const handleRemoveSubtask = (idx) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTitleInput = (e) => {
    setTitleInput(e.target.value);
    setTask((prev) => ({ ...prev, title: e.target.value }));
  };

  const handleTitleInputParse = (e) => {
    if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
      if (!titleInput.trim()) return;
      const results = chrono.parse(titleInput);
      if (results.length > 0) {
        const { start } = results[0];
        // Set due date
        const dateObj = start.date();
        setDueDate(dateObj.toISOString().slice(0, 10));
        // Set time if present
        if (start.isCertain('hour') && start.isCertain('minute')) {
          setUseTime(true);
          let h = dateObj.getHours();
          setAmPm(h >= 12 ? 'PM' : 'AM');
          h = h % 12;
          h = h ? h : 12;
          setHour(h.toString().padStart(2, '0'));
          setMinute(dateObj.getMinutes().toString().padStart(2, '0'));
        } else {
          setUseTime(false);
          setHour('12');
          setMinute('00');
          setAmPm('AM');
        }
        // Do NOT alter the title; always use the full input
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submitted!');
    console.log('isOtherSelected:', isOtherSelected);
    console.log('customCategory:', customCategory);
    console.log('task.category:', task.category);
    console.log('task:', task);
    
    // Validate custom category if "Other" is selected
    if (isOtherSelected && !customCategory.trim()) {
      alert('Please enter a custom category');
      return;
    }
    
    let dueDateTime = '';
    if (dueDate) {
      if (useTime) {
        let h = parseInt(hour, 10);
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        const [year, month, day] = dueDate.split('-');
        const localDate = new Date(year, month - 1, day, h, parseInt(minute, 10));
        dueDateTime = localDate.toISOString();
      } else {
        const [year, month, day] = dueDate.split('-');
        const localDate = new Date(year, month - 1, day, 0, 0);
        dueDateTime = localDate.toISOString();
      }
    }
    
    const taskData = {
      ...task,
      dueDate: dueDateTime || '',
      category: isOtherSelected ? customCategory : task.category,
      subtasks,
      recurrenceType,
      recurrenceInterval,
      reminderMinutesBefore: reminderMinutesBefore == null ? 0 : reminderMinutesBefore,
      assignedTo: (usersUnderAdmin && assignedTo) ? assignedTo : currentUser.userId,
    };

    if (editingTask) {
      const updatedTask = {
        ...taskData,
        _id: editingTask._id,
      };
      console.log('Updating task with recurrence:', updatedTask);
      onUpdate(updatedTask);
    } else {
      console.log('Adding task with recurrence:', taskData);
      onAdd(taskData);
      setTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        category: '',
        isCompleted: false,
      });
      setCustomCategory('');
      setIsOtherSelected(false);
      setSubtasks([]);
      setRecurrenceType('none');
      setRecurrenceInterval(1);
      setReminderMinutesBefore(null);
      setDueDate('');
      setUseTime(false);
      setHour('12');
      setMinute('00');
      setAmPm('AM');
      setTitleInput('');
      setAssignedTo('');
    }
    // Don't reset form if editing; parent handles it
  };

  const handleCancel = () => {
    setTask({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      category: '',
      isCompleted: false,
    });
    setCustomCategory('');
    setIsOtherSelected(false);
    onUpdate(null);
  };

  return (
    <div className="card shadow-sm p-4 mb-4">
      <h5>{editingTask ? 'Edit Task' : 'Add New Task'}</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="titleInput" className="form-label">Task Title</label>
          {currentUser && currentUser.role === 'admin' ? (
            <>
              <select
                className="form-select mb-2"
                value={titleInput && TITLE_OPTIONS.includes(titleInput) ? titleInput : (titleInput ? 'Other' : '')}
                onChange={e => {
                  if (e.target.value === 'Other') {
                    setTitleInput('');
                    setTask(prev => ({ ...prev, title: '' }));
                  } else {
                    setTitleInput(e.target.value);
                    setTask(prev => ({ ...prev, title: e.target.value }));
                  }
                }}
                required
              >
                <option value="">Select a title...</option>
                {TITLE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {(titleInput === '' || !TITLE_OPTIONS.includes(titleInput)) && (
                <input
                  type="text"
                  id="titleInput"
                  className="form-control"
                  placeholder="Enter custom title"
                  value={titleInput}
                  onChange={handleTitleInput}
                  onBlur={handleTitleInputParse}
                  onKeyDown={handleTitleInputParse}
                  required
                />
              )}
            </>
          ) : (
            <>
              <input
                type="text"
                id="titleInput"
                className="form-control"
                placeholder="e.g. Buy groceries tomorrow at 5pm or just 'Buy groceries'"
                value={titleInput}
                onChange={handleTitleInput}
                onBlur={handleTitleInputParse}
                onKeyDown={handleTitleInputParse}
                required
              />
              <div className="form-text">You can enter a date/time in the title and we'll fill it for you!</div>
            </>
          )}
        </div>
        <textarea
          name="description"
          placeholder="Description"
          className="form-control mb-2"
          value={task.description}
          onChange={handleChange}
        />
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              type="date"
              name="dueDate"
              className="form-control"
              value={dueDate}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4 mb-2 d-flex align-items-center">
            <input
              type="checkbox"
              name="useTime"
              className="form-check-input me-2"
              checked={useTime}
              onChange={handleChange}
              id="useTimeCheckbox"
            />
            <label htmlFor="useTimeCheckbox" className="form-check-label">Set specific time?</label>
          </div>
          {useTime && (
            <div className="col-md-4 mb-2 d-flex gap-2 align-items-center">
              <select name="hour" className="form-select w-auto" value={hour} onChange={handleChange}>
                {Array.from({length: 12}, (_, i) => (i+1).toString().padStart(2, '0')).map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span>:</span>
              <select name="minute" className="form-select w-auto" value={minute} onChange={handleChange}>
                {Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select name="ampm" className="form-select w-auto" value={ampm} onChange={handleChange}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          )}
          <div className="col-md-4 mb-2">
            <select
              name="priority"
              className="form-select"
              value={task.priority}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            {isOtherSelected ? (
              <input
                type="text"
                name="category"
                className="form-control"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={handleCustomCategoryChange}
                required
              />
            ) : (
              <select
                name="category"
                className="form-select"
                value={task.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Recurrence</label>
            <select
              className="form-select"
              value={recurrenceType}
              onChange={(e) => setRecurrenceType(e.target.value)}
            >
              <option value="none">No Recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          {recurrenceType === 'custom' && (
            <div className="col-md-6">
              <label className="form-label">Every X days</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
              />
            </div>
          )}
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Remind me before due</label>
            <select
              className="form-select"
              value={reminderMinutesBefore ?? ''}
              onChange={e => setReminderMinutesBefore(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">No Reminder</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="180">3 hours</option>
              <option value="1440">1 day</option>
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Subtasks</label>
          {subtasks.map((sub, idx) => (
            <div className="input-group mb-1" key={idx}>
              <input
                type="text"
                className="form-control"
                placeholder={`Subtask ${idx + 1}`}
                value={sub.title}
                onChange={e => handleSubtaskChange(idx, 'title', e.target.value)}
                required
              />
              <div className="input-group-text">
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={e => handleSubtaskChange(idx, 'completed', e.target.checked)}
                />
              </div>
              <button type="button" className="btn btn-outline-danger" onClick={() => handleRemoveSubtask(idx)}>&times;</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline-secondary btn-sm mt-1" onClick={handleAddSubtask}>Add Subtask</button>
        </div>
        {usersUnderAdmin && (
          <div className="mb-3">
            <label className="form-label">Assign to</label>
            <select
              className="form-select"
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
            >
              <option value="">Self</option>
              {usersUnderAdmin.map(user => (
                <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>
        )}
        <div className="d-flex gap-2 mt-2">
          <button className={`btn ${editingTask ? 'btn-primary' : 'btn-success'}`} type="submit">
            {editingTask ? 'Update Task' : 'Add Task'}
          </button>
          {editingTask && (
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;