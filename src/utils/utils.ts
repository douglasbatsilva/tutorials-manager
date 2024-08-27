export function diacriticSensitiveRegex(string = '') {
  let r = string.toLowerCase();
  r = r.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return r
    .replace(/a/g, '[a,á,à,ä,ã,â]')
    .replace(/e/g, '[e,é,ë,è,ê]')
    .replace(/i/g, '[i,í,ï,î,ì]')
    .replace(/o/g, '[o,ó,ö,ò,õ,ô]')
    .replace(/u/g, '[u,ü,ú,ù,û]')
    .replace(/c/g, '[c,ç]')
    .replace(/n/g, '[n,ñ]');
}
