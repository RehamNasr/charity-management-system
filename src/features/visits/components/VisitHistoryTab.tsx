import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RecommendedIcon from '@mui/icons-material/ThumbUp';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslation } from 'react-i18next';
import { useVisitHistory } from '../hooks/useVisitHistory';
import { LoadingSpinner, EmptyState } from '@components/common';
import type { VisitEventType } from '@types-app/visit';

interface VisitHistoryTabProps {
  visitId: string;
}

export function VisitHistoryTab({ visitId }: VisitHistoryTabProps) {
  const { t } = useTranslation();
  const { events, loading } = useVisitHistory(visitId);

  const getEventIcon = (type: VisitEventType) => {
    switch (type) {
      case 'visit_created':
        return <EventNoteIcon color="primary" />;
      case 'report_updated':
        return <EditNoteIcon color="info" />;
      case 'recommendation_changed':
        return <RecommendedIcon color="success" />;
      case 'attachment_uploaded':
      case 'attachment_deleted':
        return <AttachFileIcon color="warning" />;
      case 'status_changed':
        return <ChangeCircleIcon color="secondary" />;
      default:
        return <EventNoteIcon color="action" />;
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" gutterBottom fontWeight="bold">
        {t('visits.history.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        السجل التاريخي الشامل للتغييرات والعمليات المنفذة على الزيارة
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <EmptyState title={t('visits.history.empty')} />
      ) : (
        <Stack spacing={3} sx={{ position: 'relative', pl: { xs: 2, sm: 4 } }}>
          {/* Vertical line connecting events */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              bottom: 16,
              left: { xs: 24, sm: 40 },
              width: 2,
              bgcolor: 'divider',
              zIndex: 0,
            }}
          />

          {events.map((event) => {
            const timeStr = event.timestamp?.toDate
              ? event.timestamp.toDate().toLocaleString('ar-EG')
              : 'الآن';

            return (
              <Stack
                key={event.id}
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{ position: 'relative', zIndex: 1 }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'divider',
                    width: 44,
                    height: 44,
                  }}
                >
                  {getEventIcon(event.eventType)}
                </Avatar>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    flexGrow: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {t(`visits.history.events.${event.eventType}`, event.description)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {timeStr}
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {event.description}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      بواسطة: <strong>{event.performedByName || 'الباحث الاجتماعي'}</strong>
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
