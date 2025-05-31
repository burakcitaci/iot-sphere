
interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
      case 'Active':
      case 'Online':
        return 'bg-green-300 text-green-800';
      case 'In Process':
      case 'Running':
        return 'bg-blue-100 text-blue-800';
      case 'Review':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offline':
      case 'Error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 h-6 w-2 rounded text-xs font-medium ${getStatusStyle(status)}`}>
      
    </span>
  );
};
