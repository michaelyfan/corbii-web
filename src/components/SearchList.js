import React from 'react';
import { Route, Link } from 'react-router-dom';
import queryString from 'query-string';
import PropTypes from 'prop-types';

import routes from '../routes/routes';
import { searchLists } from '../utils/api';

function SearchResult(props) {
  const { id, name, creator, count } = props;
  return (
    <div className='result-box'>
      <Link to={`${routes.viewConceptListRoute}/${id}`}>
        <p className = 'deck-text' id = 'deck-name'>{name}</p>
      </Link>
      <p className = 'deck-text' id = 'deck-owner'>{creator}</p>
      <p className = 'deck-text' id = 'num-of-terms'>{count} {count === 1 ? 'concept' : 'concepts'}</p>
      
    </div>
  )
}

SearchResult.propTypes = {
  name: PropTypes.string.isRequired,
  creator: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
}

class SearchList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      results: []
    };
  }

  componentDidMount() {
    const { q } = queryString.parse(this.props.location.search);
    this.updateResults(q);


    this.unlisten = this.props.history.listen((location, action) => {
      if (location.pathname === `${routes.searchConceptListsRoute}`) {
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
      const results = await searchLists(query);
      this.setState(() => ({
        results: results
      }));
    } catch(err) {
      console.error(err);

    }

  }

  render() {
    const { results } = this.state;
    return (
      <div>
        {results.length === 0
          ? <p>We didn't find anything  :(  try another search.</p>
          : results.map((result) => {
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

export default SearchList;