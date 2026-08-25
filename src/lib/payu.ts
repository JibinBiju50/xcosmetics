import crypto from 'crypto';

/**
 * Returns the merchant key, sanitized of any surrounding quotes or whitespace.
 */
export function getMerchantKey(): string {
  return (process.env.PAYU_MERCHANT_KEY || '').trim().replace(/['"]/g, '');
}

/**
 * Returns the PayU salt, sanitized of any surrounding quotes or whitespace.
 */
export function getPayUSalt(): string {
  return (process.env.PAYU_SALT || '').trim().replace(/['"]/g, '');
}

/**
 * Returns the correct PayU payment endpoint based on PAYU_MODE env var.
 * - test / sandbox → https://test.payu.in/_payment
 * - production     → https://secure.payu.in/_payment  (PayU Biz)
 */
export function getPayUUrl(): string {
  const rawMode = (process.env.PAYU_MODE || '').trim().toLowerCase().replace(/['"]/g, '');
  return (rawMode === 'test' || rawMode === 'sandbox')
    ? 'https://test.payu.in/_payment'
    : 'https://secure.payu.in/_payment';
}

interface ForwardHashParams {
  txnid: string;
  amount: string;      // must be a string like "599.00"
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}

/**
 * Generate SHA512 hash for PayU payment initiation.
 *
 * Formula (PayU Biz):
 *   SHA512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 *
 * The five empty fields after udf5 represent udf6–udf10 (unused).
 */
export function generatePayUHash(params: ForwardHashParams): string {
  const key = getMerchantKey();
  const salt = getPayUSalt();

  const hashString = [
    key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 ?? '',
    params.udf2 ?? '',
    params.udf3 ?? '',
    params.udf4 ?? '',
    params.udf5 ?? '',
    '', '', '', '', '', // udf6–udf10 (always empty)
    salt,
  ].join('|');

  return crypto.createHash('sha512').update(hashString).digest('hex');
}

interface ReverseHashParams {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  status: string;
  hash: string; // the hash PayU sends back — we compare against this
}

/**
 * Verify the hash that PayU sends in the callback POST.
 *
 * Formula (reverse):
 *   SHA512(SALT|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 *
 * udf6–udf10 are empty in our implementation.
 */
export function verifyPayUHash(params: ReverseHashParams): boolean {
  const salt = getPayUSalt();

  const reverseHashString = [
    salt,
    params.status,
    '', '', '', '', '', // udf10–udf6 (always empty)
    params.udf5 ?? '',
    params.udf4 ?? '',
    params.udf3 ?? '',
    params.udf2 ?? '',
    params.udf1 ?? '',
    params.email,
    params.firstname,
    params.productinfo,
    params.amount,
    params.txnid,
    params.key,
  ].join('|');

  const computedHash = crypto
    .createHash('sha512')
    .update(reverseHashString)
    .digest('hex');

  return computedHash === params.hash;
}

/** Shape of the params object returned to the frontend for form submission */
export interface PayUFormParams {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  udf1: string;
  hash: string;
  action: string; // PayU endpoint URL — used by the frontend form
}
