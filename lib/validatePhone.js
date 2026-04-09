/**
 * Chuẩn hóa số điện thoại di động Việt Nam về dạng 0xxxxxxxxx (10 số).
 * Chấp nhận: 0xxx, +84xxx, 84xxx, có thể có khoảng trắng hoặc dấu gạch.
 */
export function normalizeVnPhone(input) {
  if (input == null || typeof input !== 'string') return '';
  let s = input.trim().replace(/[\s.-]/g, '');
  if (s.startsWith('+84')) s = `0${s.slice(3)}`;
  else if (s.startsWith('84') && s.length >= 10) s = `0${s.slice(2)}`;
  return s;
}

/** Di động VN: đầu số 03, 05, 07, 08, 09 + 8 chữ số (tổng 10 số sau 0). */
export function isValidVnPhone(input) {
  const s = normalizeVnPhone(input);
  return /^0[35789]\d{8}$/.test(s);
}
