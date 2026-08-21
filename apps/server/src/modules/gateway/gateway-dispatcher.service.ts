import {
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { AuthUser } from '@verqik/common';
import { resolveAppError } from '@verqik/common';
import { AdminCitiesService } from '../admin/admin-cities.service';
import { AdminUsersService } from '../admin/admin-users.service';
import { AdminVerificationsService } from '../admin/admin-verifications.service';
import { AuthService } from '../auth/auth.service';
import { DeliveryService } from '../delivery/delivery.service';
import { DisputesService } from '../disputes/disputes.service';
import { FilesService } from '../files/files.service';
import { JourneysService } from '../journeys/journeys.service';
import { JourneysQueryService } from '../journeys/journeys-query.service';
import { MessagingService } from '../messaging/messaging.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentsService } from '../payments/payments.service';
import { RbacService } from '../rbac/rbac.service';
import { ReferenceService } from '../reference/reference.service';
import { ReviewsService } from '../reviews/reviews.service';
import { UsersService } from '../users/users.service';
import {
  EVENT_PERMISSIONS,
  GatewayEvents,
  PUBLIC_EVENTS,
} from './gateway.events';
import type { RoomJoinPayload, RpcFailure, RpcSuccess } from './gateway.types';

type Handler = (
  user: AuthUser,
  payload: Record<string, unknown>,
) => Promise<unknown>;

type PublicHandler = (payload: Record<string, unknown>) => Promise<unknown>;

@Injectable()
export class GatewayDispatcherService {
  private readonly logger = new Logger(GatewayDispatcherService.name);
  private readonly handlers = new Map<string, Handler>();
  private readonly publicHandlers = new Map<string, PublicHandler>();

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
    private readonly filesService: FilesService,
    private readonly journeysService: JourneysService,
    private readonly deliveryService: DeliveryService,
    private readonly paymentsService: PaymentsService,
    private readonly reviewsService: ReviewsService,
    private readonly messagingService: MessagingService,
    private readonly disputesService: DisputesService,
    private readonly notificationsService: NotificationsService,
    private readonly referenceService: ReferenceService,
    private readonly journeysQuery: JourneysQueryService,
    private readonly adminVerificationsService: AdminVerificationsService,
    private readonly adminCitiesService: AdminCitiesService,
    private readonly adminUsersService: AdminUsersService,
  ) {
    this.registerPublicHandlers();
    this.registerAuthenticatedHandlers();
  }

  isPublic(event: string) {
    return PUBLIC_EVENTS.has(event);
  }

  assertPermissions(user: AuthUser, event: string) {
    const required = EVENT_PERMISSIONS[event];
    if (!required?.length) return;

    const allowed = required.every((p) => user.permissions.includes(p));
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  async dispatch(
    event: string,
    user: AuthUser | null,
    payload: Record<string, unknown> = {},
  ): Promise<unknown> {
    if (this.isPublic(event)) {
      const handler = this.publicHandlers.get(event);
      if (!handler) throw new Error(`Unknown public event: ${event}`);
      return handler(payload);
    }

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    this.assertPermissions(user, event);

    const handler = this.handlers.get(event);
    if (!handler) throw new Error(`Unknown event: ${event}`);

    return handler(user, payload);
  }

  async joinRoom(user: AuthUser, payload: RoomJoinPayload) {
    this.assertPermissions(user, GatewayEvents.ROOM_JOIN);

    if (payload.type === 'delivery') {
      await this.deliveryService.getById(payload.id, user.id);
      return { room: `delivery:${payload.id}` };
    }

    if (payload.type === 'journey') {
      const journey = await this.journeysQuery.findById(payload.id);
      if (!journey) throw new ForbiddenException('Journey not found');
      return { room: `journey:${payload.id}` };
    }

    throw new ForbiddenException('Invalid room type');
  }

  toRpcSuccess<T>(id: string, data: T): RpcSuccess<T> {
    return { id, ok: true, data };
  }

  toRpcFailure(id: string, error: unknown): RpcFailure {
    const resolved = resolveAppError(error);

    if (resolved.status >= 500) {
      this.logger.error(resolved.errorMessage, error instanceof Error ? error.stack : undefined);
    } else if (error instanceof HttpException) {
      this.logger.warn(resolved.errorMessage);
    } else if (!(error instanceof HttpException)) {
      this.logger.error(resolved.errorMessage, error instanceof Error ? error.stack : undefined);
    }

    return {
      id,
      ok: false,
      error: resolved,
    };
  }

  private registerPublicHandlers() {
    this.publicHandlers.set(GatewayEvents.PING, async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }));

    this.publicHandlers.set(GatewayEvents.HEALTH_CHECK, async () => ({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }));

    this.publicHandlers.set(GatewayEvents.REFERENCE_COUNTRIES, async () =>
      this.referenceService.listCountries(),
    );

    this.publicHandlers.set(GatewayEvents.REFERENCE_CITIES, async (p) =>
      this.referenceService.listCities({
        countryCode: p.countryCode as string | undefined,
        q: p.q as string | undefined,
        enabledOnly: true,
      }),
    );

    this.publicHandlers.set(GatewayEvents.JOURNEYS_BROWSE, async (p) =>
      this.journeysService.browse({
        originCountry: p.originCountry as string | undefined,
        destinationCountry: p.destinationCountry as string | undefined,
        originCityId: p.originCityId as string | undefined,
        destinationCityId: p.destinationCityId as string | undefined,
        limit: p.limit as number | undefined,
      }),
    );

    this.publicHandlers.set(GatewayEvents.AUTH_REGISTER, async (p) =>
      this.authService.register(p as never),
    );

    this.publicHandlers.set(GatewayEvents.AUTH_LOGIN, async (p) =>
      this.authService.login(p as never),
    );
  }

  private registerAuthenticatedHandlers() {
    const h = this.handlers;

    // Users
    h.set(GatewayEvents.USERS_ME_GET, (u) =>
      this.usersService.getProfile(u.id),
    );
    h.set(GatewayEvents.USERS_ME_UPDATE, (u, p) =>
      this.usersService.updateProfile(u.id, p as never),
    );
    h.set(GatewayEvents.USERS_ADDRESSES_LIST, (u) =>
      this.usersService.listAddresses(u.id),
    );
    h.set(GatewayEvents.USERS_ADDRESSES_CREATE, (u, p) =>
      this.usersService.createAddress(u.id, p as never),
    );

    // RBAC
    h.set(GatewayEvents.RBAC_ROLES_LIST, () => this.rbacService.listRoles());

    // Files
    h.set(GatewayEvents.FILES_UPLOAD_URL, (u, p) =>
      this.filesService.requestUpload(u.id, p as never),
    );
    h.set(GatewayEvents.FILES_CONFIRM, (u, p) =>
      this.filesService.confirmUpload(String(p.fileId), u.id),
    );
    h.set(GatewayEvents.FILES_DOWNLOAD_URL, (u, p) =>
      this.filesService.getDownloadUrl(String(p.fileId), u.id),
    );
    h.set(GatewayEvents.FILES_DELETE, (u, p) =>
      this.filesService.delete(String(p.fileId), u.id),
    );

    // Journeys
    h.set(GatewayEvents.JOURNEYS_CREATE, (u, p) =>
      this.journeysService.create(u.id, p as never),
    );
    h.set(GatewayEvents.JOURNEYS_SEARCH, (_u, p) =>
      this.journeysService.search(p as never),
    );
    h.set(GatewayEvents.JOURNEYS_GET, (u, p) =>
      this.journeysService.getForBooking(String(p.journeyId), u.id),
    );
    h.set(GatewayEvents.JOURNEYS_LIST_MINE, (u) =>
      this.journeysService.listMine(u.id),
    );
    h.set(GatewayEvents.JOURNEYS_UPDATE_TRAVEL, (u, p) => {
      const { journeyId, ...dto } = p as { journeyId: string } & Record<
        string,
        unknown
      >;
      return this.journeysService.updateTravel(String(journeyId), u.id, dto as never);
    });
    h.set(GatewayEvents.JOURNEYS_CANCEL, (u, p) =>
      this.journeysService.cancel(String(p.journeyId), u.id),
    );

    // Delivery
    h.set(GatewayEvents.DELIVERY_CATEGORIES, () =>
      this.deliveryService.listCategories(),
    );
    h.set(GatewayEvents.DELIVERY_REQUESTS_CREATE, (u, p) =>
      this.deliveryService.createRequest(u.id, p as never),
    );
    h.set(GatewayEvents.DELIVERY_REQUESTS_LIST, (u) =>
      this.deliveryService.listForUser(u.id),
    );
    h.set(GatewayEvents.DELIVERY_REQUESTS_GET, (u, p) =>
      this.deliveryService.getById(String(p.requestId), u.id),
    );
    h.set(GatewayEvents.DELIVERY_REQUESTS_TRANSITION, (u, p) =>
      this.deliveryService.transition(String(p.requestId), u.id, p as never),
    );

    // Payments
    h.set(GatewayEvents.PAYMENTS_WALLET, (u) =>
      this.paymentsService.getWallet(u.id),
    );
    h.set(GatewayEvents.PAYMENTS_TRANSACTIONS, (u) =>
      this.paymentsService.listTransactions(u.id),
    );
    h.set(GatewayEvents.PAYMENTS_ESCROW_HOLD, (u, p) =>
      this.paymentsService.holdEscrow(u.id, p as never),
    );
    h.set(GatewayEvents.PAYMENTS_ESCROW_RELEASE, (u, p) =>
      this.paymentsService.releaseEscrow(String(p.transactionId), u.id),
    );

    // Reviews
    h.set(GatewayEvents.REVIEWS_CREATE, (u, p) =>
      this.reviewsService.create(u.id, p as never),
    );
    h.set(GatewayEvents.REVIEWS_LIST, (u) =>
      this.reviewsService.listForUser(u.id),
    );

    // Messaging
    h.set(GatewayEvents.MESSAGING_SEND, (u, p) =>
      this.messagingService.send(u.id, p as never),
    );
    h.set(GatewayEvents.MESSAGING_LIST, (u, p) =>
      this.messagingService.list(String(p.deliveryRequestId), u.id),
    );

    // Disputes
    h.set(GatewayEvents.DISPUTES_RAISE, (u, p) =>
      this.disputesService.raise(u.id, p as never),
    );
    h.set(GatewayEvents.DISPUTES_LIST, (u) =>
      this.disputesService.listForUser(u.id),
    );
    h.set(GatewayEvents.DISPUTES_RESOLVE, (u, p) =>
      this.disputesService.resolve(
        String(p.disputeId),
        u.id,
        String(p.resolution),
      ),
    );

    // Notifications
    h.set(GatewayEvents.NOTIFICATIONS_LIST, (u, p) =>
      this.notificationsService.list(u.id, p.unreadOnly === true),
    );
    h.set(GatewayEvents.NOTIFICATIONS_READ, (u, p) =>
      this.notificationsService.markRead(String(p.notificationId), u.id),
    );
    h.set(GatewayEvents.NOTIFICATIONS_UNREAD, (u, p) =>
      this.notificationsService.markUnread(String(p.notificationId), u.id),
    );
    h.set(GatewayEvents.NOTIFICATIONS_READ_ALL, (u) =>
      this.notificationsService.markAllRead(u.id),
    );
    h.set(GatewayEvents.NOTIFICATIONS_UNREAD_COUNT, (u) =>
      this.notificationsService.unreadCount(u.id),
    );

    // Verification
    h.set(GatewayEvents.VERIFICATION_GET, (u) =>
      this.usersService.getVerification(u.id),
    );
    h.set(GatewayEvents.VERIFICATION_SUBMIT, (u, p) =>
      this.usersService.submitVerification(u.id, p as never),
    );

    // Admin verification review
    h.set(GatewayEvents.ADMIN_VERIFICATIONS_LIST, () =>
      this.adminVerificationsService.listPending(),
    );
    h.set(GatewayEvents.ADMIN_VERIFICATIONS_GET, (_u, p) =>
      this.adminVerificationsService.getDetail(String(p.verificationId)),
    );
    h.set(GatewayEvents.ADMIN_VERIFICATIONS_APPROVE, (u, p) =>
      this.adminVerificationsService.approve(String(p.verificationId), u.id),
    );
    h.set(GatewayEvents.ADMIN_VERIFICATIONS_REJECT, (u, p) =>
      this.adminVerificationsService.reject(
        String(p.verificationId),
        u.id,
        String(p.rejectionReason),
      ),
    );

    // Admin cities
    h.set(GatewayEvents.ADMIN_CITIES_LIST, (_u, p) =>
      this.adminCitiesService.list({
        countryCode: p.countryCode as string | undefined,
        q: p.q as string | undefined,
      }),
    );
    h.set(GatewayEvents.ADMIN_CITIES_GET, (_u, p) =>
      this.adminCitiesService.getById(String(p.cityId)),
    );
    h.set(GatewayEvents.ADMIN_CITIES_CREATE, (u, p) =>
      this.adminCitiesService.create(p as never, u.id),
    );
    h.set(GatewayEvents.ADMIN_CITIES_UPDATE, (u, p) => {
      const { cityId, ...dto } = p as { cityId: string } & Record<string, unknown>;
      return this.adminCitiesService.update(String(cityId), dto as never, u.id);
    });
    h.set(GatewayEvents.ADMIN_CITIES_DELETE, (u, p) =>
      this.adminCitiesService.remove(String(p.cityId), u.id),
    );

    // Admin users
    h.set(GatewayEvents.ADMIN_USERS_LIST, (_u, p) =>
      this.adminUsersService.list({
        q: p.q as string | undefined,
        page: p.page !== undefined ? Number(p.page) : undefined,
        pageSize: p.pageSize !== undefined ? Number(p.pageSize) : undefined,
      }),
    );
    h.set(GatewayEvents.ADMIN_USERS_GET, (_u, p) =>
      this.adminUsersService.getById(String(p.userId)),
    );
    h.set(GatewayEvents.ADMIN_USERS_CREATE, (_u, p) =>
      this.adminUsersService.createUser(p as never),
    );
    h.set(GatewayEvents.ADMIN_USERS_UPDATE, (u, p) => {
      const { userId, ...dto } = p as { userId: string } & Record<string, unknown>;
      return this.adminUsersService.updateUser(String(userId), dto as never, u.id);
    });
    h.set(GatewayEvents.ADMIN_USERS_DELETE, (u, p) =>
      this.adminUsersService.deleteUser(String(p.userId), u.id),
    );
  }
}
