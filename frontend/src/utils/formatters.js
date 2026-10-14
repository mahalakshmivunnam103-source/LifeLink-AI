export const formatDistance = (km) => {
  if (km === undefined || km === null) return 'N/A';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Not recorded';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'Not recorded';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const maskPhone = (phone) => {
  if (!phone) return 'Confidential';
  const str = String(phone).trim();
  if (str.length < 8) return 'Protected';
  return `${str.slice(0, 5)}*****${str.slice(-2)}`;
};

export const getUrgencyColor = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case 'critical':
      return { bg: '#fee2e2', text: '#991b1b', border: '#f87171' };
    case 'high':
      return { bg: '#ffedd5', text: '#9a3412', border: '#fb923c' };
    case 'medium':
      return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
    case 'low':
    default:
      return { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' };
  }
};

export const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'verified':
    case 'fulfilled':
    case 'accepted':
    case 'confirmed':
      return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
    case 'pending':
    case 'contacted':
    case 'inquired':
      return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' };
    case 'rejected':
    case 'cancelled':
    case 'declined':
    case 'unavailable':
      return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
    default:
      return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  }
};
