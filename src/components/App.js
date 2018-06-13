import React from 'react';
import firebase from '../utils/firebase';
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
        signedIn: false
      };
    }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState(() => ({signedIn: true}))
      } else {
        this.setState(() => ({signedIn: false}))
      }
    });
  }

  render() {

    return (
      <Router>
        <div>
          <Nav />
          <Switch>
            <Route 
              exact path='/' 
              render={(props) => 
                <Auth {...props} 
                  signedIn={this.state.signedIn} />} />
            <Route
              path='/about'
              component={About} />
            <Route
              path='/search'
              component={Search} />
            <Route 
              exact path='/decks'
              render={(props) => this.state.signedIn ? (
                    <DeckList {...props} />
                  ) : (
                    <Redirect to='/' />
                  )
              } />
            <Route
              path='/decks/view'
              render={(props) => this.state.signedIn ? (
                <Deck {...props} />
                ) : (
                  <Redirect to='/' />
                )
            } />
            <Route render={() => {
              return (
                <div>
                  <h1>You've discovered a 404 page.</h1>
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