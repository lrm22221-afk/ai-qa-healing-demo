import type { Fingerprint } from './healing';

/** Element fingerprints recorded against app v1. Primary selectors are deliberately brittle (testids/ids). */
export const checkout: Record<string, Fingerprint> = {
  email: { key: 'email', primary: '[data-testid="email-input"]', tag: 'input', type: 'email', label: 'Email', nameAttr: 'email', idTokens: ['email', 'input'] },
  qty: { key: 'qty', primary: '[data-testid="qty-input"]', tag: 'input', type: 'number', label: 'Quantity', nameAttr: 'qty', idTokens: ['qty', 'input'] },
  coupon: { key: 'coupon', primary: '[data-testid="coupon-input"]', tag: 'input', type: 'text', label: 'Coupon code', nameAttr: 'coupon', idTokens: ['coupon', 'input'] },
  pay: { key: 'pay', primary: '[data-testid="pay-button"]', tag: 'button', type: 'submit', text: 'Pay now', idTokens: ['pay', 'btn', 'button', 'primary'] },
  cancel: { key: 'cancel', primary: '[data-testid="cancel-button"]', tag: 'button', type: 'button', text: 'Cancel order', idTokens: ['cancel', 'btn', 'button'] },
  total: { key: 'total', primary: '[data-testid="total"]', tag: 'span', idTokens: ['total'] },
  message: { key: 'message', primary: '[data-testid="message"]', tag: 'p', role: 'status', idTokens: ['message', 'msg'] },
};
