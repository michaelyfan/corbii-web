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

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profilePic: null,
      initialLoading: true,
      signedIn: false
    };

    this.doGetProfilePic = this.doGetProfilePic.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState(() => ({
          signedIn: true,
          initialLoading: false
        }));
        this.doGetProfilePic();
      } else {
        this.setState(() => ({
          signedIn: false,
          initialLoading: false,
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

    const { signedIn, profilePic, initialLoading } = this.state;

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
            <Route 
              exact path='/dashboard'
              render={(props) => 
                <Dashboard {...props}
                  signedIn={signedIn} />} />
            <Route 
              exact path='/profile'
              render={(props) => 
                <Profile {...props} 
                  doGetProfilePic={this.doGetProfilePic}
                  profilePic={profilePic}
                  signedIn={signedIn} />} />
            <Route
              path='/create'
              render={(props) => 
                <Create {...props}
                  signedIn={signedIn} />} />
            <Route
              path='/decks'
              component={Deck} />
            <Route
              path='/conceptlists'
              component={ConceptList} />
            <Route
              path='/study/deck'
              render={(props) =>
                <StudyDeck {...props}
                  signedIn={signedIn} />} />
            <Route
              path='/study/conceptlist/:id'
              render={(props) =>
                <StudyConcept {...props}
                  signedIn={signedIn} />} />
            <Route
              path='/user'
              component={User} />
            <Route component={NotFound} />
          </Switch>
          <Footer />
        </div>
      </Router>
    )
  }
}

export default App;