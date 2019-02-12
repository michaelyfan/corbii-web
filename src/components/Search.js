import React from 'react';
import { Route, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from '../routes/routes';
import queryString from 'query-string';
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
  );
}

class UserSearchResult extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      profilePic: null
    };
  }

  componentDidMount() {
    getProfilePic(this.props.id).then((result) => {
      this.setState(() => ({profilePic: result}));
    }).catch((err) => {
      console.error(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
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
  );
}

class SearchResults extends React.Component {

  constructor(props) {
    super(props);

    /*
      Because 'results' must be consistent with the mode that is being
    */
    this.state = {
      results: [],
      displayedMode: ''
    };
  }

  componentDidUpdate(prevProps) {
    const { mode, query } = this.props;
    if (mode != prevProps.mode || query != prevProps.query) {
      this.updateResults();
    }
  }

  async updateResults() {
    const { query, mode } = this.props;
    if (query.trim().length > 0) {
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
          results: results,
          displayedMode: mode
        }));
      } catch(err) {
        console.log(err);
        alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
      }
    }
  }


  render() {
    const { results, displayedMode } = this.state;
    const { query } = this.props;

    if (query.trim().length > 0) {
      return (
        <div>
          {results.length === 0
            ? <p>We didn&apos;t find anything  :(  try another search.</p>
            : results.map((result) => {
              if (displayedMode === 'users') {
                return <UserSearchResult
                  name={result.name}
                  id={result.objectID}
                  key={result.objectID} />;
              } else if (displayedMode === 'lists') {
                return <ListSearchResult
                  name={result.name}
                  creator={result.creatorName}
                  count={result.count}
                  id={result.objectID}
                  key={result.objectID} />;
              } else { // render a deck
                return <DeckSearchResult
                  name={result.name}
                  creator={result.creatorName}
                  count={result.count}
                  id={result.objectID}
                  key={result.objectID} />;
              }
            })
          }
        </div>
      );
    } else {
      return (
        <div>
          <h2>Enter a search term.</h2>
        </div>
      );
    }
  }
}

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      newQuery: ''
    };

    this.enterActivator = this.enterActivator.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
  }

  enterActivator(e) {
    e.preventDefault();
  }

  componentDidMount() {
    this.checkNullParams();
  }

  componentDidUpdate(prevProps, prevState) {
    const { q } = queryString.parse(this.props.location.search);
    const prevQ = queryString.parse(prevProps.location.search).q;

    // set 'newQuery' to be the route's query property
    if (q != null && q != prevState.newQuery && q != prevQ) {
      this.setState(() => ({
        newQuery: q
      }));
    }
  }

  checkNullParams() {
    const { q, mode } = queryString.parse(this.props.location.search);

    // check for null query params (missing in route)
    if (mode == null && q == null) {
      this.props.history.push({
        pathname: routes.search.base,
        search: routes.search.getQueryString('decks', '')
      });
    } else if (mode == null) {
      this.props.history.push({
        pathname: routes.search.base,
        search: routes.search.getQueryString('decks', q)
      });
    } else if (q == null) {
      this.props.history.push({
        pathname: routes.search.base,
        search: routes.search.getQueryString(mode, '')
      });
    }
  }

  handleChangeSearch(e) {
    const value = e.target.value;
    this.setState(() => ({
      newQuery: value
    }));
  }

  render() {
    const { newQuery } = this.state;
    const { mode, q } = queryString.parse(this.props.location.search);

    return (
      <div>
        <div className = 'main-searchbar'>
          <form onSubmit={this.enterActivator}>
            <div>
              <input 
                id = "big-search"
                maxLength='1000'
                type = "text" 
                placeholder = "search. . ."
                onChange={this.handleChangeSearch} value={newQuery} />
              <Link
                to={{
                  pathname: routes.search.base,
                  search: routes.search.getQueryString(mode, newQuery)
                }}>
                <button type='submit' className='no-display'></button>
              </Link>

              <Link
                to={{
                  pathname: routes.search.base,
                  search: routes.search.getQueryString('decks', q)
                }}>
                <button className = 'filter-button' id = 'show-decks'> show decks </button>
              </Link>
              <Link
                to={{
                  pathname: routes.search.base,
                  search: routes.search.getQueryString('users', q)
                }}>
                <button className = 'filter-button' id = 'show-users'> show users </button>
              </Link>
              <Link
                to={{
                  pathname: routes.search.base,
                  search: routes.search.getQueryString('lists', q)
                }}>
                <button className = 'filter-button' id = 'show-decks'> show lists </button>
              </Link>
            </div>
          </form>
        </div>
        { mode != null && q != null
          ? <SearchResults mode={mode} query={q} />
          : null }
      </div>
    );
  }
}

Search.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};
SearchResults.propTypes = {
  mode: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired
};
ListSearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired
};
UserSearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
DeckSearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired
};

export default Search;