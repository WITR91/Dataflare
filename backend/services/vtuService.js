/**
 * VTU Service — Clubkonnect Integration
 * ══════════════════════════════════════
 * Controls via .env:
 *   VTU_MOCK=true  → safe test mode (no real API calls, no money spent)
 *   VTU_MOCK=false → live Clubkonnect (real purchases)
 *
 * Clubkonnect API docs: https://www.clubkonnect.com/APIDocumentation
 */

const axios = require('axios');

// Clubkonnect network codes (don't change these)
const NETWORK_CODES = {
  MTN:       '01',
  Glo:       '02',
  '9mobile': '03',
  Airtel:    '04',
};

/**
 * Purchase a data bundle
 * @returns {{ success: boolean, reference?: string, message?: string }}
 */
exports.purchaseData = async ({ network, phone, bundleCode, amount, reference }) => {

  // ── MOCK MODE — set VTU_MOCK=true in .env for safe testing ───────────────
  if (process.env.VTU_MOCK === 'true') {
    console.log(`[VTU MOCK] ${network} ${bundleCode} → ${phone}`);
    await new Promise((r) => setTimeout(r, 800));
    const success = Math.random() < 0.95;
    return success
      ? { success: true,  reference: `MOCK_${Date.now()}` }
      : { success: false, message: 'Mock failure (5% test rate)' };
  }

  // ── LIVE — Clubkonnect API ────────────────────────────────────────────────
  try {
    const response = await axios.get('https://www.clubkonnect.com/api/datainfo.asp', {
      params: {
        UserID:        process.env.VTU_USER_ID,
        APIKey:        process.env.VTU_API_KEY,
        MobileNetwork: NETWORK_CODES[network],
        DataPlan:      bundleCode,   // set this per bundle in the Admin Bundles page
        MobileNumber:  phone,
        RequestID:     reference,    // our transaction _id as unique ref
      },
      timeout: 30000,
    });

    const data = response.data;
    console.log('[Clubkonnect]', data);

    if (data.status === 'successful' || data.Status === 'successful') {
      return {
        success:   true,
        reference: data.OrderID || data.orderid || reference,
      };
    }

    return {
      success: false,
      message: data.message || data.Message || 'Clubkonnect returned failure',
    };
  } catch (error) {
    console.error('[Clubkonnect error]', error.message);
    return { success: false, message: error.message };
  }
};

/**
 * Check order status — useful for reconciling pending transactions
 */
exports.checkStatus = async (requestId) => {
  if (process.env.VTU_MOCK === 'true') return { status: 'successful' };

  try {
    const response = await axios.get('https://www.clubkonnect.com/api/orderstatus.asp', {
      params: {
        UserID:    process.env.VTU_USER_ID,
        APIKey:    process.env.VTU_API_KEY,
        RequestID: requestId,
      },
    });
    return response.data;
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};
