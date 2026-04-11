const { GoogleSpreadsheet } = require('google-spreadsheet');
const CACHE_DURATION = 60 * 60 * 1000;
let cachedData = null;
let lastFetch = null;

module.exports = async function() {
  if (cachedData && lastFetch && (Date.now() - lastFetch < CACHE_DURATION)) return cachedData;
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
    const saSheet = doc.sheetsByTitle['SA Polling'];
    const saRows = await saSheet.getRows();
    const sa = saRows[0];
    cachedData = {
      labor_tpp: parseFloat(sa.labor_tpp) || 66,
      liberal_tpp: parseFloat(sa.liberal_tpp) || 34,
      labor_primary: parseFloat(sa.labor_primary) || 47,
      liberal_primary: parseFloat(sa.liberal_primary) || 21,
      greens_primary: parseFloat(sa.greens_primary) || 13,
      sample_size: parseInt(sa.sample_size) || 1006,
      margin_of_error: parseFloat(sa.margin_of_error) || 3.9,
      last_updated: sa.last_updated || new Date().toISOString().split('T')[0]
    };
    lastFetch = Date.now();
    return cachedData;
  } catch (e) {
    return { labor_tpp: 66, liberal_tpp: 34, labor_primary: 47, liberal_primary: 21, greens_primary: 13, sample_size: 1006, margin_of_error: 3.9, _fallback: true };
  }
};
