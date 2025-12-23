const database = require('./database');
const { ObjectId } = require('mongodb');

const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const DEFAULT_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
const DEFAULT_DURATION_MINUTES = 50;
const DEFAULT_GAP_MINUTES = 10; // keep a buffer to reduce back-to-back conflicts

const toObjectId = (value) => {
  try { return new ObjectId(String(value)); } catch { return value; }
};

const normalizeDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0,0,0,0);
  return d;
};

const formatClock = (hours, minutes) => `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}`;

const parseClock = (clock) => {
  if (!clock || typeof clock !== 'string') return null;
  const trimmed = clock.trim();
  // Supports "09:00", "9:00", "5:30 PM"
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3]?.toUpperCase();
  if (suffix === 'PM' && hours < 12) hours += 12;
  if (suffix === 'AM' && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
};

const generateSlotsFromWindow = (startClock, endClock, durationMinutes = DEFAULT_DURATION_MINUTES, gapMinutes = DEFAULT_GAP_MINUTES) => {
  const start = parseClock(startClock);
  const end = parseClock(endClock);
  if (!start || !end) return [];
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;
  const step = durationMinutes + gapMinutes;
  const slots = [];
  for (let t = startMinutes; t + durationMinutes <= endMinutes; t += step) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(formatClock(h, m));
  }
  return slots;
};

const slotKey = (date, time) => `${date}::${time}`;

async function getBusySlotKeys(therapistId, dateKey) {
  const busyDocs = await database.findMany('therapist_busy', { therapistId: toObjectId(therapistId), dateKey });
  return new Set((busyDocs || []).map((b) => slotKey(dateKey, b.time)));
}

async function blockSlot({ therapistId, date, time, source = 'manual', note = '', refId = null }) {
  const dateKey = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
  const busy = {
    therapistId: toObjectId(therapistId),
    date: normalizeDate(date) || new Date(date),
    dateKey,
    time,
    source,
    refId: refId || null,
    note: note || '',
    createdAt: new Date()
  };
  // Upsert to avoid duplicates
  await database.updateOne(
    'therapist_busy',
    { therapistId: busy.therapistId, dateKey, time },
    { $set: busy },
    { upsert: true }
  );
  return busy;
}

async function clearBusy({ therapistId, dateKey, time, source }) {
  const filter = { therapistId: toObjectId(therapistId) };
  if (dateKey) filter.dateKey = dateKey;
  if (time) filter.time = time;
  if (source) filter.source = source;
  await database.deleteMany('therapist_busy', filter);
}

async function upsertWeeklyAvailability(therapistId, weekly = [], timezone = 'Asia/Kolkata', meta = {}) {
  const doc = {
    therapistId: toObjectId(therapistId),
    timezone: timezone || 'Asia/Kolkata',
    weekly: weekly.map((w) => ({
      day: (w.day || '').toLowerCase(),
      start: w.start,
      end: w.end,
      enabled: w.enabled !== false
    })),
    meta,
    updatedAt: new Date()
  };
  await database.updateOne('therapist_availability', { therapistId: doc.therapistId }, { $set: doc }, { upsert: true });

  // Keep therapist document in sync for legacy consumers (stores slots array)
  const legacySlots = weekly.map((w) => ({
    day: (w.day || '').toLowerCase(),
    slots: w.enabled === false ? [] : [{ startTime: w.start, endTime: w.end, isAvailable: true }]
  }));
  await database.updateOne(
    'therapists',
    { _id: doc.therapistId },
    { $set: { availability: legacySlots, timezone: timezone || 'Asia/Kolkata' } },
    { upsert: false }
  );

  return doc;
}

async function getAvailabilityForDate(therapistId, date, options = {}) {
  const { slotDurationMinutes = DEFAULT_DURATION_MINUTES, gapMinutes = DEFAULT_GAP_MINUTES } = options;
  const dateKey = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
  const dayName = DAY_NAMES[new Date(dateKey).getDay()];

  // Load schedule
  const schedule = await database.findOne('therapist_availability', { therapistId: toObjectId(therapistId) });
  const weekly = schedule?.weekly || [];
  const dayWindow = weekly.find((w) => w.day === dayName && w.enabled !== false);
  let candidateSlots = [];
  if (dayWindow?.start && dayWindow?.end) {
    candidateSlots = generateSlotsFromWindow(dayWindow.start, dayWindow.end, slotDurationMinutes, gapMinutes);
  }
  if (!candidateSlots.length) {
    candidateSlots = DEFAULT_SLOTS;
  }

  // Booked slots from bookings collection
  const dateStart = normalizeDate(dateKey);
  const dateEnd = normalizeDate(dateKey);
  if (dateEnd) dateEnd.setHours(23,59,59,999);
  const bookings = await database.findMany('bookings', {
    $and: [
      { $or: [ { therapistId: toObjectId(therapistId) }, { therapistProfileId: toObjectId(therapistId) } ] },
      { $or: [ { appointmentDate: { $gte: dateStart, $lte: dateEnd } }, { date: dateKey }, { appointmentDate: dateKey } ] },
      { status: { $in: ['pending','confirmed','active'] } }
    ]
  });
  const bookedKeys = new Set((bookings || []).map((b) => slotKey(dateKey, b.appointmentTime || b.timeSlot || b.sessionTime?.startTime)).filter(Boolean));

  // Busy blocks (manual or external)
  const busyKeys = await getBusySlotKeys(therapistId, dateKey);

  const availability = candidateSlots.map((time) => {
    const key = slotKey(dateKey, time);
    const blocked = bookedKeys.has(key) || busyKeys.has(key) || busyKeys.has(slotKey(dateKey, 'ALL_DAY'));
    return { time, available: !blocked };
  }).sort((a, b) => a.time.localeCompare(b.time));

  const nextAvailable = availability.find((a) => a.available) || null;
  return { availability, date: dateKey, nextAvailable };
}

module.exports = {
  DAY_NAMES,
  DEFAULT_SLOTS,
  blockSlot,
  clearBusy,
  upsertWeeklyAvailability,
  getAvailabilityForDate,
};
