/**
 * Passive / Invisible Bot Protection Client Helper
 * Supports Google reCAPTCHA v3 (Recommended) and Cloudflare Turnstile.
 * Runs silently in the background — no puzzle, checkbox, or friction for human users.
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      execute: (container?: string | HTMLElement, options?: any) => Promise<string> | void;
    };
  }
}

let recaptchaScriptLoaded = false;
let recaptchaScriptPromise: Promise<void> | null = null;

function loadRecaptchaScript(siteKey: string): Promise<void> {
  if (recaptchaScriptLoaded || typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (recaptchaScriptPromise) {
    return recaptchaScriptPromise;
  }

  recaptchaScriptPromise = new Promise((resolve) => {
    // Check if script tag is already in DOM
    const existing = document.querySelector(`script[src*="google.com/recaptcha/api.js"]`);
    if (existing) {
      recaptchaScriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      recaptchaScriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      console.warn('reCAPTCHA v3 script failed to load, continuing without token');
      resolve();
    };
    document.head.appendChild(script);
  });

  return recaptchaScriptPromise;
}

/**
 * Execute passive bot detection and retrieve token.
 * Returns null if disabled, missing keys, or during failures (fail-open client policy).
 */
export async function getBotProtectionToken(action: string = 'login'): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const recaptchaEnabled = process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED !== 'false';
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  // Option A: Google reCAPTCHA v3
  if (recaptchaEnabled && recaptchaSiteKey) {
    try {
      await loadRecaptchaScript(recaptchaSiteKey);

      if (window.grecaptcha) {
        return await new Promise<string | null>((resolve) => {
          window.grecaptcha?.ready(async () => {
            try {
              const token = await window.grecaptcha?.execute(recaptchaSiteKey, { action });
              resolve(token || null);
            } catch (err) {
              console.warn('reCAPTCHA execution error:', err);
              resolve(null);
            }
          });
        });
      }
    } catch (err) {
      console.warn('reCAPTCHA v3 execution failed:', err);
      return null;
    }
  }

  // Option B: Cloudflare Turnstile (if enabled and site key configured)
  const turnstileEnabled = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === 'true';
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (turnstileEnabled && turnstileSiteKey && window.turnstile) {
    try {
      // If turnstile already initialized
      const token = await window.turnstile.execute();
      if (typeof token === 'string') {
        return token;
      }
    } catch (err) {
      console.warn('Cloudflare Turnstile execution failed:', err);
      return null;
    }
  }

  // If bot protection is disabled or unconfigured, return null
  return null;
}
