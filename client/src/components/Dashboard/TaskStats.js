import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskStats = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.isCompleted).length;
  const pending = total - completed;

  const data = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completed, pending],
        backgroundColor: ['#43cea2', '#185a9d'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="row mb-4">
      <div className="col-md-3 mb-2">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h6 className="text-muted">Total Tasks</h6>
            <h3>{total}</h3>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-2">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h6 className="text-muted">Completed</h6>
            <h3 className="text-success">{completed}</h3>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-2">
        <div className="card text-center shadow-sm">
          <div className="card-body">
            <h6 className="text-muted">Pending</h6>
            <h3 className="text-warning">{pending}</h3>
          </div>
        </div>
      </div>
      <div className="col-md-3 mb-2 d-flex align-items-center justify-content-center">
        <div style={{width: '100px', height: '100px'}}>
          <Pie data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default TaskStats; 