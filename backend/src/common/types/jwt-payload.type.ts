export type JwtPayload = {
  sub: string;
  email: string;
  roleId: string;
  buildingId?: string;
  roleName: string;
};
