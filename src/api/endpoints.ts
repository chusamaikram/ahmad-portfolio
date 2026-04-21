export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
  },
  CONTACT: {
    SEND: '/contact-queries/',
    GET_ALL: '/contact-queries/',
    MARK_READ: (id: number) => `/contact-queries/${id}/mark-read/`,
    MARK_ALL_READ: '/contact-queries/mark-all-read/',
    DELETE: (id: number) => `/contact-queries/${id}/`,
  },
  TESTIMONIALS: {
    SEND: '/testimonial/',
    GET_ALL: '/testimonial/',
    UPDATE: (id: number) => `/testimonial/${id}/`,
    DELETE: (id: number) => `/testimonial/${id}/`,
  },
  PROJECTS: {
    SEND: '/portfolio/',
    GET_ALL: '/portfolio/',
    UPDATE: (id: number) => `/portfolio/${id}/`,
    DELETE: (id: number) => `/portfolio/${id}/`,
  },
  ROLES: {
    GET_USERS: '/auth/users/',
    ADD_USER: '/auth/users/',
    UPDATE_USER: (id: number) => `/auth/users/${id}/`,
    DELETE_USER: (id: number) => `/auth/users/${id}/`,
    REVOKE_USER: (id: number) => `/auth/users/${id}/revoke/`,
  },
  NOTIFICATIONS: {
    GET_ALL: '/notifications/',
    GET_UNREAD_COUNT: '/notifications/unread-count/',
    GET_ONE: (id: number) => `/notifications/${id}/`,
    MARK_READ: (id: number) => `/notifications/${id}/mark-read/`,
    MARK_ALL_READ: '/notifications/mark-all-read/',
  },
  SERVICES: {
    GET_ALL: '/services/',
    CREATE: '/services/',
    UPDATE: (id: number) => `/services/${id}/`,
    DELETE: (id: number) => `/services/${id}/`,
  },
}