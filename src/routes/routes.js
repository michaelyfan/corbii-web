
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
  denied: {
    base: '/denied'
  }
};

export default routes;