import type { CityLookupItem, LookupItem } from '@types-app/lookup';
import type { LookupCollectionName } from '@services/lookup.service';

export const DEFAULT_GOVERNORATES: (LookupItem & { id: string })[] = [
  { id: 'cairo', name: 'القاهرة', order: 1, isActive: true },
  { id: 'giza', name: 'الجيزة', order: 2, isActive: true },
  { id: 'alexandria', name: 'الإسكندرية', order: 3, isActive: true },
  { id: 'qalyubia', name: 'القليوبية', order: 4, isActive: true },
  { id: 'sharqia', name: 'الشرقية', order: 5, isActive: true },
  { id: 'daqahlia', name: 'الدقهلية', order: 6, isActive: true },
  { id: 'beheira', name: 'البحيرة', order: 7, isActive: true },
  { id: 'monufia', name: 'المنوفية', order: 8, isActive: true },
  { id: 'gharbia', name: 'الغربية', order: 9, isActive: true },
  { id: 'kafr-el-sheikh', name: 'كفر الشيخ', order: 10, isActive: true },
  { id: 'fayoum', name: 'الفيوم', order: 11, isActive: true },
  { id: 'beni-suef', name: 'بني سويف', order: 12, isActive: true },
  { id: 'minya', name: 'المنيا', order: 13, isActive: true },
  { id: 'assiut', name: 'أسيوط', order: 14, isActive: true },
  { id: 'sohag', name: 'سوهاج', order: 15, isActive: true },
  { id: 'qena', name: 'قنا', order: 16, isActive: true },
  { id: 'luxor', name: 'الأقصر', order: 17, isActive: true },
  { id: 'aswan', name: 'أسوان', order: 18, isActive: true },
  { id: 'port-said', name: 'بورسعيد', order: 19, isActive: true },
  { id: 'ismailia', name: 'الإسماعيلية', order: 20, isActive: true },
  { id: 'suez', name: 'السويس', order: 21, isActive: true },
  { id: 'north-sinai', name: 'شمال سيناء', order: 22, isActive: true },
  { id: 'south-sinai', name: 'جنوب سيناء', order: 23, isActive: true },
  { id: 'red-sea', name: 'البحر الأحمر', order: 24, isActive: true },
  { id: 'new-valley', name: 'الوادي الجديد', order: 25, isActive: true },
  { id: 'matrouh', name: 'مطروح', order: 26, isActive: true },
];

export const DEFAULT_CITIES: (CityLookupItem & { id: string })[] = [
  // القاهرة
  { id: 'cairo-1', governorateId: 'cairo', name: 'وسط البلد', order: 1, isActive: true },
  { id: 'cairo-2', governorateId: 'cairo', name: 'مدينة نصر', order: 2, isActive: true },
  { id: 'cairo-3', governorateId: 'cairo', name: 'المعادي', order: 3, isActive: true },
  { id: 'cairo-4', governorateId: 'cairo', name: 'مصر الجديدة', order: 4, isActive: true },
  { id: 'cairo-5', governorateId: 'cairo', name: 'شبرا', order: 5, isActive: true },
  { id: 'cairo-6', governorateId: 'cairo', name: 'حلوان', order: 6, isActive: true },
  { id: 'cairo-7', governorateId: 'cairo', name: 'التجمع الخامس', order: 7, isActive: true },
  { id: 'cairo-8', governorateId: 'cairo', name: 'المقطم', order: 8, isActive: true },
  { id: 'cairo-9', governorateId: 'cairo', name: 'الزيتون', order: 9, isActive: true },
  { id: 'cairo-10', governorateId: 'cairo', name: 'عين شمس', order: 10, isActive: true },

  // الجيزة
  { id: 'giza-1', governorateId: 'giza', name: 'الدقي', order: 1, isActive: true },
  { id: 'giza-2', governorateId: 'giza', name: 'المهندسين', order: 2, isActive: true },
  { id: 'giza-3', governorateId: 'giza', name: 'الهرم', order: 3, isActive: true },
  { id: 'giza-4', governorateId: 'giza', name: 'فيصل', order: 4, isActive: true },
  { id: 'giza-5', governorateId: 'giza', name: '6 أكتوبر', order: 5, isActive: true },
  { id: 'giza-6', governorateId: 'giza', name: 'الشيخ زايد', order: 6, isActive: true },
  { id: 'giza-7', governorateId: 'giza', name: 'إمبابة', order: 7, isActive: true },
  { id: 'giza-8', governorateId: 'giza', name: 'العمرانية', order: 8, isActive: true },

  // الإسكندرية
  { id: 'alex-1', governorateId: 'alexandria', name: 'المنتزه', order: 1, isActive: true },
  { id: 'alex-2', governorateId: 'alexandria', name: 'شرق الإسكندرية', order: 2, isActive: true },
  { id: 'alex-3', governorateId: 'alexandria', name: 'وسط الإسكندرية', order: 3, isActive: true },
  { id: 'alex-4', governorateId: 'alexandria', name: 'غرب الإسكندرية', order: 4, isActive: true },
  { id: 'alex-5', governorateId: 'alexandria', name: 'العجمي', order: 5, isActive: true },
  { id: 'alex-6', governorateId: 'alexandria', name: 'العامرية', order: 6, isActive: true },
];

export const DEFAULT_CASE_TYPES: (LookupItem & { id: string })[] = [
  { id: 'orphans', name: 'كفالة أيتام', order: 1, isActive: true },
  { id: 'monthly-assistance', name: 'إعانة شهرية', order: 2, isActive: true },
  { id: 'medical', name: 'علاج ومستلزمات طبية', order: 3, isActive: true },
  { id: 'debt-relief', name: 'سداد ديون / غارمات', order: 4, isActive: true },
  { id: 'marriage', name: 'تجهيز يتيمات / زواج', order: 5, isActive: true },
  { id: 'housing', name: 'ترميم وتجهيز منازل', order: 6, isActive: true },
  { id: 'food-packs', name: 'كرتونة إطعام / مواد غذائية', order: 7, isActive: true },
  { id: 'emergency', name: 'مساعدات طارئة', order: 8, isActive: true },
];

export const DEFAULT_LOOKUPS: Record<LookupCollectionName, (LookupItem & { id: string })[]> = {
  governorates: DEFAULT_GOVERNORATES,
  cities: DEFAULT_CITIES,
  caseTypes: DEFAULT_CASE_TYPES,
};
