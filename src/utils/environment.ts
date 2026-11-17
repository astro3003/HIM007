/**
 * Storefront edit mode is permanently disabled so the live website stays 100% read-only.
 * All storefront content, pricing, and product imagery updates are managed in source code and shipped via builds.
 */
export const isAIStudioEditMode = (_isAdminActive: boolean = false): boolean => {
  return false;
};
