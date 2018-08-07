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
import { BigLoading } from './Loading';

function PrivateRoute({ component: Component, render, signedIn, loading, ...rest }) {
  
  return <Route {...rest} render={(props) => (
    loading
      ? <BigLoading />
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
              exact path={routes.home} 
              render={(props) => 
                <Homepage {...props} 
                  signedIn={signedIn}
                  doGetProfilePic={this.doGetProfilePic} />} />
            <Route
              path={routes.faq}
              component={FAQ} />
            <Route
              path={routes.search}
              component={Search} />
            <PrivateRoute 
              exact path={routes.dashboard}
              signedIn={signedIn}
              loading={loading}
              component={Dashboard} />
            <PrivateRoute
              exact path={routes.profile}
              signedIn={signedIn}
              loading={loading}
              render={(props) => 
                <Profile {...props} 
                  doGetProfilePic={this.doGetProfilePic}
                  photoURL={photoURL} />} />
            <PrivateRoute
              path={routes.create}
              signedIn={signedIn}
              loading={loading}
              component={Create} />
            <Route
              path={`${routes.viewDeck}/:id`}
              component={Deck} />
            <Route
              path={`${routes.viewConceptList}/:id`}
              component={ConceptList} />
            <PrivateRoute
              path={`${routes.studyDeck}/:id`}
              signedIn={signedIn}
              loading={loading}
              component={StudyDeck} />
            <PrivateRoute
              path={`${routes.studyConceptList}/:id`}
              signedIn={signedIn}
              loading={loading}
              component={StudyConcept} />
            <Route
              path={`${routes.viewUser}/:id`}
              component={User} />
            <Route
              path={`${routes.denied}`}
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