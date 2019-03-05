
const routes = {
  home: {
    base: '/'
  },
  faq: {
    base: '/FAQ'
  },
  search: {
    base: '/search',
    getQueryString: ((mode, query) => `?mode=${mode}&q=${query}`)
  },
  dashboard: {
    base: '/dashboard'
  },
  profile: {
    base: '/profile'
  },
  create: {
    base: '/create'
  },
  viewDeck: {
    base: '/deck',
    template: '/deck/:id',
    getRoute: ((id) => `/deck/${id}`)
  },
  viewConceptList: {
    base: '/conceptlist',
    template: '/conceptlist/:id',
    getRoute: ((id) => `/conceptlist/${id}`)
  },
  study: {
    base: '/study',
    deckTemplate: '/study/deck/:id',
    conceptListTemplate: '/study/conceptlist/:id',
    getDeckRoute: ((id) => `/study/deck/${id}`),
    getConceptListRoute: ((id) => `/study/conceptlist/${id}`)
  },
  viewUser: {
    base: '/user',
    template: '/user/:id',
    getRoute: ((id) => `/user/${id}`)
  },
  classroom: {
    base: '/classroom',
    template: '/classroom/:id',
    getRoute: ((id) => `/classroom/${id}`)
  },
  classroomStudy: {
    base: '/classstudy',
    template: '/classstudy/:id',
    getRoute: ((id) => `/classstudy/${id}`)
  },
  teacher: {
    base: '/teacher',
    dashboard: '/teacher/dashboard',
    create: '/teacher/create',

    classSettingsTemplate: '/teacher/classroom/:id/settings',

    viewDeckEditBase: '/teacher/editdeck',
    viewDeckEditTemplate: '/teacher/editdeck/:classroomId/:id',

    viewClassroomTemplate: '/teacher/classroom/:id',
    viewStudentsTemplate: '/teacher/students/:id',
    viewStudentTemplate: '/teacher/student/:classroomId/:userId',
    viewDecksTemplate: '/teacher/decks/:id',
    viewDeckTemplate: '/teacher/deck/:classroomId/:deckId',

    getClassSettingsRoute: ((classroomId) => `/teacher/classroom/${classroomId}/settings`),
    getViewDeckEditRoute: ((classroomId, deckId) => `/teacher/editdeck/${classroomId}/${deckId}`),
    getViewClassroomRoute: ((id) => `/teacher/classroom/${id}`),
    getViewStudentsRoute: ((id) => `/teacher/students/${id}`),
    getViewStudentRoute: ((classroomId, userId) => `/teacher/student/${classroomId}/${userId}`),
    getViewDecksRoute: ((id) => `/teacher/decks/${id}`),
    getViewDeckRoute: ((classroomId, deckId) => `/teacher/deck/${classroomId}/${deckId}`)
  },
  denied: {
    base: '/denied'
  }
};

export default routes;