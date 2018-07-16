import React from 'react';
import { getCurrentUserConceptLists, deleteListFromCurrentUser, updateCurrentUserList } from '../utils/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom'
import routes from '../routes/routes';


class ConceptListRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
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
    updateCurrentUserList(this.props.id, this.state.newConceptListName).then(() => {
      this.props.getConceptLists();
    }).catch((err) => {
      console.log(err);
    })
    this.setState(() => ({isUpdate: false}));
  }

  handleDeleteConceptList(listId) {
    deleteListFromCurrentUser(listId).then(() => {
      this.props.getConceptLists();
    }).catch((err) => {
      console.log(err);
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
          this.state.isUpdate
            ? <div>
                <form onSubmit={this.handleUpdateConceptList}>
                  <input 
                    maxLength = '150'
                    className = 'stuff-title change-title'
                    type='text'
                    value={this.state.newConceptListName}
                    onChange={this.handleChangeNewConceptListName} />
                  <br /> 
                  <button type='submit' className = 'modify-stuff'>update</button>
                  <span className = 'modify-stuff'>&nbsp; | </span>
                  <button className = 'modify-stuff' onClick={this.handleToggleUpdate}>cancel</button>
                </form>
              </div>
            : <div>
                <Link 
                  to={`${routes.viewConceptListRoute}/${id}`}>
                  <button className = 'stuff-title'>{name}</button>
                </Link>
                <div className = 'stuff-menu'>
                  <button className = 'modify-stuff buffer' onClick={this.handleToggleUpdate}>change name</button>
                  <span className = 'modify-stuff'>&nbsp; | </span>
                  <button className = 'modify-stuff' onClick={() => {this.handleDeleteConceptList(id)}}>&nbsp; delete</button>
                </div>
              </div>
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
      statusText: '',
      conceptListArr: []
    };

    this.getConceptLists = this.getConceptLists.bind(this);
  }

  componentDidMount() {
    this.getConceptLists();
  }

  getConceptLists() {
    getCurrentUserConceptLists().then((lists) => {
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
        {this.state.statusText}
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