import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import firebase from '../utils/firebase';
import { getConceptList, createConcept, deleteConcept, updateConcept, getUserProfileInfo, deleteListFromCurrentUser, updateCurrentUserList } from '../utils/api';
import routes from '../routes/routes';
import { BigLoading } from './reusables/Loading';
import BackToDashboardButton from './reusables/BackToDashboardButton';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

class Concept extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      questionChangeValue: props.question.slice(0)
    }

    this.handleUpdateConcept = this.handleUpdateConcept.bind(this);
    this.handleQuestionChange = this.handleQuestionChange.bind(this);
  }

  handleUpdateConcept() {
    const { doUpdateConcept, id } = this.props;
    const { questionChangeValue } = this.state;
    doUpdateConcept(id, questionChangeValue);
    this.setState(() => ({isUpdate: false}))
  }

  handleQuestionChange(e) {
    const value = e.target.value;
    this.setState(() => ({questionChangeValue: value}));
  }

  render() {
    const { id, question, handleDeleteConcept } = this.props;

    return (
      <div className='flashcard'>
        <div className='flashcard' id ='less-padding'>
          <div className='flashcard-text edit-card'>
            <p className='low'>question</p>
            {
              this.state.isUpdate && this.props.userIsOwner
                ? <textarea
                    type='text' 
                    value={this.state.questionChangeValue} 
                    onChange={this.handleQuestionChange} 
                    className = 'update-card'/>
                : <p className = 'editable-card'>{question}</p>
            }
          </div>
        </div>

        <div className='side-menu'>
          { 
            this.props.userIsOwner
              ? this.state.isUpdate
                  ? <span className = 'edit-options'>
                      <button className = 'modify-stuff editing' onClick={this.handleUpdateConcept}>update</button>
                      <button className = 'modify-stuff editing' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>cancel</button>
                    </span>            
                  : <span className = 'edit-button'>
                      <button className = 'modify-stuff' onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>edit</button>
                    </span>
              : null
          }
          <span className = 'modify-stuff' id = 'line'>&nbsp;|&nbsp;</span>
          { this.props.userIsOwner && <button className = 'modify-stuff delete-button' onClick={() => {handleDeleteConcept(id)}}>delete</button>}
      </div>
     </div>
      
    )
  }
}

Concept.propTypes = {
  userIsOwner: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  question: PropTypes.string.isRequired,
  doUpdateConcept: PropTypes.func.isRequired
}

class Title extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      originalListName: props.listName.slice(0),
      newListName: props.listName.slice(0)
    }

    this.handleToggleUpdate = this.handleToggleUpdate.bind(this);
    this.handleUpdateList = this.handleUpdateList.bind(this);
    this.handleChangeNewDeckName = this.handleChangeNewDeckName.bind(this);
  }

  handleChangeNewDeckName(e) {
    const value = e.target.value;
    this.setState(() => ({
      newListName: value
    }));
  }

  handleToggleUpdate() {
    this.setState((prevState) => ({
      isUpdate: !prevState.isUpdate
    })) 
  }

  handleUpdateList() {
    updateCurrentUserList(this.props.listId, this.state.newListName).then(() => {
      this.setState((prevState) =>({
        originalListName: prevState.newListName,
        isUpdate: false
      }))
    }).catch((err) => {
      console.log(err);
      alert(err);
    })
  }

  render() {
    const { isUpdate, originalListName, newListName } = this.state;
    const { listName, creatorName, userIsOwner } = this.props;
    return (
      <div>
        {isUpdate
          ? <input type='text'
              maxLength='150'
              className = 'deck-title'
              value = {newListName}
              onChange = {this.handleChangeNewDeckName}
              placeholder = 'title your deck here' 
            />
          : <p className = 'deck-title edit-title'>{originalListName}</p>}
        <div className = 'inline-display center-subtitle'>

          <p className = 'small-caption'>created by {creatorName} {userIsOwner && <span>|</span>}</p>
          {userIsOwner && (
            isUpdate
              ? <span>
                  <button onClick={this.handleUpdateList} className = 'small-caption change-title'>&nbsp;update</button>
                  <button onClick={this.handleToggleUpdate} className = 'small-caption change-title'>&nbsp;cancel</button>
                </span>
              : <button onClick={this.handleToggleUpdate} className = 'small-caption change-title'>&nbsp;change list title</button>
          )}
        </div>
      </div>
    )
  }
}

Title.propTypes = {
  listName: PropTypes.string.isRequired,
  creatorName: PropTypes.string.isRequired,
  listId: PropTypes.string.isRequired,
  userIsOwner: PropTypes.bool.isRequired
}

class AddConceptForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      question: ''
    }

    this.handleAddConcept = this.handleAddConcept.bind(this);
    this.handleChangeQuestion = this.handleChangeQuestion.bind(this);
  }

  handleAddConcept(e) {
    e.preventDefault();
    const question = this.state.question.trim();
    const { callback, conceptId } = this.props;



    if (question) {
      createConcept(question, '', conceptId).then(() => {
        callback();
      }).catch((err) => {
        console.error(err);
      })
    } else {
      alert("'One of your inputs is empty. Check your inputs and try again.'");
    }
  }

  handleChangeQuestion(e) {
    e.persist();

    this.setState(() => ({
      question: e.target.value
    }))
  }

  render() {
    const { question } = this.state;
    return (
      <div className = 'needs-padding'>
        <form onSubmit={this.handleAddConcept}>
          <div>
            <p id = 'add-a-concept'>add a concept:</p>
            <div className = 'flashcard add-card'>
              <input
                maxLength='200'
                placeholder='question or concept'
                type='text'
                className = 'flashcard-text'
                id = 'add-question'
                autoComplete='off'
                value={question}
                onChange={this.handleChangeQuestion} />
              <button type='submit' className = 'add'>add</button>
            </div>
          </div>
        </form>
      </div>
    )
  } 
}

AddConceptForm.propTypes = {
  callback: PropTypes.func,
  conceptId: PropTypes.string.isRequired
}

class ConceptList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      listName: '',
      concepts: [],
      id: '',
      userIsOwner: false,
      isLoading: true,
      creatorName: ''
    }

    this.handleDeleteConcept = this.handleDeleteConcept.bind(this);
    this.doUpdateConcept = this.doUpdateConcept.bind(this);
    this.submitDelete = this.submitDelete.bind(this);
    this.handleDeleteList = this.handleDeleteList.bind(this);
    this.updateConceptList = this.updateConceptList.bind(this);
  }

  componentDidMount() {
    this.updateConceptList();
  }

  async updateConceptList() {
    const { id } = this.props.match.params;
    let list;
    try {
      const list = await getConceptList(id);
      const { listName, creatorId, concepts } = list;
      const currentUser = firebase.auth().currentUser;
      let profileInfo = await getUserProfileInfo(creatorId);
      let creatorName = profileInfo.data().name;
      this.setState(() => ({
        listName: list.listName,
        id: id,
        userIsOwner: currentUser != null && list.creatorId === firebase.auth().currentUser.uid,
        concepts: list.concepts,
        isLoading: false,
        creatorName: creatorName,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async handleDeleteConcept(conceptId) {
    try {
      await deleteConcept(this.state.id, conceptId);
    } catch(err) {
      console.log(err);
    }
    
    this.updateConceptList();
  }

  doUpdateConcept(conceptId, question) {
    updateConcept(this.state.id, conceptId, question).then(() => {
      this.updateConceptList();
    }).catch((err) => {
      console.error(err);
    })
  }

  handleDeleteList() {
    deleteListFromCurrentUser(this.state.id).then(() => {
      this.props.history.push(routes.dashboard.base);
    }).catch((err) => {
      console.log(err);
      alert(err);
    })
  }

  submitDelete() {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className='custom-ui'>
            <h1 className = 'delete-deck-confirm'>are you sure you want to delete this concept list?</h1>
            <h1 className = 'delete-deck-confirm' id = 'small-confirm'>this action cannot be undone.</h1>
            <div className = 'inline-display center-subtitle'>
              <button className = 'no-button'onClick={onClose}>no</button>
              <button className = 'yes-button' onClick={() => {
                this.handleDeleteList();
                onClose()
              }}>yes</button>
            </div>
          </div>
        )
      }
    })
  }

  render() {
    const { listName, id, creatorName, userIsOwner, concepts } = this.state;
    return this.state.isLoading
      ? <BigLoading />
      : (

        <div>
          <div className = 'deck-info'>
            <BackToDashboardButton />
            <Title 
              userIsOwner={userIsOwner}
              creatorName={creatorName}
              listName={listName}
              listId={id} />
          </div>

          <div className='soft-blue-background'>

            <Link id = 'study-list' to={routes.study.getConceptListRoute(id)}>
              <button className = 'primary-button'>study this list</button>
            </Link>

            {userIsOwner && <AddConceptForm conceptId={id} callback={this.updateConceptList} />}

            {concepts.map((concept) => 
              <Concept 
                userIsOwner={userIsOwner}
                id={concept.id} 
                question={concept.question} 
                doUpdateConcept={this.doUpdateConcept}
                handleDeleteConcept={this.handleDeleteConcept} 
                key={concept.id} />
            )}

            <div className = 'inline-display center-subtitle'>
              <button className = 'red delete-deck' onClick = {this.submitDelete}>
                delete this concept list
              </button>
            </div>
          </div>
        </div>
      )
    
  }
}

export default ConceptList;