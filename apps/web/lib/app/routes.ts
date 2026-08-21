export const APP_HOME_PATH = "/app";
export const APP_BROWSE_PATH = "/app/browse";
export const APP_PROFILE_PATH = "/app/profile";
export const APP_VERIFICATION_PATH = "/app/verification";

export function appBookPath(journeyId: string) {
  return `/app/book/${journeyId}`;
}

export const APP_TRAVELS_PATH = "/app?tab=travels";
