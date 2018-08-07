import React from 'react';
import { getCurrentUserConceptLists, deleteListFromCurrentUser, updateCurrentUserList } from '../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import { Loading } from './Loading';
import routes from '../routes/routes';


class ConceptListRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isUpdate: false,
      newConceptListName: props.name.slice(0)
    };

    this.handleUpdateConceptList = this.handleUpdateConceptList.bind(this);
    this.handleChangeNewConceptListName = this.handleChangeNewConceptListName.bind(this);
    this.handleDeleteConceptList = this.handleDeleteConceptList.bind(this);
    this.handleToggleUpdate = this.handleToggleUpdate.bind(this);
  }

  handleChangeNewConceptListName(e) {
    const value = e.target.value;
    this.setState(() => ({
      newConceptListName: value
    }));
  }

  handleUpdateConceptList() {
    this.setState(() => ({
      isLoading: true
    }), () => {
      updateCurrentUserList(this.props.id, this.state.newConceptListName).then(() => {
        this.props.getConceptLists().then(() => {
          this.setState(() => ({
            isUpdate: false,
            isLoading: false
          }));      
        });
      }).catch((err) => {
        console.log(err);
      })
    })
    
  }

  handleDeleteConceptList(listId) {
    this.setState(() => ({
      isLoading: true
    }), () => {
      deleteListFromCurrentUser(listId).then(() => {
        this.props.getConceptLists();
      }).catch((err) => {
        console.log(err);
      })  
    })
  }

  handleToggleUpdate() {
    this.setState((prevState) => ({
      isUpdate: !prevState.isUpdate
    }))
  }

  render() {
    const { name, id } = this.props;

    return (
      <div className='deck-row'>
        {
          this.state.isLoading
            ? <Loading />
          : <Link to={`${routes.viewConceptList}/${id}`}>
              <button className = 'stuff-title'>{name}</button>
            </Link>
        }
      </div>
    )
  }
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