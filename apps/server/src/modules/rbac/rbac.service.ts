import { Injectable } from '@nestjs/common';
import { RbacRepository } from './rbac.repository';

@Injectable()
export class RbacService {
  constructor(private readonly repository: RbacRepository) {}

  getUserPermissions(userId: string) {
    return this.repository.getUserPermissions(userId);
  }

  assignRole(userId: string, roleName: string) {
    return this.repository.assignRole(userId, roleName);
  }

  listRoles() {
    return this.repository.listRoles();
  }
}
