/* react-doctor-disable */
/** This file defines the permissions and roles used in the application.
 * It also provides utility functions for checking permissions and retrieving permissions for roles.
 */

const PERMISSIONS = {
  STREAM_READ: 'stream.read',
  DETECTION_READ: 'detection.read',
  ALERTS_READ: 'alerts.read',
  STREAM_WRITE: 'stream.write',
  DETECTION_WRITE: 'detection.write',
  ALERTS_WRITE: 'alerts.write',
  USERS_WRITE: 'users.write',
  SETTINGS_WRITE: 'settings.write',
  CAMERA_DELETE: 'camera.delete',
  CAMERA_WRITE: 'camera.write',
  CAMERA_READ: 'camera.read',
}

const VIEWER_PERMISSIONS = [
  PERMISSIONS.STREAM_READ,
  PERMISSIONS.DETECTION_READ,
  PERMISSIONS.ALERTS_READ,
] as const

const ADMIN_PERMISSIONS = [
  ...VIEWER_PERMISSIONS,

  PERMISSIONS.STREAM_WRITE,
  PERMISSIONS.DETECTION_WRITE,
  PERMISSIONS.ALERTS_WRITE,
  PERMISSIONS.USERS_WRITE,
  PERMISSIONS.SETTINGS_WRITE,
  PERMISSIONS.CAMERA_DELETE,
] as const

const SUPER_ADMIN_PERMISSIONS = [
  ...ADMIN_PERMISSIONS,
  PERMISSIONS.CAMERA_WRITE,
  PERMISSIONS.CAMERA_READ,
] as const

const ALL_PERMISSIONS = [
  ...new Set([
    ...VIEWER_PERMISSIONS,
    ...ADMIN_PERMISSIONS,
    ...SUPER_ADMIN_PERMISSIONS,
  ]),
] as const

const ROLES = {
  VIEWER: 'viewer',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
} as const

const ROLES_PERMISSIONS = {
  [ROLES.VIEWER]: VIEWER_PERMISSIONS,
  [ROLES.ADMIN]: ADMIN_PERMISSIONS,
  [ROLES.SUPER_ADMIN]: SUPER_ADMIN_PERMISSIONS,
} as const

export type Role = keyof typeof ROLES
export {
  ADMIN_PERMISSIONS,
  PERMISSIONS,
  ROLES,
  ROLES_PERMISSIONS,
  ALL_PERMISSIONS,
  SUPER_ADMIN_PERMISSIONS,
  VIEWER_PERMISSIONS,
}
