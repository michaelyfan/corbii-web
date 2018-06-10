import React from 'react';
import firebase from '../utils/firebase';
import { getDecks } from '../utils/api';
import parser from '../utils/parser';
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import Nav from './Nav';
import About from './About';
import Search from './Search';
import Auth from './Auth';
import DeckList from './DeckList';
import Deck from './Deck';

class App extends React.Component {
  constructor(props) {
    super(props);

      this.state = {
        name: '',
        uid: '',
        profilePic: '',
        signedIn: false,
        deckArr: []
      };

      this.getDecks = this.getDecks.bind(this);
      this.clearDecks = this.clearDecks.bind(this);
    }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const {name, uid, pic} = parser.parseFirebaseUser(user);
        this.setState(() => ({
          name: name,
          uid: uid,
          profilePic: pic,
          signedIn: true
        }))
        this.getDecks();
      } else {
        this.setState(() => ({
          name: '',
          uid: '',
          profilePic: '',
          signedIn: false,
        }))
        this.clearDecks();
      }
    });
  }

  getDecks() {
    getDecks(this.state.uid).then((decks) => {
      this.setState(() => ({
        deckArr: decks
      }))
    }).catch((err) => {
      console.log('See error :(');
    })
  }

  clearDecks() {
    this.setState(() => ({
      deckArr: []
    }))
  }


  render() {

    return (
      <Router>
        <div>
          <Nav signedIn={this.state.signedIn} uid={this.state.uid} name={this.state.name} profilePic={this.state.profilePic} />
          <Switch>
            <Route 
              exact path='/' 
              render={(props) => 
                <Auth {...props} 
                  uid={this.state.uid}
                  name={this.state.name}
                  signedIn={this.state.signedIn}
                  profilePic={this.state.profilePic} />} />
            <Route
              path='/about'
              component={About} />
            <Route
              path='/search'
              render={(props) =>
                <Search {...props}
                  uid={this.state.uid}
                  signedIn={this.state.signedIn} /> } />
            <Route 
              exact path='/decks'
              render={(props) => this.state.signedIn ? (
                  <DeckList {...props} 
                    name={this.state.name}
                    uid={this.state.uid}
                    deckArr={this.state.deckArr}
                    getDecks={this.getDecks} />
                  ) : (
                    <Redirect to='/' />
                  )
              } />
            <Route
              path='/decks/view'
              render={(props) => this.state.signedIn ? (
                <Deck {...props} 
                  uid={this.state.uid}
                />
                ) : (
                  <Redirect to='/' />
                )
            } />
            <Route render={() => {
              return (
                <div>
                  <p>You've discovered a 404 page.</p>
                  <Link to='/'>Return home</Link>
                </div>
              )
            }} />
          </Switch>
          
        </div>
      </Router>
    )
  }
}

export default App;