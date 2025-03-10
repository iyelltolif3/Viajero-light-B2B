export const AUTHORIZED_ADMIN_EMAILS = [
  'viajero.light.chile@gmail.com',
  'gerencia@viajero.com',
  'soporte@viajero.com'
];

export const isAuthorizedAdmin = (email: string): boolean => {
  return AUTHORIZED_ADMIN_EMAILS.includes(email.toLowerCase());
}; 