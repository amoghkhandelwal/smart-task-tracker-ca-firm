import React from 'react';

const TaskFilters = ({
  filters,
  categories,
  onChange,
  onSearch,
  onReset
}) => {
  return (
    <div className="card p-3 mb-4 shadow-sm">
      <div className="row g-2 align-items-end">
        <div className="col-md-2">
          <label className="form-label mb-1">Priority</label>
          <select
            className="form-select"
            name="priority"
            value={filters.priority}
            onChange={onChange}
          >
            <option value="">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label mb-1">Category</label>
          <select
            className="form-select"
            name="category"
            value={filters.category}
            onChange={onChange}
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label mb-1">Status</label>
          <select
            className="form-select"
            name="status"
            value={filters.status}
            onChange={onChange}
          >
            <option value="">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label mb-1">Sort By</label>
          <select
            className="form-select"
            name="sortBy"
            value={filters.sortBy}
            onChange={onChange}
          >
            <option value="">None</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="dueDate-desc">Due Date (Newest)</option>
            <option value="dueDate-asc">Due Date (Oldest)</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label mb-1">Search</label>
          <input
            type="text"
            className="form-control"
            name="search"
            value={filters.search}
            onChange={onChange}
            placeholder="Title or description..."
          />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <div className="d-flex w-100 gap-2">
            <button className="btn btn-primary flex-fill" onClick={onSearch} type="button">Search</button>
            <button className="btn btn-outline-secondary flex-fill" onClick={onReset} type="button">Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters; 