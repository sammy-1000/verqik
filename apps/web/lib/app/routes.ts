export const APP_HOME_PATH = "/app";
export const APP_BROWSE_PATH = "/app/browse";
export const APP_PROFILE_PATH = "/app/profile";

export function appBookPath(journeyId: string) {
  return `/app/book/${journeyId}`;
}
