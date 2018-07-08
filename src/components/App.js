import React from 'react';
import firebase from '../utils/firebase';
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import { getCurrentUserProfilePic } from '../utils/api';
import Nav from './Nav';
import FAQ from './FAQ';
import Search from './Search';
import Auth from './Auth';
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
      profilePic: null,
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
          profilePic: null
        }))
      }
    });
  }

  doGetProfilePic() {
    getCurrentUserProfilePic().then((url) => {
      this.setState(() => ({profilePic: url}))
    }).catch((err) => {
      console.error(err);
    })
  }


  render() {

    const { signedIn, profilePic, loading } = this.state;

    return (
      <Router>
        <div>
          <Nav profilePic={profilePic} />
          <Switch>
            <Route 
              exact path='/' 
              render={(props) => 
                <Homepage {...props} 
                  signedIn={signedIn}
                  doGetProfilePic={this.doGetProfilePic} />} />
            <Route
              path='/FAQ'
              component={FAQ} />
            <Route
              path='/search'
              component={Search} />
            <PrivateRoute 
              exact path='/dashboard'
              signedIn={signedIn}
              loading={loading}
              component={Dashboard} />
            <PrivateRoute
              exact path='/profile'
              signedIn={signedIn}
              loading={loading}
              render={(props) => 
                <Profile {...props} 
                  doGetProfilePic={this.doGetProfilePic}
                  profilePic={profilePic} />} />
            <PrivateRoute
              path='/create'
              signedIn={signedIn}
              loading={loading}
              component={Create} />
            <Route
              path='/decks'
              component={Deck} />
            <Route
              path='/conceptlists'
              component={ConceptList} />
            <PrivateRoute
              path='/study/deck'
              signedIn={signedIn}
              loading={loading}
              component={StudyDeck} />
            <PrivateRoute
              path='/study/conceptlist/:id'
              component={StudyConcept} />
            <Route
              path='/user'
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