/**
 * Helper to determine whether the app is currently running in AI Studio / Development edit mode,
 * or if it is running as a published live production storefront.
 * 
 * In AI Studio / Dev Mode:
 * - Pre-publish image management tools, floating quick pills, and upload handles are accessible.
 * 
 * On Published / Production Site:
 * - All pre-publish edit options, badges, and upload triggers are hidden from regular visitors.
 * - Store owner can still access HQ tools by logging in via the Admin Security PIN.
 */

export const isAIStudioEditMode = (isAdminActive: boolean = false): boolean => {
  // If the user has authenticated as the store admin, allow editing
  if (isAdminActive) return true;

  if (typeof window === 'undefined') return false;

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('studio_edit') === 'true' || params.get('edit_mode') === 'true') {
      return true;
    }
    if (params.get('preview_mode') === 'published') {
      return false;
    }

    const host = window.location.hostname.toLowerCase();
    
    // AI Studio Dev environment URL pattern or local development
    const isDevHost = host.includes('ais-dev-') || 
                      host === 'localhost' || 
                      host === '127.0.0.1';

    // Check if inside AI Studio iframe during development
    const isIframe = window.self !== window.top;
    const isDevEnv = Boolean((import.meta as unknown as { env?: { DEV?: boolean } })?.env?.DEV);

    return isDevHost || (isIframe && isDevEnv);
  } catch {
    return false;
  }
};
