export function getDashboardRedirect(rol) {
  if (rol === 'admin') {
    return '/admin/users';
  }

  if (rol === 'student') {
    return '/student/stagevoorstellen';
  }

  return '/dashboard';
}