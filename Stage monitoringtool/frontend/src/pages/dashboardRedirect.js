export function getDashboardRedirect(rol) {
  if (rol === 'admin') {
    return '/admin/users';
  }

  if (rol === 'commissie') {
    return '/commissie/stages';
  }

  if (rol === 'student') {
    return '/student/stagevoorstellen';
  }

  if (rol === 'mentor') {
    return '/mentor/koppeling-studenten';
  }

  if (rol === 'docent') {
    return '/docent/studenten';
  }

  return '/dashboard';
}