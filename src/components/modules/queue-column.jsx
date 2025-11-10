import { memo } from "react";
import TaskCard from "../elements/card";

const QueueColumn = memo(({ title, tasks, color, description }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <span className={`w-3 h-3 ${color} rounded-full`}></span>
      {title}
    </h2>
    <div className="min-h-[300px]">
      {tasks.length === 0 ? (
        <div className="text-gray-500 text-center mt-10">Empty</div>
      ) : (
        tasks.map(task => <TaskCard key={task.id} task={task} />)
      )}
    </div>
    <div className="text-xs text-gray-400 mt-4">{description}</div>
  </div>
));

QueueColumn.displayName = 'QueueColumn';

export default QueueColumn;