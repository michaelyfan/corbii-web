
const routes = {
  home: {
    base: '/'
  },
  faq: {
    base: '/FAQ'
  },
  privacypolicy: {
    base: '/privacypolicy'
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
  study: {
    base: '/study',
    deckTemplate: '/study/deck/:id',
    getDeckRoute: ((id) => `/study/deck/${id}`),
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