
const routes = {
  home: '/',
  
  faq: '/FAQ',
  
  search: '/search', 
  searchResults: '/search/s', // has queries and shit

  dashboard: '/dashboard',
  
  profile: '/profile',
  
  create: '/create',
  
  viewDeck: '/deck', // has params
  
  viewConceptList: '/conceptlist', //has params
  
  study: '/study',
  studyDeck: '/study/deck',
  studyConceptList: '/study/conceptlist',
  
  viewUser: '/user', // has params

  classroom: '/classroom', // has params
  classroomStudy: '/classstudy', // has params

  teacher: '/teacher',
  teacherDashboard: '/teacher/dashboard',
  teacherCreate: '/teacher/create',
  teacherViewClassroom: '/teacher/classroom', // has params
  teacherViewStudents: '/teacher/students',
  teacherViewStudent: '/teacher/student', // has params
  teacherViewDeck: '/teacher/deck', // has params


  denied: '/denied'
}

export default routes;