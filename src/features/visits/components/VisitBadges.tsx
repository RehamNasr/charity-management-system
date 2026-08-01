import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import type { VisitStatus, VisitType, VisitRecommendation, VisitPriority } from '@types-app/visit';

interface StatusBadgeProps {
  status: VisitStatus;
  size?: 'small' | 'medium';
}

export function VisitStatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const { t } = useTranslation();

  const colorMap: Record<VisitStatus, 'info' | 'success' | 'error' | 'warning'> = {
    scheduled: 'info',
    completed: 'success',
    cancelled: 'error',
    missed: 'warning',
  };

  return (
    <Chip label={t(`visits.statuses.${status}`)} color={colorMap[status]} size={size} />
  );
}

interface TypeBadgeProps {
  type: VisitType;
  size?: 'small' | 'medium';
}

export function VisitTypeBadge({ type, size = 'small' }: TypeBadgeProps) {
  const { t } = useTranslation();

  return (
    <Chip
      label={t(`visits.types.${type}`)}
      color="primary"
      variant="outlined"
      size={size}
    />
  );
}

interface RecommendationBadgeProps {
  recommendation: VisitRecommendation;
  size?: 'small' | 'medium';
}

export function RecommendationBadge({ recommendation, size = 'small' }: RecommendationBadgeProps) {
  const { t } = useTranslation();

  const colorMap: Record<VisitRecommendation, 'success' | 'error' | 'warning' | 'info' | 'secondary' | 'default'> = {
    approve: 'success',
    reject: 'error',
    need_more_documents: 'warning',
    need_another_visit: 'info',
    increase_assistance: 'success',
    reduce_assistance: 'warning',
    suspend_case: 'error',
    close_case: 'default',
  };

  return (
    <Chip
      label={t(`visits.recommendations.${recommendation}`)}
      color={colorMap[recommendation]}
      size={size}
    />
  );
}

interface PriorityBadgeProps {
  priority: VisitPriority;
  size?: 'small' | 'medium';
}

export function PriorityBadge({ priority, size = 'small' }: PriorityBadgeProps) {
  const { t } = useTranslation();

  const colorMap: Record<VisitPriority, 'default' | 'info' | 'warning' | 'error'> = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    urgent: 'error',
  };

  return (
    <Chip
      label={t(`visits.priorities.${priority}`)}
      color={colorMap[priority]}
      size={size}
      variant="outlined"
    />
  );
}
