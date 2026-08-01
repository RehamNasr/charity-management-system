import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import Button from '@mui/material/Button';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES, getVisitNewPath } from '@constants/routes';

/** Simple navigation shortcuts to each module's own "add" entry point, rather than duplicating
 * any create form here. */
export function QuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      label: t('dashboard.quickActions.addCase'),
      icon: <PersonAddAltRoundedIcon />,
      onClick: () => void navigate(ROUTES.caseNew),
    },
    {
      label: t('dashboard.quickActions.addDonation'),
      icon: <VolunteerActivismRoundedIcon />,
      onClick: () => void navigate(ROUTES.donations),
    },
    {
      label: t('dashboard.quickActions.addExpense'),
      icon: <ReceiptLongRoundedIcon />,
      onClick: () => void navigate(ROUTES.expenses),
    },
    {
      label: t('dashboard.quickActions.addVisit'),
      icon: <EventNoteRoundedIcon />,
      onClick: () => void navigate(getVisitNewPath()),
    },
  ];

  return (
    <Card variant="outlined">
      <CardHeader title={t('dashboard.quickActions.title')} />
      <CardContent>
        <Grid container spacing={1.5}>
          {actions.map((action) => (
            <Grid key={action.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={action.icon}
                onClick={action.onClick}
                sx={{ py: 1.25 }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
