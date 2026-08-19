/** Client → server RPC events (mirror REST endpoints) */
export const GatewayEvents = {
  // Meta
  PING: 'ping',
  RPC: 'rpc',

  // Rooms
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',

  // Auth (public)
  AUTH_REGISTER: 'auth:register',
  AUTH_LOGIN: 'auth:login',

  // Health / reference (public)
  HEALTH_CHECK: 'health:check',
  REFERENCE_COUNTRIES: 'reference:countries',

  // Users
  USERS_ME_GET: 'users:me:get',
  USERS_ME_UPDATE: 'users:me:update',
  USERS_ADDRESSES_LIST: 'users:addresses:list',
  USERS_ADDRESSES_CREATE: 'users:addresses:create',

  // RBAC
  RBAC_ROLES_LIST: 'rbac:roles:list',

  // Files
  FILES_UPLOAD_URL: 'files:upload-url',
  FILES_CONFIRM: 'files:confirm',
  FILES_DOWNLOAD_URL: 'files:download-url',
  FILES_DELETE: 'files:delete',

  // Journeys
  JOURNEYS_CREATE: 'journeys:create',
  JOURNEYS_SEARCH: 'journeys:search',
  JOURNEYS_CANCEL: 'journeys:cancel',

  // Delivery
  DELIVERY_CATEGORIES: 'delivery:categories',
  DELIVERY_REQUESTS_CREATE: 'delivery:requests:create',
  DELIVERY_REQUESTS_LIST: 'delivery:requests:list',
  DELIVERY_REQUESTS_GET: 'delivery:requests:get',
  DELIVERY_REQUESTS_TRANSITION: 'delivery:requests:transition',

  // Payments
  PAYMENTS_WALLET: 'payments:wallet',
  PAYMENTS_TRANSACTIONS: 'payments:transactions',
  PAYMENTS_ESCROW_HOLD: 'payments:escrow:hold',
  PAYMENTS_ESCROW_RELEASE: 'payments:escrow:release',

  // Reviews
  REVIEWS_CREATE: 'reviews:create',
  REVIEWS_LIST: 'reviews:list',

  // Messaging
  MESSAGING_SEND: 'messaging:send',
  MESSAGING_LIST: 'messaging:list',

  // Disputes
  DISPUTES_RAISE: 'disputes:raise',
  DISPUTES_LIST: 'disputes:list',
  DISPUTES_RESOLVE: 'disputes:resolve',

  // Notifications
  NOTIFICATIONS_LIST: 'notifications:list',
  NOTIFICATIONS_READ: 'notifications:read',
} as const;

export type GatewayEvent =
  (typeof GatewayEvents)[keyof typeof GatewayEvents];

/** Server → client push events */
export const PushEvents = {
  CONNECTED: 'connected',
  PONG: 'pong',
  RPC_RESULT: 'rpc:result',
  RPC_ERROR: 'rpc:error',
  NOTIFICATION_NEW: 'notification:new',
  MESSAGE_NEW: 'message:new',
  DELIVERY_STATUS_CHANGED: 'delivery:status-changed',
  DELIVERY_REQUEST_CREATED: 'delivery:request-created',
  PAYMENT_UPDATED: 'payment:updated',
  JOURNEY_UPDATED: 'journey:updated',
  USER_UPDATED: 'user:updated',
} as const;

/** Events that do not require authentication */
export const PUBLIC_EVENTS = new Set<string>([
  GatewayEvents.PING,
  GatewayEvents.AUTH_REGISTER,
  GatewayEvents.AUTH_LOGIN,
  GatewayEvents.HEALTH_CHECK,
  GatewayEvents.REFERENCE_COUNTRIES,
]);

/** Required RBAC permission per event */
export const EVENT_PERMISSIONS: Partial<Record<string, string[]>> = {
  [GatewayEvents.USERS_ME_GET]: ['users:read'],
  [GatewayEvents.USERS_ME_UPDATE]: ['users:write'],
  [GatewayEvents.USERS_ADDRESSES_LIST]: ['users:read'],
  [GatewayEvents.USERS_ADDRESSES_CREATE]: ['users:write'],
  [GatewayEvents.RBAC_ROLES_LIST]: ['rbac:manage'],
  [GatewayEvents.FILES_UPLOAD_URL]: ['files:write'],
  [GatewayEvents.FILES_CONFIRM]: ['files:write'],
  [GatewayEvents.FILES_DOWNLOAD_URL]: ['files:read'],
  [GatewayEvents.FILES_DELETE]: ['files:write'],
  [GatewayEvents.JOURNEYS_CREATE]: ['journeys:write'],
  [GatewayEvents.JOURNEYS_SEARCH]: ['journeys:read'],
  [GatewayEvents.JOURNEYS_CANCEL]: ['journeys:write'],
  [GatewayEvents.DELIVERY_CATEGORIES]: ['delivery:read'],
  [GatewayEvents.DELIVERY_REQUESTS_CREATE]: ['delivery:write'],
  [GatewayEvents.DELIVERY_REQUESTS_LIST]: ['delivery:read'],
  [GatewayEvents.DELIVERY_REQUESTS_GET]: ['delivery:read'],
  [GatewayEvents.DELIVERY_REQUESTS_TRANSITION]: ['delivery:write'],
  [GatewayEvents.PAYMENTS_WALLET]: ['payments:read'],
  [GatewayEvents.PAYMENTS_TRANSACTIONS]: ['payments:read'],
  [GatewayEvents.PAYMENTS_ESCROW_HOLD]: ['payments:write'],
  [GatewayEvents.PAYMENTS_ESCROW_RELEASE]: ['payments:write'],
  [GatewayEvents.REVIEWS_CREATE]: ['delivery:write'],
  [GatewayEvents.REVIEWS_LIST]: ['delivery:read'],
  [GatewayEvents.MESSAGING_SEND]: ['delivery:write'],
  [GatewayEvents.MESSAGING_LIST]: ['delivery:read'],
  [GatewayEvents.DISPUTES_RAISE]: ['delivery:write'],
  [GatewayEvents.DISPUTES_LIST]: ['disputes:read'],
  [GatewayEvents.DISPUTES_RESOLVE]: ['disputes:manage'],
  [GatewayEvents.NOTIFICATIONS_LIST]: ['notifications:read'],
  [GatewayEvents.NOTIFICATIONS_READ]: ['notifications:write'],
  [GatewayEvents.ROOM_JOIN]: ['delivery:read'],
};
