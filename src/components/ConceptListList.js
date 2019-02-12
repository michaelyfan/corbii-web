import React from 'react';
import { getCurrentUserConceptLists } from '../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from '../routes/routes';


function ConceptListRow(props) {
  const { name, id } = props;

  return (
    <div className='deck-row'>
      <Link to={routes.viewConceptList.getRoute(id)}>
        <button className = 'stuff-title'>{name}</button>
      </Link>
    </div>
  );

}

class ConceptListList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      conceptListArr: []
    };

    this.getConceptLists = this.getConceptLists.bind(this);
  }

  componentDidMount() {
    this.getConceptLists();
  }

  getConceptLists() {
    return getCurrentUserConceptLists().then((lists) => {
      this.setState(() => ({
        conceptListArr: lists
      }));
    }).catch((err) => {
      console.error(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    });
  }

  render() {

    return (
      <div>
        <div>
          <h3 className = 'your-stuff'>your concept lists</h3>
          {this.state.conceptListArr.map((list) => (
            <ConceptListRow
              name={list.name} 
              id={list.id} 
              key={list.id} 
              getConceptLists={this.getConceptLists} />
          ))}
        </div>  
      </div>
    );
  }
}

export default ConceptListList;

ConceptListRow.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};