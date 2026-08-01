import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import NotesIcon from '@mui/icons-material/Notes';
import type { Visit } from '@types-app/visit';

interface VisitReportTabProps {
  visit: Visit;
}

export function VisitReportTab({ visit }: VisitReportTabProps) {
  const report = visit.fullReport ?? {};

  const sections = [
    {
      title: 'الحالة المعيشية والسكن',
      icon: <HomeIcon color="primary" />,
      content: report.livingConditions,
    },
    {
      title: 'الوضع الوظيفي والعمل',
      icon: <WorkIcon color="primary" />,
      content: report.employmentStatus,
    },
    {
      title: 'التحقق من الدخل والمصادر',
      icon: <AttachMoneyIcon color="primary" />,
      content: report.incomeVerification,
    },
    {
      title: 'الحالة الصحية',
      icon: <LocalHospitalIcon color="primary" />,
      content: report.healthStatus,
    },
    {
      title: 'وضع الأبناء والتعليم',
      icon: <SchoolIcon color="primary" />,
      content: report.childrenStatus,
    },
    {
      title: 'ملاحظات إضافية',
      icon: <NotesIcon color="primary" />,
      content: report.additionalNotes,
    },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">
        التقرير الميداني التفصيلي
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        نتائج البحث الاجتماعي الميداني والتدقيق المعيشي والصحي للأسرة
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {sections.map((sec, idx) => (
          <Grid size={{ xs: 12, md: 6 }} key={idx}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                  {sec.icon}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {sec.title}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: sec.content ? 'text.primary' : 'text.secondary' }}>
                  {/* An empty string should show the placeholder too, matching the `color` check above. */}
                  {/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
                  {sec.content || 'غير محدد'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
