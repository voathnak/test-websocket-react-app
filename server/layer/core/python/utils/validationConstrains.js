/* eslint-disable no-unused-vars */
const validateJS = require('validate.js');

// Custom validators
validateJS.validators.missions = (value, options, key, attributes) => {
  const allowedValue = [
    'Animal',
    'Arts',
    'Children',
    'Community',
    'Disability',
    'Education',
    'Environment',
    'Health',
    'Humanitarian',
    'Sports',
    'Women',
    'Others',
  ];
  const invalidItems = [];
  value.forEach((mission) => {
    if (!allowedValue.includes(mission)) invalidItems.push(mission);
  });
  if (invalidItems.length === 0) return;
  return `[${invalidItems.join(', ')}] is invalid.`;
};

const createSocialEventConstraints = {
  missions: { presence: true, type: 'array', missions: true },
  description: { presence: true, type: 'string', length: { maximum: 1500 } },
  startDate: { presence: true, type: 'string' },
  startTime: { presence: true, type: 'string' },
  duration: { presence: true, type: 'string' },
  startDateTime: { presence: true, datetime: true },
  expireDateTime: { presence: true, datetime: true },
  recurring: { presence: false, type: 'boolean' },
  location: { presence: true, type: 'object' },
  'location.name': { presence: true, type: 'string' },
  'location.address': { presence: true },
  'location.lat': { presence: true },
  'location.lng': { presence: true },
  'location.url': { presence: true },
  'location.meetingPoint': { presence: false, length: { maximum: 500 } },
  numberOfParticipants: { presence: true, type: 'integer' },
  participantSkills: { presence: false, type: 'array' },
  notesForParticipants: { presence: false, length: { maximum: 1500 } },
  causeDetail: { presence: true, type: 'object' },
  'causeDetail.name': { presence: true, length: { maximum: 100 } },
  'causeDetail.contactName': { presence: true, type: 'string' },
  'causeDetail.contactPhone': { presence: true, type: 'string' },
  'causeDetail.contactEmail': { presence: true, email: true },
  token: { presence: true },
};

const updateSocialEventStateToDraftConstraints = {
  socialEventId: { presence: true },
  causeId: { presence: true },
  toState: {
    presence: true,
    inclusion: {
      within: ['draft'],
      message:
        '%{value} state is not possible to update to from the current state',
    },
  },
};

const updateSocialEventStateToPublishedConstraints = {
  socialEventId: { presence: true },
  toState: {
    presence: true,
    inclusion: {
      within: ['published'],
      message:
        '%{value} state is not possible to update to from the current state',
    },
  },
};
const updateSocialEventStateConstraints = {
  toState: {
    presence: true,
    inclusion: {
      within: ['draft', 'published', 'completed'],
      message:
        '%{value} state is not possible to update to from the current state',
    },
  },
};

const updateSocialEventConstraints = {
  eventId: { presence: true },
  causeId: { presence: false },
  title: { presence: false },
  description: { presence: false },
  missions: { presence: false },
  startDate: { presence: false },
  startTime: { presence: false },
  duration: { presence: false },
  startDateTime: { presence: false },
  expireDateTime: { presence: false },
  location: { presence: false },
  numberOfParticipants: { presence: false },
  participantSkills: { presence: false },
  notesForParticipants: { presence: false },
  spotLeft: { presence: false },
  organizer: { presence: false },
  causeDetail: { presence: false },
};

const updateCompany = {
  contactDetail: { presence: false },
  preferences: { presence: false },
  name: { presence: true },
  description: { presence: true },
  logo: { presence: true },
};

module.exports = {
  createSocialEventConstraints,
  updateSocialEventStateConstraints,
  updateSocialEventStateToDraftConstraints,
  updateSocialEventStateToPublishedConstraints,
  updateSocialEventConstraints,
  updateCompany,
};
