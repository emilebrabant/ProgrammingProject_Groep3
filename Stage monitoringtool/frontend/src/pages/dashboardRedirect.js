export function getDashboardRedirect(rol) {
  if (rol === 'admin') {
    return '/admin/users';
  }

  return '/dashboard';
}