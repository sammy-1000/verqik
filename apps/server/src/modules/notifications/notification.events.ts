import { NotificationChannel } from '@verqik/database';

/** Domain events that produce in-app notifications */
export enum NotificationEvent {
  DELIVERY_REQUEST_CREATED = 'delivery.request.created',
  DELIVERY_REQUEST_ACCEPTED = 'delivery.request.accepted',
  DELIVERY_REQUEST_REJECTED = 'delivery.request.rejected',
  DELIVERY_REQUEST_CANCELLED = 'delivery.request.cancelled',
  DELIVERY_PICKED_UP = 'delivery.picked_up',
  DELIVERY_IN_TRANSIT = 'delivery.in_transit',
  DELIVERY_DELIVERED = 'delivery.delivered',
  JOURNEY_CREATED = 'journey.created',
  JOURNEY_CANCELLED = 'journey.cancelled',
  JOURNEY_TRAVEL_UPDATED = 'journey.travel_updated',
  VERIFICATION_SUBMITTED = 'verification.submitted',
  VERIFICATION_APPROVED = 'verification.approved',
  VERIFICATION_REJECTED = 'verification.rejected',
  WELCOME = 'user.welcome',
}

export interface NotificationProcessPayload {
  userId: string;
  relatedId?: string;
  email?: string;
  meta?: Record<string, string | number | undefined>;
}

type NotificationTemplate = {
  title: string;
  body?: string;
  channel: NotificationChannel;
};

const TEMPLATES: Record<NotificationEvent, (meta?: NotificationProcessPayload['meta']) => NotificationTemplate> = {
  [NotificationEvent.DELIVERY_REQUEST_CREATED]: (m) => ({
    title: 'New delivery request',
    body: m?.senderName
      ? `${m.senderName} sent you a delivery request`
      : 'You received a new delivery request',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.DELIVERY_REQUEST_ACCEPTED]: () => ({
    title: 'Request accepted',
    body: 'Your delivery request was accepted by the traveler',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.DELIVERY_REQUEST_REJECTED]: () => ({
    title: 'Request rejected',
    body: 'Your delivery request was declined',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.DELIVERY_REQUEST_CANCELLED]: () => ({
    title: 'Request cancelled',
    body: 'A delivery request was cancelled',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.DELIVERY_PICKED_UP]: () => ({
    title: 'Package picked up',
    body: 'The traveler confirmed pickup of your package',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.DELIVERY_IN_TRANSIT]: () => ({
    title: 'In transit',
    body: 'Your package is now in transit',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.DELIVERY_DELIVERED]: () => ({
    title: 'Delivered',
    body: 'Your package was delivered successfully',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.JOURNEY_CREATED]: (m) => ({
    title: 'Journey published',
    body: m?.route
      ? `Your journey ${m.route} is now live`
      : 'Your journey is now live for senders',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.JOURNEY_CANCELLED]: () => ({
    title: 'Journey cancelled',
    body: 'Your journey was cancelled',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.JOURNEY_TRAVEL_UPDATED]: (m) => ({
    title: 'Traveler update',
    body: m?.phase
      ? `Your traveler is now ${String(m.phase).toLowerCase().replace(/_/g, ' ')}${m?.route ? ` (${m.route})` : ''}`
      : 'Your traveler posted a journey update',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.VERIFICATION_SUBMITTED]: () => ({
    title: 'Verification submitted',
    body: 'Your identity documents are under review',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.VERIFICATION_APPROVED]: () => ({
    title: 'Identity verified',
    body: 'Your account has been verified',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.VERIFICATION_REJECTED]: (m) => ({
    title: 'Verification rejected',
    body: m?.reason
      ? `Verification rejected: ${m.reason}`
      : 'Your verification was rejected — please resubmit',
    channel: NotificationChannel.IN_APP,
  }),
  [NotificationEvent.WELCOME]: (m) => ({
    title: 'Welcome to Verqik',
    body: m?.firstName ? `Hi ${m.firstName}, your account is ready` : undefined,
    channel: NotificationChannel.IN_APP,
  }),
};

export function resolveNotificationTemplate(
  event: NotificationEvent,
  meta?: NotificationProcessPayload['meta'],
): NotificationTemplate {
  return TEMPLATES[event](meta);
}
