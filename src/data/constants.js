// src/data/constants.js

export const STATUSES = [
  'In Progress',
  'Completed',
  'Blocked',
  'On Hold',
  'Review Pending',
];

export const BILLING_TYPES = [
  'Billable',
  'Non-Billable',
  'Internal',
  'Support',
];

export const TIME_SPENT_OPTIONS = [
  '0.5 hr',
  '1 hr',
  '1.5 hrs',
  '2 hrs',
  '2.5 hrs',
  '3 hrs',
  '3.5 hrs',
  '4 hrs',
  '4.5 hrs',
  '5 hrs',
  '5.5 hrs',
  '6 hrs',
  '6.5 hrs',
  '7 hrs',
  '7.5 hrs',
  '8 hrs',
];

// Hours value matching TIME_SPENT_OPTIONS for billing calc
export const TIME_SPENT_HOURS = {
  '0.5 hr': 0.5,
  '1 hr': 1,
  '1.5 hrs': 1.5,
  '2 hrs': 2,
  '2.5 hrs': 2.5,
  '3 hrs': 3,
  '3.5 hrs': 3.5,
  '4 hrs': 4,
  '4.5 hrs': 4.5,
  '5 hrs': 5,
  '5.5 hrs': 5.5,
  '6 hrs': 6,
  '6.5 hrs': 6.5,
  '7 hrs': 7,
  '7.5 hrs': 7.5,
  '8 hrs': 8,
};

// ── EmailJS ─────────────────────────────────────────────────────────────────
export const EMAILJS_SERVICE_ID = 'service_oyvdetc';
export const EMAILJS_TEMPLATE_ID = 'template_c06sb4o';
export const EMAILJS_PUBLIC_KEY = 'pSK3aLI2RrCFfJZJE';
export const COMPANY_EMAIL = 'dineshmamgain@smartdatainc.net';
