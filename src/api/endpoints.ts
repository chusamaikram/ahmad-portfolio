import { ADDRCONFIG } from "dns";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
  },
  CONTACT: {
    SEND: '/contact-queries/',
    GET_ALL: '/contact-queries/',
    GET_ONE: (id: number) => `/contact-queries/${id}/`,
    MARK_READ: (id: number) => `/contact-queries/${id}/mark-read/`,
    MARK_ALL_READ: '/contact-queries/mark-all-read/',
    UPDATE: (id: number) => `/contact-queries/${id}/`,
    DELETE: (id: number) => `/contact-queries/${id}/`,
  },
  TESTIMONIALS: {
    SEND: '/testimonial/',
    GET_ALL: '/testimonial/',
    GET_ONE: (id: number) => `/testimonial/${id}/`,
    UPDATE: (id: number) => `/testimonial/${id}/`,
    DELETE: (id: number) => `/testimonial/${id}/`,
  },
  PROJECTS: {
    SEND: '/portfolio/',
    GET_ALL: '/portfolio/',
    GET_ONE: (id: number) => `/portfolio/${id}/`,
    UPDATE: (id: number) => `/portfolio/${id}/`,
    DELETE: (id: number) => `/portfolio/${id}/`,
  },
  ROLES: {
    GET_USERS: '/auth/users/',
    ADD_USER: '/auth/users/',
    GET_SINGLE_USER: (id: number) => `/auth/users/${id}/`,
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