import { TASK_COLORS } from "../../utils/constants";

const TaskCard = ({ task }) => (
  <div
    className={`${
      TASK_COLORS[task.type]
    } border-2 rounded-lg p-3 mb-2 shadow-lg transition-all duration-300 hover:scale-105`}
  >
    <div className="text-white font-semibold text-sm">{task.name}</div>
    <div className="text-white text-xs opacity-75 mt-1">{task.type}</div>
  </div>
);
TaskCard.displayName = "TaskCard";

export default TaskCard;
