import { useConfirmDialogStore, type ConfirmOptions } from '@store/confirmDialogStore';

/**
 * Imperative confirmation dialog: `const confirm = useConfirm(); if (await confirm({...})) { ... }`.
 * Backed by a single app-level `<ConfirmDialog />` (see components/common) so every destructive
 * action in the app shares one consistent dialog instead of each feature rolling its own.
 */
export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  return useConfirmDialogStore((state) => state.request);
}
