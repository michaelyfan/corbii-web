import React from 'react';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import { getUserAll, getProfilePic } from '../utils/api';
import routes from '../routes/routes';

function DeckMiniView(props) {
  const { id, name } = props;
  return (
    <div className='deck-mini-view'>
      <h3>{name}</h3>
      <Link to={`${routes.viewDeckRoute}/${id}`}>
        <button>View</button>
      </Link>  
    </div>
  )
}

class User extends React.Component {

  constructor(props) {
    super();
    this.state = {
      name: '',
      decks: [],
      statusText: '',
      profilePic: null
    }
  }

  componentDidMount() {
    this.updateDeck();
  }

  async updateDeck() {
    const { u } = this.props.match.params;
    let user;
    try {
      user = await getUserAll(u);
      this.setState(() => ({
        name: user.name,
        decks: user.decks,
        id: user.id,
        profilePic: user.photoURL
      }));

    } catch(err) {
      console.error(err);
      this.setState(() => ({statusText: 'There was an error. Check the console and refresh the app.'}));
    }
  }

  render() {
    return (
      <div>
        {this.state.statusText}
        {this.state.profilePic && <img className='profile-img' src={this.state.profilePic} /> }
        <h2>{this.state.name}</h2>
        {this.state.decks.map((deck) => 
          <DeckMiniView 
            key={deck.id}
            id={deck.id}
            name={deck.name} />
        )}
      </div>
    );
  }
}

export default User;