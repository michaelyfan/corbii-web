import React from 'react';
import { getCurrentUserConceptLists } from '../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import { Loading } from './reusables/Loading';
import routes from '../routes/routes';


function ConceptListRow(props) {
  const { name, id } = props;

  return (
    <div className='deck-row'>
      <Link to={`${routes.viewConceptList}/${id}`}>
        <button className = 'stuff-title'>{name}</button>
      </Link>
    </div>
  )

}

ConceptListRow.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
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
      }))
    }).catch((err) => {
      console.error(err);
    })
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
      
    )
  }
}

export default ConceptListList;