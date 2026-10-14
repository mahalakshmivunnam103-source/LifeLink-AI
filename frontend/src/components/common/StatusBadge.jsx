import React from 'react';
import { getStatusBadgeStyle, getUrgencyColor } from '../../utils/formatters';

export const StatusBadge = ({ status, type = 'status' }) => {
  if (!status) return null;

  const style =
    type === 'urgency' ? getUrgencyColor(status) : getStatusBadgeStyle(status);

  return (
    <span
      className="badge"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: style.text,
          display: 'inline-block',
        }}
      />
      {status}
    </span>
  );
};

export default StatusBadge;
