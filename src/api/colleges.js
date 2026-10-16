const collegeOptions = [
  { tenantId: 'psna', name: 'PSNA College of Engineering and Technology' },
  { tenantId: 'anna-university', name: 'Anna University' },
  { tenantId: 'psg', name: 'PSG College of Technology' },
  { tenantId: 'loyola', name: 'Loyola College' },
  { tenantId: 'mcc', name: 'Madras Christian College' },
  { tenantId: 'srm', name: 'SRM Institute of Science and Technology' },
  { tenantId: 'vit', name: 'VIT Vellore' },
  { tenantId: 'kct', name: 'Kumaraguru College of Technology' }
];

export default collegeOptions;

// Dropdown value for "+ Add Other College"; the typed name is sent as `tenantId`
// and the API reuses or creates the matching tenant.
export const OTHER_COLLEGE = '__other__';

const COLLEGE_NAME_MIN_LENGTH = 2;
const COLLEGE_NAME_MAX_LENGTH = 150;

export const normalizeCollegeName = (value = '') => value.trim().replace(/\s+/g, ' ');

export const validateCollegeName = (value) => {
  const name = normalizeCollegeName(value);
  if (!name) return 'Enter your college name.';
  if (name.length < COLLEGE_NAME_MIN_LENGTH) return `Use at least ${COLLEGE_NAME_MIN_LENGTH} characters.`;
  if (name.length > COLLEGE_NAME_MAX_LENGTH) return `Use at most ${COLLEGE_NAME_MAX_LENGTH} characters.`;
  if (!/^[\p{L}\p{M}0-9 .,&'()/-]+$/u.test(name)) return 'Use only letters, numbers, spaces and . , & \' ( ) / -';
  if (!/\p{L}/u.test(name)) return 'College name must contain letters.';
  return '';
};

// The `tenantId` to send: the selected college's ID, or the typed name for "Other".
export const resolveCollegeTenantId = (tenantId, collegeName) => (
  tenantId === OTHER_COLLEGE ? normalizeCollegeName(collegeName) : tenantId
);
