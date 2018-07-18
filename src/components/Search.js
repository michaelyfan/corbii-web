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

  componentDidMount() {
    const { q } = queryString.parse(this.props.location.search);
    console.log(q);
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
            <button type='submit' style={{display: 'none'}}> show lists </button>
          </form>
            <div>
              <input 
                  id = "big-search"
                  maxLength='1000'
                  type = "text" 
                  placeholder = "search. . ."
                  onChange={this.handleChangeSearch} value={this.state.searchQuery} />
              <Link
                to={{
                  pathname: `${routes.searchDecksRoute}`,
                  search: `?q=${this.state.searchQuery}`
                }}>
                <button className = 'filter-button' id = 'show-decks'> show decks </button>
              </Link>
              <Link
                to={{
                  pathname: `${routes.searchUsersRoute}`,
                  search: `?q=${this.state.searchQuery}`
                }}>
                <button className = 'filter-button' id = 'show-users'> show users </button>
              </Link>
              <Link
                to={{
                  pathname: `${routes.searchListsRoute}`,
                  search: `?q=${this.state.searchQuery}`
                }}>
                <button className = 'filter-button' id = 'show-decks'> show lists </button>
              </Link>
            </div>
        </div>

        <Route path={`${routes.searchDecksRoute}`} component={SearchDeck} />
        <Route path={`${routes.searchUsersRoute}`} component={SearchUser} />
        <Route path={`${routes.searchListsRoute}`} component={SearchList} />
      </div>
      
    )
  }
}

export default Search;