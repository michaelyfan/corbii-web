import React from 'react';
import { searchDecks } from '../utils/api';
import { Route, Link } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';

function SearchResult(props) {
  return (
    <div className='result-box'>
      <Link 
        to={{
          pathname: `/decks`,
          search: `?d=${props.id}`
        }}>
        <p className = 'deck-text' id = 'deck-name'>{props.name}</p>
      </Link>
      <p className = 'deck-text' id = 'deck-owner'>{props.creator}</p>
      <p className = 'deck-text' id = 'num-of-terms'>{props.count} {props.count === 1 ? 'card' : 'cards'}</p>
      
    </div>
  )
}

SearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
}

class SearchDeck extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      statusText: '',
      results: []
    };
  }

  componentDidMount() {
    const { q } = queryString.parse(this.props.location.search);
    this.updateResults(q);


    this.unlisten = this.props.history.listen((location, action) => {
      if (location.pathname === '/search/decks') {
        const { q } = queryString.parse(location.search);
        this.updateResults(q);
      }
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  async updateResults(query) {
    try {
      const results = await searchDecks(query);
      this.setState(() => ({
        results: results
      }));
    } catch(err) {
      console.log(err);
      this.setState(() => ({
        statusText: 'There was an error. Check the console and refresh the app.' 
      }));
    }

  }

  render() {
    return (
      <div>
        <p>{this.state.statusText}</p>
        {this.state.results.length === 0
          ? <p>We didn't find anything  :(  try another search.</p>
          : this.state.results.map((result) => {
              return (
                <SearchResult 
                  key={result.objectID}
                  id={result.objectID}
                  name={result.name}
                  creator={result.creatorName}
                  count={result.count} />
              )
            })
        }
      </div>
    )
  }

}

export default SearchDeck;