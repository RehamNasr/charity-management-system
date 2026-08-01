import Chip from '@mui/material/Chip';
import { CASE_STATUS_COLORS, CASE_STATUS_LABELS_AR } from '@constants/caseStatus';
import type { CaseStatus } from '@types-app/case';

interface CaseStatusChipProps {
  status: CaseStatus;
}

export function CaseStatusChip({ status }: CaseStatusChipProps) {
  return (
    <Chip label={CASE_STATUS_LABELS_AR[status]} color={CASE_STATUS_COLORS[status]} size="small" />
  );
}
