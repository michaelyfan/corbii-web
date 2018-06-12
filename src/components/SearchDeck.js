import React from 'react';
import { searchDecks } from '../utils/api';
import { Route, Link } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';

function SearchResult(props) {
  return (
    <div className='deck-search-result'>
      <h3>{props.name}</h3>
      <p>Created by: {props.creator}</p>
      <p>{props.count} {props.count === 1 ? 'card' : 'cards'}</p>
      <Link 
        to={{
          pathname: `/decks/view`,
          search: `?d=${props.id}`
        }}>
        <button onClick={props.unsubscribeListener}>
          View
        </button>
      </Link>
    </div>
  )
}

SearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
}

class DeckSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      statusText: '',
      results: []
    };

    this.unsubscribeListener = this.unsubscribeListener.bind(this); 
  }

  componentWillMount() {
    const { q } = queryString.parse(this.props.location.search);
    this.updateResults(q);
  }

  componentDidMount() {
    this.unlisten = this.props.history.listen((location, action) => {
      const { q } = queryString.parse(location.search)
      this.updateResults(q);
    });
  }

  unsubscribeListener() {
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
                  unsubscribeListener={this.unsubscribeListener}
                  count={result.count} />
              )
            })
        }
      </div>
    )
  }

}

export default DeckSearch;