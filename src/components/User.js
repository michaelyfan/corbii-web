import React from 'react';
import { Link } from 'react-router-dom';
import { getUserAll } from '../utils/api';
import routes from '../routes/routes';

function DeckMiniView(props) {
  const { id, name } = props;
  return (
    <div className='deck-mini-view'>
      <h3>{name}</h3>
      <Link to={`${routes.viewDeck}/${id}`}>
        <button>View</button>
      </Link>  
    </div>
  );
}

class User extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      decks: [],
      profilePic: null
    };
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
    }
  }

  render() {
    return (
      <div>
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