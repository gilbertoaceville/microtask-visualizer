import { QUEUE_TYPES } from "../../utils/constants";

const LogEntry = ({ log }) => (
  <div className="mb-1">
    <span className="text-gray-500">[{log.timestamp}]</span>
    <span
      className={`ml-2 ${
        log.type === QUEUE_TYPES.SYNC
          ? "text-gray-400"
          : log.type === QUEUE_TYPES.MICROTASK
          ? "text-blue-400"
          : "text-orange-400"
      }`}
    >
      {log.message}
    </span>
  </div>
);

export default LogEntry;