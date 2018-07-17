import React from 'react';
import { searchDecks } from '../utils/api';
import { Route, Link } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import SearchDeck from './SearchDeck';
import SearchUser from './SearchUser';
import SearchList from './SearchList';
import routes from '../routes/routes';

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchQuery: ''
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
        <div className = 'main-searchbar'>
          <form onSubmit={this.enterActivator}>
            <div>
              <input 
                  id = "big-search"
                  maxLength='1000'
                  type = "text" 
                  placeholder = "search. . ."
                  onChange={this.handleChangeSearch} value={this.state.searchQuery} />
              <Link
                to={{
                  pathname: `${match.url}/decks`,
                  search: `?q=${this.state.searchQuery}`
                }}>
                <button type='submit' className = 'filter-button' id = 'show-decks'> show decks </button>
              </Link>
              <Link
                to={{
                  pathname: `${match.url}/users`,
                  search: `?q=${this.state.searchQuery}`
                }}>
                <button className = 'filter-button' id = 'show-users'> show users </button>
              </Link>
              <Link
                to={{
                  pathname: `${match.url}/lists`,
                  search: `?q=${this.state.searchQuery}`
                }}>
                <button className = 'filter-button' id = 'show-decks'> show lists </button>
              </Link>
            </div>
          </form>

          
          
        </div>
        <Route path={`${match.url}/decks`} component={SearchDeck} />
        <Route path={`${match.url}/users`} component={SearchUser} />
        <Route path={`${match.url}/lists`} component={SearchList} />
      </div>
      
    )
  }
}

export default Search;