import { CheckCircle, Clock, XCircle } from 'lucide-react';

const SoldBadge = ({ status, className = "" }) => {
  const getBadgeConfig = (status) => {
    switch (status) {
      case 'sold':
        return {
          icon: CheckCircle,
          text: 'Sold',
          className: 'bg-green-900 text-green-300 border-green-700',
          iconClassName: 'text-green-400'
        };
      case 'reserved':
        return {
          icon: Clock,
          text: 'Reserved',
          className: 'bg-yellow-900 text-yellow-300 border-yellow-700',
          iconClassName: 'text-yellow-400'
        };
      case 'available':
        return {
          icon: XCircle,
          text: 'Available',
          className: 'bg-blue-900 text-blue-300 border-blue-700',
          iconClassName: 'text-blue-400'
        };
      default:
        return {
          icon: XCircle,
          text: 'Available',
          className: 'bg-gray-900 text-gray-300 border-gray-700',
          iconClassName: 'text-gray-400'
        };
    }
  };

  const config = getBadgeConfig(status);
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      <Icon className={`h-3 w-3 ${config.iconClassName}`} />
      {config.text}
    </div>
  );
};

export default SoldBadge;
