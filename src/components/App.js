import React from 'react';
import firebase from '../utils/firebase';
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import { getCurrentUserProfilePic } from '../utils/api';
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

function PrivateRoute({ component: Component, render, signedIn, loading, ...rest }) {
  
  return <Route {...rest} render={(props) => (
    loading
      ? <h1>Loading...</h1>
      : signedIn
        ? Component
          ? <Component {...props} />
          : render()
        : <Redirect to='/denied' />
  )} />
}


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      photoURL: '',
      loading: true,
      signedIn: false
    };

    this.doGetProfilePic = this.doGetProfilePic.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState(() => ({
          signedIn: true,
          loading: false
        }));
        this.doGetProfilePic();
      } else {
        this.setState(() => ({
          signedIn: false,
          loading: false,
          photoURL: ''
        }))
      }
    });
  }

  doGetProfilePic() {
    getCurrentUserProfilePic().then((url) => {
      this.setState(() => ({photoURL: url}))
    }).catch((err) => {
      console.error(err);
    })
  }


  render() {

    const { signedIn, photoURL, loading } = this.state;

    return (
      <Router>
        <div>
          <Nav photoURL={photoURL} signedIn={signedIn} doGetProfilePic={this.doGetProfilePic} />
          <Switch>
            <Route 
              exact path={routes.homeRoute} 
              render={(props) => 
                <Homepage {...props} 
                  signedIn={signedIn}
                  doGetProfilePic={this.doGetProfilePic} />} />
            <Route
              path={routes.faqRoute}
              component={FAQ} />
            <Route
              path={routes.searchRoute}
              component={Search} />
            <PrivateRoute 
              exact path={routes.dashboardRoute}
              signedIn={signedIn}
              loading={loading}
              component={Dashboard} />
            <PrivateRoute
              exact path={routes.profileRoute}
              signedIn={signedIn}
              loading={loading}
              render={(props) => 
                <Profile {...props} 
                  doGetProfilePic={this.doGetProfilePic}
                  photoURL={photoURL} />} />
            <PrivateRoute
              path={routes.createRoute}
              signedIn={signedIn}
              loading={loading}
              component={Create} />
            <Route
              path={`${routes.viewDeckRoute}/:id`}
              component={Deck} />
            <Route
              path={`${routes.viewConceptListRoute}/:id`}
              component={ConceptList} />
            <PrivateRoute
              path={`${routes.studyDeckRoute}/:id`}
              signedIn={signedIn}
              loading={loading}
              component={StudyDeck} />
            <PrivateRoute
              path={`${routes.studyConceptListRoute}/:id`}
              signedIn={signedIn}
              loading={loading}
              component={StudyConcept} />
            <Route
              path='/user/:id'
              component={User} />
            <Route
              path='/denied'
              component={DeniedNoAuth} />              
            <Route component={NotFound} />
          </Switch>
          <Footer />
        </div>
      </Router>
    )
  }
}

export default App;