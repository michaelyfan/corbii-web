import React from 'react';
import { Route, Link } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { searchUsers, getProfilePic } from '../utils/api';
import routes from '../routes/routes';

class SearchResult extends React.Component {
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
        <Link to={`${routes.viewUserRoute}/${id}`}>
          <button>
            View
          </button>
        </Link>
      </div>
    )  
  }
  
}

SearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
}

class SearchUser extends React.Component {
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
      if (location.pathname === `${routes.searchUsersRoute}`) {
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
      const results = await searchUsers(query);
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
                  name={result.name} />
              )
            })
        }
      </div>
    )
  }

}

export default SearchUser;