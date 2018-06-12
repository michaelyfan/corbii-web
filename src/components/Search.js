import React from 'react';
import { searchDecks } from '../utils/api';
import { Route, Link } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import SearchDeck from './SearchDeck';
import SearchUser from './SearchUser';

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchQuery: '',
      searchMode: 'decks'
    }

    this.enterActivator = this.enterActivator.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
  }

  enterActivator(e) {
    e.preventDefault();
  }

  handleChangeSearch(e) {
    const value = e.target.value;

    this.setState(() => ({
      searchQuery: value
    }))
  }

  render() {

    const { match } = this.props;

    return (
      <div>
        <form onSubmit={this.enterActivator}>
          <input type='text' onChange={this.handleChangeSearch} value={this.state.searchQuery} />
          <Link
            to={{
              pathname: `${match.url}/${this.state.searchMode}`,
              search: `?q=${this.state.searchQuery}`
            }}>
            <button type='submit'>Search</button>
          </Link>
        </form>
        <Route path={`${match.url}/decks`} component={SearchDeck} />
        <Route path={`${match.url}/users`} component={SearchUser} />
      </div>
      
    )
  }
}

export default Search;