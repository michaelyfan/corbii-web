import React from 'react';
import firebase from '../utils/firebase';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { getUserOnLogin, getCurrentUserProfilePic, createNewDbUser } from '../utils/api';
import routes from '../routes/routes';
import Nav from './Nav';
import FAQ from './FAQ';
import Search from './Search';
import Deck from './Deck';
import ConceptList from './ConceptList';
import Footer from './Footer';
import Homepage from './Homepage';
import User from './User';
import NotFound from './NotFound';
import Profile from './Profile';
import StudyConcept from './StudyConcept';
import StudyDeck from './StudyDeck';
import Dashboard from './Dashboard';
import Create from './Create';
import DeniedNoAuth from './DeniedNoAuth';
import { BigLoading } from './reusables/Loading';

import ClassroomStudentView from './teacher-student/ClassroomStudentView';
import TeacherDashboard from './teacher-student/TeacherDashboard';
import ClassroomSettings from './teacher-student/ClassroomSettings';
import ClassroomTeacherView from './teacher-student/ClassroomTeacherView';
import StudentsTeacherView from './teacher-student/StudentsTeacherView';
import StudentTeacherView from './teacher-student/StudentTeacherView';
import DeckTeacherView from './teacher-student/DeckTeacherView';
import DecksTeacherView from './teacher-student/DecksTeacherView';

function TeacherPrivateRoute({ component: Component, render, signedIn, isTeacher, loading, ...rest }) {
  return <Route {...rest} render={(props) => (
    loading
      ? <BigLoading />
      : signedIn && isTeacher
        ? Component
          ? <Component {...props} />
          : render()  
        : <Redirect to='/denied' />
  )} />;
}

function StudentPrivateRoute({ component: Component, render, signedIn, isTeacher, loading, ...rest }) {
  return <Route {...rest} render={(props) => (
    loading
      ? <BigLoading />
      : signedIn && !isTeacher
        ? Component
          ? <Component {...props} />
          : render()  
        : <Redirect to='/denied' />
  )} />;
}

function PrivateRoute({ component: Component, render, signedIn, loading, ...rest }) {
  return <Route {...rest} render={(props) => (
    loading
      ? <BigLoading />
      : signedIn
        ? Component
          ? <Component {...props} />
          : render()
        : <Redirect to='/denied' />
  )} />;
}


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      photoURL: '',
      loading: true,
      signedIn: false,
      isTeacher: false,
      teacherIsRegistering: false
    };

    this.doGetProfilePic = this.doGetProfilePic.bind(this);
    this.handleStudentClickRegister = this.handleStudentClickRegister.bind(this);
    this.handleTeacherClickRegister = this.handleTeacherClickRegister.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        getUserOnLogin().then((result) => {
          if (result.exists) {
            if (result.isTeacher) {
              this.setState(() => ({
                signedIn: true,
                isTeacher: true,
                loading: false
              }));
            } else {
              this.setState(() => ({
                signedIn: true,
                isTeacher: false,
                loading: false
              }));
            }
            this.doGetProfilePic();
          } else {
            return createNewDbUser(this.state.teacherIsRegistering).then(() => {
              this.setState(() => ({
                signedIn: true,
                isTeacher: this.state.teacherIsRegistering,
                loading: false
              }));
              this.doGetProfilePic();
            });
          }
        }).catch((err) => {
          alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
          console.error(err);
        });
      } else {
        this.setState(() => ({
          signedIn: false,
          loading: false,
          isTeacher: false,
          photoURL: ''
        }));
      }
    });
  }

  doGetProfilePic() {
    getCurrentUserProfilePic().then((url) => {
      this.setState(() => ({photoURL: url}));
    }).catch((err) => {
      console.trace(err);
    });
  }

  handleStudentClickRegister() {
    this.setState(() => ({
      teacherIsRegistering: false
    }));
  }

  handleTeacherClickRegister() {
    this.setState(() => ({
      teacherIsRegistering: true
    }));
  }

  render() {

    const { signedIn, photoURL, loading, isTeacher } = this.state;

    return (
      <Router>
        <div>
          <Nav photoURL={photoURL} 
            signedIn={signedIn} 
            isTeacher={isTeacher} 
            handleStudentClickRegister={this.handleStudentClickRegister} />
          <div className='app-content'>
            <Switch>
              <Route 
                exact path={routes.home.base} 
                render={(props) => 
                  <Homepage {...props} 
                    signedIn={signedIn}
                    isTeacher={isTeacher}
                    handleStudentClickRegister={this.handleStudentClickRegister}
                    handleTeacherClickRegister={this.handleTeacherClickRegister} />} />
              <Route
                path={routes.faq.base}
                component={FAQ} />
              <Route
                path={routes.search.base}
                component={Search} />
              <StudentPrivateRoute 
                exact path={routes.dashboard.base}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={Dashboard} />
              <PrivateRoute
                exact path={routes.profile.base}
                signedIn={signedIn}
                loading={loading}
                render={(props) => 
                  <Profile {...props} 
                    doGetProfilePic={this.doGetProfilePic}
                    isTeacher={isTeacher}
                    photoURL={photoURL} />} />
              <PrivateRoute
                path={routes.create.base}
                signedIn={signedIn}
                loading={loading}
                component={Create} />
              <Route
                path={routes.viewDeck.template}
                component={Deck} />
              <Route
                path={routes.viewConceptList.template}
                component={ConceptList} />
              <StudentPrivateRoute
                path={routes.study.deckTemplate}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={StudyDeck} />
              <StudentPrivateRoute
                path={routes.study.conceptListTemplate}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={StudyConcept} />
              <Route
                path={routes.viewUser.template}
                component={User} />
              <StudentPrivateRoute
                exact path={routes.classroom.template}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={ClassroomStudentView} />
              <StudentPrivateRoute
                path={routes.classroomStudy.template}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={StudyDeck} />
              <Route
                exact path={routes.teacher.base}
                render={() => (
                  <Redirect to={`${routes.home.base}`} />
                )} />

              <TeacherPrivateRoute
                path={routes.teacher.dashboard}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={TeacherDashboard} />
              <TeacherPrivateRoute
                path={routes.teacher.classSettingsTemplate}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={ClassroomSettings} />
              <TeacherPrivateRoute
                exact path={routes.teacher.viewClassroomTemplate}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={ClassroomTeacherView} />
              <TeacherPrivateRoute
                path={routes.teacher.viewStudentsTemplate}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={StudentsTeacherView} />
              <TeacherPrivateRoute
                exact path={routes.teacher.viewStudentTemplate}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={StudentTeacherView} />
              <TeacherPrivateRoute
                exact path={routes.teacher.viewDecksTemplate}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={DecksTeacherView} />
              <TeacherPrivateRoute
                exact path={routes.teacher.viewDeckTemplate}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={DeckTeacherView} />
              <TeacherPrivateRoute
                exact path={routes.teacher.create}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={Create} />
              <TeacherPrivateRoute
                exact path={routes.teacher.viewDeckEditTemplate}
                signedIn={signedIn}
                isTeacher={isTeacher}
                loading={loading}
                component={Deck} />
              <Route
                path={routes.denied.base}
                component={DeniedNoAuth} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <Footer isTeacher={isTeacher} signedIn={signedIn} />
        </div>
      </Router>
    );
  }
}

export default App;