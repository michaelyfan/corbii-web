import React from 'react';
import firebase from '../utils/firebase';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { getUserOnLogin, getCurrentUserProfilePic, createNewDbUser } from '../utils/api';
import { hot } from 'react-hot-loader';
import routes from '../routes/routes';
import Nav from './Nav';
import FAQ from './FAQ';
import Search from './Search';
import Deck from './Deck';
import Footer from './Footer';
import Homepage from './Homepage';
import User from './User';
import NotFound from './NotFound';
import Profile from './Profile';
import StudyDeck from './StudyDeck';
import Dashboard from './Dashboard';
import Create from './Create';
import DeniedNoAuth from './DeniedNoAuth';
import { BigLoading } from './reusables/Loading';

/* eslint-disable-next-line */
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
    };

    this.doGetProfilePic = this.doGetProfilePic.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        getUserOnLogin().then((result) => {
          if (result.exists) {
            this.setState(() => ({
              signedIn: true,
              loading: false
            }));
            this.doGetProfilePic();
          } else {
            return createNewDbUser().then(() => {
              this.setState(() => ({
                signedIn: true,
                loading: false
              }));
              this.doGetProfilePic();
            });
          }
        }).catch((err) => {
          alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
          // eslint-disable-next-line
          console.error(err);
        });
      } else {
        this.setState(() => ({
          signedIn: false,
          loading: false,
          photoURL: ''
        }));
      }
    });
  }

  doGetProfilePic() {
    getCurrentUserProfilePic().then((url) => {
      this.setState(() => ({photoURL: url}));
    }).catch((err) => {
      // eslint-disable-next-line
      console.trace(err);
    });
  }

  render() {

    const { signedIn, photoURL, loading } = this.state;

    return (
      <Router>
        <div id='app-wrapper'>
          <Nav photoURL={photoURL} 
            signedIn={signedIn} />
          <div className='app-content'>
            <Switch>
              <Route 
                exact path={routes.home.base} 
                render={(props) => 
                  <Homepage {...props} 
                    signedIn={signedIn} />} />
              <Route
                path={routes.faq.base}
                component={FAQ} />
              <Route
                path={routes.search.base}
                component={Search} />
              <PrivateRoute
                exact path={routes.dashboard.base}
                signedIn={signedIn}
                loading={loading}
                component={Dashboard} />
              <PrivateRoute
                exact path={routes.profile.base}
                signedIn={signedIn}
                loading={loading}
                render={(props) => 
                  <Profile {...props} 
                    doGetProfilePic={this.doGetProfilePic}
                    photoURL={photoURL} />} />
              <PrivateRoute
                path={routes.create.base}
                signedIn={signedIn}
                loading={loading}
                component={Create} />
              <Route
                path={routes.viewDeck.template}
                component={Deck} />
              <PrivateRoute
                path={routes.study.deckTemplate}
                signedIn={signedIn}
                loading={loading}
                component={StudyDeck} />
              <Route
                path={routes.viewUser.template}
                component={User} />
              <Route
                path={routes.denied.base}
                component={DeniedNoAuth} />
              <Route component={NotFound} />
            </Switch>
          </div>
          <Footer signedIn={signedIn} />
        </div>
      </Router>
    );
  }
}

export default hot(module)(App);