import { motion } from 'framer-motion';

interface AnimatedRouteProps {
  origin: string;
  destination: string;
  compact?: boolean;
}

export const AnimatedRoute = ({ origin, destination, compact = false }: AnimatedRouteProps) => {
  const originCode = origin.slice(0, 3).toUpperCase();
  const destinationCode = destination.slice(0, 3).toUpperCase();

  return (
    <div className={compact ? 'route-rail route-rail-compact' : 'route-rail'}>
      <div className="route-stop">
        <span>{originCode}</span>
      </div>
      <div className="route-track">
        <div className="route-line" />
        <motion.span
          className="route-plane"
          animate={{ x: ['0%', '88%', '0%'] }}
          transition={{ duration: compact ? 5 : 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✈
        </motion.span>
      </div>
      <div className="route-stop route-stop-destination">
        <span>{destinationCode}</span>
      </div>
    </div>
  );
};
