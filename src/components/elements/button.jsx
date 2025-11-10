const ControlButton = ({
  onClick,
  disabled,
  icon: Icon,
  children,
  className = "",
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed ${className}`}
  >
    {Icon && <Icon size={16} />}
    {children}
  </button>
);

export default ControlButton;