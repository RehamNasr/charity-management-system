import { create } from 'zustand';

/**
 * The currently selected case, shared across panels that need cross-panel context (e.g. a case
 * detail layout with multiple tabs/panels reading the same case id). Set by the cases module
 * once it exists; not the source of truth for case data itself, which stays in Firestore.
 */
interface SelectedCaseState {
  caseId: string | null;
  setSelectedCase: (caseId: string | null) => void;
}

export const useSelectedCaseStore = create<SelectedCaseState>((set) => ({
  caseId: null,
  setSelectedCase: (caseId) => {
    set({ caseId });
  },
}));
