import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import type { Visit } from '@types-app/visit';
import { VisitStatusBadge, VisitTypeBadge, RecommendationBadge, PriorityBadge } from './VisitBadges';
import { formatCurrency } from '@utils/formatters';

interface VisitOverviewTabProps {
  visit: Visit;
}

export function VisitOverviewTab({ visit }: VisitOverviewTabProps) {
  const visitDateStr = visit.visitDate?.toDate
    ? visit.visitDate.toDate().toLocaleDateString('ar-EG')
    : '-';
  const nextVisitDateStr = visit.nextVisitDate?.toDate
    ? visit.nextVisitDate.toDate().toLocaleDateString('ar-EG')
    : null;

  const mapUrl =
    visit.latitude && visit.longitude
      ? `https://maps.google.com/?q=${visit.latitude},${visit.longitude}`
      : null;

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {/* Key Information Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
              معلومات الزيارة الرئيسية
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  رقم الزيارة
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {visit.visitNumber}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  تاريخ الزيارة
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarTodayIcon fontSize="small" color="action" />
                  <Typography variant="subtitle1">{visitDateStr}</Typography>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  حالة الزيارة
                </Typography>
                <VisitStatusBadge status={visit.status} size="medium" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  نوع الزيارة
                </Typography>
                <VisitTypeBadge type={visit.visitType} size="medium" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  الأولوية
                </Typography>
                <PriorityBadge priority={visit.priority} size="medium" />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  الباحث الاجتماعي
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="subtitle1">{visit.researcherName}</Typography>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              ملخص الزيارة:
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {visit.summary}
            </Typography>
          </Paper>
        </Grid>

        {/* Case & Recommendation Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                  الحالة المستفيدة
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FolderIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {visit.beneficiaryName}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    رقم الحالة: <strong>{visit.caseNumber}</strong>
                  </Typography>
                  {visit.familyMembersCount && (
                    <Typography variant="body2" color="text.secondary">
                      عدد الأفراد: <strong>{visit.familyMembersCount}</strong>
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                  التوصية والقرار
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    التوصية
                  </Typography>
                  <RecommendationBadge recommendation={visit.recommendation} size="medium" />
                </Box>

                {visit.suggestedAmount ? (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      المبلغ المقترح
                    </Typography>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {formatCurrency(visit.suggestedAmount)}
                    </Typography>
                  </Box>
                ) : null}

                {nextVisitDateStr && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      موعد الزيارة القادمة
                    </Typography>

                    <Typography variant="subtitle2" color="warning.main" fontWeight="bold">
                      {nextVisitDateStr}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Location & Address Card */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
              العنوان وموقع GPS
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="body1" mb={1}>
                  {/* An empty (but set) address details string should show this placeholder too. */}
                  {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                  {visit.address?.details || 'لم يتم تسجيل تفاصيل العنوان'}
                </Typography>

                {visit.latitude && visit.longitude && (
                  <Typography variant="body2" color="text.secondary">
                    إحداثيات GPS: <strong>{visit.latitude}, {visit.longitude}</strong>
                  </Typography>
                )}
              </Grid>

              {mapUrl && (
                <Grid size={{ xs: 12, md: 4 }} textAlign={{ xs: 'left', md: 'right' }}>
                  <Button
                    component="a"
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    startIcon={<LocationOnIcon />}
                  >
                    عرض على خرائط Google
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
