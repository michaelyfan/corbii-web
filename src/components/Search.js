import React from 'react';
import { searchDecks } from '../utils/api';
import PropTypes from 'prop-types';

function SearchResultCard(props) {
  return (
    <div className='search-card'>
      <div>
        <p>Front:</p>
        <p>{props.front}</p>
      </div>
      <div>
        <p>Back:</p>
        <p>{props.back}</p>
      </div>
    </div>
  )
}

SearchResultCard.propTypes = {
  front: PropTypes.string.isRequired,
  back: PropTypes.string.isRequired
}

function DeckSearchResult(props) {
  return (
    <div className='deck-search-result'>
      <div>
        <h2>{props.name}</h2>
        <p>Created by: {props.creator}</p>
        <p>{props.amount} cards</p>
      </div>
      <div>
        {props.previewCards.map((card) => (
          <SearchResultCard front={card.front} back={card.back} />
        ))}
      </div>
    </div>
  )
}

DeckSearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  previewCards: PropTypes.array.isRequired
}

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchQuery: '',
      results: [],
      statusText: ''
    }

    this.handleSearch = this.handleSearch.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
  }

  handleSearch() {
    searchDecks(this.state.searchQuery.trim()).then((res) => {
        this.setState(() => ({
          results: res.results
        }))
      }).catch((err) => {
        this.setState(() => ({
          statusText: 'There was an error. Check the console and restart the app.'
        }))
      })
  }

  handleChangeSearch(e) {
    const value = e.target.value;

    this.setState(() => ({
      searchQuery: value
    }))
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSearch}>
          <input type='text' onChange={this.handleChangeSearch} value={this.searchQuery} />
          <button type='submit'>Search</button>
        </form>
        {this.state.statusText}
        {this.state.results.map((result) => {
          return (
            <div>
              <DeckSearchResult 
                name={result.name} 
                creator={result.creator} 
                amount={result.amount} 
                previewCards={result.cards} />

            </div>
          )
        })}

      </div>
      
    )
  }
}

export default Search;