import Chip from '@mui/material/Chip';
import { CASE_PRIORITY_COLORS, CASE_PRIORITY_LABELS_AR } from '@constants/caseStatus';
import type { CasePriority } from '@types-app/case';

interface CasePriorityChipProps {
  priority: CasePriority;
}

export function CasePriorityChip({ priority }: CasePriorityChipProps) {
  return (
    <Chip
      label={CASE_PRIORITY_LABELS_AR[priority]}
      color={CASE_PRIORITY_COLORS[priority]}
      size="small"
      variant="outlined"
    />
  );
}
