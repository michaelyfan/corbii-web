import React from 'react';
import { Route, Link } from 'react-router-dom';
import SearchResults from './SearchResults';
import routes from '../routes/routes';
import queryString from 'query-string';

class Search extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      searchQuery: '',
      mode: 'decks'
    }

    this.enterActivator = this.enterActivator.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
  }

  enterActivator(e) {
    e.preventDefault();
  }

  componentDidMount() {
    const { q, mode } = queryString.parse(this.props.location.search);
    this.setState(() => ({
      searchQuery: q || '',
      mode: mode || 'decks'
    }))
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.mode != prevState.mode) {
      this.props.history.push({
        pathname: `${routes.searchRoute}${routes.searchRouteResultsSub}`,
        search: `?mode=${this.state.mode}&q=${this.state.searchQuery}`
      })
    }
  }

  handleChangeSearch(e) {
    const value = e.target.value;

    this.setState(() => ({
      searchQuery: value
    }))
  }

  changeMode(mode) {
    this.setState(() => ({
      mode: mode
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
                  pathname: `${routes.searchRoute}${routes.searchRouteResultsSub}`,
                  search: `?mode=${this.state.mode}&q=${this.state.searchQuery}`
                }}>
                <button type='submit' className='no-display'></button>
              </Link>

              <button className = 'filter-button' onClick={() => {this.changeMode('decks')}} id = 'show-decks'> show decks </button>
              <button className = 'filter-button' onClick={() => {this.changeMode('users')}} id = 'show-users'> show users </button>
              <button className = 'filter-button' onClick={() => {this.changeMode('lists')}} id = 'show-decks'> show lists </button>
            </div>
          </form>
        </div>

        <Route path={`${routes.searchRoute}${routes.searchRouteResultsSub}`} component={SearchResults} />
      </div>
      
    )
  }
}

export default Search;