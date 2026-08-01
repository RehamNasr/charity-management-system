import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@components/common';
import { BeneficiaryReportTab } from '../components/BeneficiaryReportTab';
import { DonorStatementTab } from '../components/DonorStatementTab';
import { IncomeReportTab } from '../components/IncomeReportTab';
import { ExpenseReportTab } from '../components/ExpenseReportTab';
import { MonthlyReportTab } from '../components/MonthlyReportTab';
import { AnnualReportTab } from '../components/AnnualReportTab';

type ReportTabKey = 'beneficiary' | 'donorStatement' | 'income' | 'expense' | 'monthly' | 'annual';

export function ReportsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ReportTabKey>('beneficiary');

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.reports')} description={t('reports.description')} />

      <Box borderBottom={1} borderColor="divider">
        <Tabs
          value={activeTab}
          onChange={(_e, value: ReportTabKey) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('reports.tabs.beneficiary')} value="beneficiary" />
          <Tab label={t('reports.tabs.donorStatement')} value="donorStatement" />
          <Tab label={t('reports.tabs.income')} value="income" />
          <Tab label={t('reports.tabs.expense')} value="expense" />
          <Tab label={t('reports.tabs.monthly')} value="monthly" />
          <Tab label={t('reports.tabs.annual')} value="annual" />
        </Tabs>
      </Box>

      {activeTab === 'beneficiary' && <BeneficiaryReportTab />}
      {activeTab === 'donorStatement' && <DonorStatementTab />}
      {activeTab === 'income' && <IncomeReportTab />}
      {activeTab === 'expense' && <ExpenseReportTab />}
      {activeTab === 'monthly' && <MonthlyReportTab />}
      {activeTab === 'annual' && <AnnualReportTab />}
    </Stack>
  );
}
