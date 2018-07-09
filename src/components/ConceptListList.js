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
  }

  handleChangeNewConceptListName(e) {
    const value = e.target.value;
    this.setState(() => ({
      newConceptListName: value
    }));
  }

  handleUpdateConceptList() {
    updateCurrentUserList(this.props.id, this.state.newConceptListName).then(() => {
      this.setState(() => ({
        statusText: 'Concept list successfully updated!'
      }))
      this.props.getConceptLists();
    }).catch((err) => {
      console.log(err);
      this.setState(() => ({
        statusText: 'There was an error. Check the console and restart the app.'
      }))
    })
    this.setState(() => ({isUpdate: false}));
  }

  handleDeleteConceptList(listId) {
    deleteListFromCurrentUser(listId).then(() => {
      this.setState(() => ({statusText: 'Concept list successfully deleted.'}))
      this.props.getConceptLists();
    }).catch((err) => {
      console.log(err);
      this.setState(() => ({
        statusText: 'There was an error. See the console and refresh the page.'
      }))
    })
  }

  render() {
    const { name, id, match } = this.props;

    return (
      <div className='deck-row'>
        {
          this.state.isUpdate
            ? <div>
                <form onSubmit={this.handleUpdateConceptList}>
                  <input 
                    className = 'stuff-title change-title'
                    type='text'
                    value={this.state.newConceptListName}
                    onChange={this.handleChangeNewConceptListName} />
                  <br /> 
                  <button type='submit' className = 'modify-stuff'>update</button>
                  <span className = 'modify-stuff'>&nbsp; | </span>
                  <button className = 'modify-stuff' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>cancel</button>
                </form>
              </div>
            : <div>
                <Link 
                  to={`${routes.viewConceptListRoute}/${id}`}>
                  <button className = 'stuff-title'>{name}</button>
                </Link>
                <div className = 'stuff-menu'>
                  <button className = 'modify-stuff' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>change name</button>
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
          <div className = 'hr'><hr /></div>
          <h3 className = 'your-stuff'>your concept lists</h3>
          <div className = 'hr'><hr /></div>
          {this.state.conceptListArr.map((list) => (
            <ConceptListRow 
              name={list.name} 
              id={list.id} 
              key={list.id} 
              match={this.props.match}
              getConceptLists={this.getConceptLists} />
          ))}
        </div>  
      </div>
      
    )
  }
}

export default ConceptListList;