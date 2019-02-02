import React from 'react';
import { Route, Link } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import routes from '../routes/routes';
import { searchUsers, searchDecks, searchLists, getProfilePic } from '../utils/api';


function DeckSearchResult(props) {
  return (
    <div className='result-box'>
      <Link to={routes.viewDeck.getRoute(props.id)}>
        <p className = 'deck-text' id = 'deck-name'>{props.name}</p>
      </Link>
      <p className = 'deck-text' id = 'deck-owner'>{props.creator}</p>
      <p className = 'deck-text' id = 'num-of-terms'>{props.count} {props.count === 1 ? 'card' : 'cards'}</p>
      
    </div>
  )
}

DeckSearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired
}

class UserSearchResult extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profilePic: null
    }
  }

  componentDidMount() {
    getProfilePic(this.props.id).then((result) => {
      this.setState(() => ({profilePic: result}))
    }).catch((err) => {
      console.error(err);
    });
  }

  render() {
    const { name, id } = this.props;
    return (
      <div className='user-search-result'>
        <img src={this.state.profilePic} />
        <h3>{name}</h3>
        <Link to={routes.viewUser.getRoute(id)}>
          <button>
            View
          </button>
        </Link>
      </div>
    );
  }
  
}

UserSearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

function ListSearchResult(props) {
  const { id, name, creator, count } = props;
  return (
    <div className='result-box'>
      <Link to={routes.viewConceptList.getRoute(id)}>
        <p className = 'deck-text' id = 'deck-name'>{name}</p>
      </Link>
      <p className = 'deck-text' id = 'deck-owner'>{creator}</p>
      <p className = 'deck-text' id = 'num-of-terms'>{count} {count === 1 ? 'concept' : 'concepts'}</p>
      
    </div>
  )
}

ListSearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired
}

class SearchResults extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      mode: 'decks',
      results: []
    }
  }

  componentDidMount() {
    const { q, mode } = queryString.parse(this.props.location.search);
    this.setState(() => ({
      mode: mode
    }), () => {
      this.updateResults(q, mode);
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search != this.props.location.search) {
      const { q, mode } = queryString.parse(this.props.location.search);
      this.setState(() => ({
        mode: mode,
        results: []
      }), () => {
        this.updateResults(q, mode);
      })
    }
  }

  async updateResults(query, mode) {
    if (mode == null) {
      mode = 'decks';
    }
    if (query == null) {
      query = '';
    }
    let results;
    try {
      if (mode === 'users') {
        results = await searchUsers(query);
      } else if (mode === 'lists') {
        results = await searchLists(query);
      } else { // deck search, even if mode query string isn't 'decks'
        results = await searchDecks(query);
      }
      this.setState(() => ({
        results: results
      }))
    } catch(err) {
      console.log(err);
    }
  }


  render() {
    const { mode, results } = this.state;

    return (
      <div>
        {results.length === 0
          ? <p>We didn't find anything  :(  try another search.</p>
          : results.map((result) => {
              if (mode === 'users') {
                return <UserSearchResult
                          name={result.name}
                          id={result.objectID}
                          key={result.objectID} />
              } else if (mode === 'lists') {
                return <ListSearchResult
                          name={result.name}
                          creator={result.creatorName}
                          count={result.count}
                          id={result.objectID}
                          key={result.objectID} />
              } else { // render a deck
                return <DeckSearchResult
                          name={result.name}
                          creator={result.creatorName}
                          count={result.count}
                          id={result.objectID}
                          key={result.objectID} />
              }
            })
        }
        
      </div>
    )
  }


}

export default SearchResults;