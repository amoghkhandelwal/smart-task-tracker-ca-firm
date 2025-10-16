import React from 'react';
import { FaRedo } from 'react-icons/fa';

function getDueBadge(task) {
  if (!task.dueDate) return { color: 'secondary', label: 'No Due Date' };
  const now = new Date();
  const due = new Date(task.dueDate);
  if (!task.isCompleted && due < now) {
    return { color: 'danger', label: 'Overdue' };
  } else if (!task.isCompleted && due >= now && (due - now) / (1000 * 60 * 60 * 24) <= 3) {
    return { color: 'warning', label: 'Due Soon' };
  } else {
    return { color: 'secondary', label: 'Scheduled' };
  }
}

function formatDueDate(dueDate) {
  if (!dueDate) return 'N/A';
  const d = new Date(dueDate);
  const dateStr = d.toISOString().slice(0, 10);
  const timeStr = d.toISOString().slice(11, 16);
  if (timeStr === '00:00') return d.toLocaleDateString();
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

const TaskList = ({ tasks, onEdit, onDelete, onToggleComplete, onToggleSubtask, currentUser }) => {
  console.log('Current user in TaskList:', currentUser);
  if (!tasks.length) return <p className="text-muted">No tasks yet. Add some!</p>;

  return (
    <div className="row">
      {tasks.map((task) => {
        console.log('Task:', task);
        const dueBadge = getDueBadge(task);

        // Permission logic
        const isAdminAssigned = !!task.assignedBy;
        const isAssignee = currentUser && currentUser.userId == (task.assignedTo && task.assignedTo.toString());
        const isAdmin = currentUser && currentUser.userId == (task.user && task.user.toString());

        // Edit: Only admin (creator) can edit
        const canEdit = isAdmin;

        // Delete: Admin can always delete; user can delete only if both have completed (for admin-assigned), or if it's their own task
        const canDelete = (isAdminAssigned && isAdmin) || (isAssignee && isAdminAssigned && task.userCompleted && task.adminCompleted) || (isAssignee && !isAdminAssigned);

        // Complete: Admin or assignee can mark complete
        const canToggleComplete = isAdmin || isAssignee;

        return (
          <div className="col-md-6 mb-4" key={task._id}>
            <div
              className={`card shadow-sm border-${
                task.priority === 'High'
                  ? 'danger'
                  : task.priority === 'Low'
                  ? 'success'
                  : 'warning'
              } ${task.isCompleted ? 'text-muted' : ''}`}
            >
              <div className="card-body">
                <h5 className="card-title">
                  {task.title}
                  {task.assignedBy && (
                    <span className="badge bg-primary ms-2" title="Assigned by Admin">A</span>
                  )}
                </h5>
                <p className="card-text">{task.description}</p>
                {/* Subtasks checklist */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mb-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong>Subtasks:</strong>
                      <small className="text-muted">
                        {task.subtasks.filter(sub => sub.completed).length}/{task.subtasks.length} complete
                      </small>
                    </div>
                    <ul className="list-group list-group-flush">
                      {task.subtasks.map((sub, idx) => (
                        <li key={idx} className="list-group-item d-flex align-items-center p-1">
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={sub.completed}
                            onChange={() => onToggleSubtask && onToggleSubtask(task._id, idx, !sub.completed)}
                            disabled={task.isCompleted || !canToggleComplete}
                          />
                          <span className={sub.completed ? 'text-decoration-line-through text-muted' : ''}>{sub.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="d-flex align-items-center mb-2">
                  <span className="text-muted me-2">
                    Due: {formatDueDate(task.dueDate)}
                  </span>
                  <span className={`badge bg-${dueBadge.color}`}>{dueBadge.label}</span>
                </div>

                <div className="d-flex gap-2 justify-content-end flex-wrap">
                  <button
                    className={`btn btn-sm ${
                      task.isCompleted ? 'btn-outline-secondary' : 'btn-outline-success'
                    }`}
                    onClick={() => onToggleComplete(task._id, task.isCompleted)}
                    disabled={!canToggleComplete}
                  >
                    {task.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onEdit(task)}
                    disabled={!canEdit}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => onDelete(task._id)}
                    disabled={!canDelete}
                  >
                    Delete
                  </button>
                </div>
                {/* Status badge for waiting admin confirmation */}
                {isAdminAssigned && task.userCompleted && !task.adminCompleted && (
                  <span className="badge bg-warning mt-2">Waiting for admin confirmation</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;
