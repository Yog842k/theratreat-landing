// Centralized session pricing used on the server
// Keep this in sync with client UI defaults in TherapyBookingEnhanced.tsx

const defaultSessionPrices = {
  video: 999,
  audio: 499,
  clinic: 699,
  home: 1299
};

/**
 * Resolve the base session price for a booking.
 * Falls back to therapist consultation fee when session type isn't recognized.
 */
function getSessionBasePrice(sessionType, therapistConsultationFee) {
  const key = String(sessionType || '').toLowerCase();
  if (Object.prototype.hasOwnProperty.call(defaultSessionPrices, key)) {
    return Number(defaultSessionPrices[key]);
  }
  return Number(therapistConsultationFee || 0);
}

module.exports = {
  getSessionBasePrice,
  defaultSessionPrices
};
