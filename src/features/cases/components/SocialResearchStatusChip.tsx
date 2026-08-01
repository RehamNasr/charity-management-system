import Chip from '@mui/material/Chip';
import {
  SOCIAL_RESEARCH_STATUS_COLORS,
  SOCIAL_RESEARCH_STATUS_LABELS_AR,
} from '@constants/caseStatus';
import type { SocialResearchStatus } from '@types-app/case';

interface SocialResearchStatusChipProps {
  status: SocialResearchStatus;
}

export function SocialResearchStatusChip({ status }: SocialResearchStatusChipProps) {
  return (
    <Chip
      label={SOCIAL_RESEARCH_STATUS_LABELS_AR[status]}
      color={SOCIAL_RESEARCH_STATUS_COLORS[status]}
      size="small"
    />
  );
}
