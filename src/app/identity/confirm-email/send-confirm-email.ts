/**
 * Before sending: 'unsent'
 * While send email promise is pending: 'sending'
 * After email is sent: 'sent'
 */
export type SendVerifyEmailStatuses = 'sending' | 'sent' | 'unsent';
