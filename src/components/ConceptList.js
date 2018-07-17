import React from 'react';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import firebase from '../utils/firebase';
import { getConceptList, createConcept, deleteConcept, updateConcept } from '../utils/api';
import routes from '../routes/routes';
import { BigLoading } from './Loading';

class Concept extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isUpdate: false,
      questionChangeValue: props.question.slice(0),
      answerChangeValue: props.answer.slice(0)
    }

    this.handleUpdateConcept = this.handleUpdateConcept.bind(this);
    this.handleQuestionChange = this.handleQuestionChange.bind(this);
    this.handleAnswerChange = this.handleAnswerChange.bind(this);
  }

  handleUpdateConcept() {
    const { doUpdateConcept, id } = this.props;
    const { questionChangeValue, answerChangeValue } = this.state;
    doUpdateConcept(id, questionChangeValue, answerChangeValue);
    this.setState(() => ({isUpdate: false}))
  }

  handleQuestionChange(e) {
    const value = e.target.value;
    this.setState(() => ({questionChangeValue: value}));
  }

  handleAnswerChange(e) {
    const value = e.target.value;
    this.setState(() => ({answerChangeValue: value}));
  }

  render() {
    const { id, question, answer, handleDeleteConcept } = this.props;

    return (
      <div className='flashcard'>
        <div className='flashcard'>
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
          <div className = 'flashcard-text edit-card'>
            <p className='low'>provided answer</p>
            {
              this.state.isUpdate && this.props.userIsOwner
                ? <textarea
                    type='text'
                    value={this.state.answerChangeValue} 
                    onChange={this.handleAnswerChange} 
                    className = 'update-card'/>
                : <p className = 'editable-card'>{answer}</p>
            }
          </div>
        </div>

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
        <span className = 'modify-stuff' id = 'line'>&nbsp; | </span>
        { this.props.userIsOwner && <button className = 'modify-stuff delete-button' onClick={() => {handleDeleteConcept(id)}}>delete</button>}
      </div>
      
    )
  }
}

Concept.propTypes = {
  userIsOwner: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  doUpdateConcept: PropTypes.func.isRequired
}

class ConceptList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      listName: '',
      concepts: [],
      id: '',
      userIsOwner: false,
      addConceptQuestionName: '',
      statusText: '',
      isLoading: true
    }

    this.handleAddConcept = this.handleAddConcept.bind(this);
    this.handleDeleteConcept = this.handleDeleteConcept.bind(this);
    this.handleChangeAddConceptQuestion = this.handleChangeAddConceptQuestion.bind(this);
    this.doUpdateConcept = this.doUpdateConcept.bind(this);
  }

  componentDidMount() {
    this.updateConceptList();
  }

  async updateConceptList() {
    const { id } = this.props.match.params;
    let list;
    try {
      const list = await getConceptList(id);
      const currentUser = firebase.auth().currentUser;
      this.setState(() => ({
        listName: list.listName,
        id: id,
        userIsOwner: currentUser != null && list.creatorId === firebase.auth().currentUser.uid,
        concepts: list.concepts,
        isLoading: false
      }));
    } catch (err) {
      console.error(err);
    }
  }

  async handleDeleteConcept(conceptId) {
    try {
      await deleteConcept(this.state.id, conceptId);
      this.setState(() => ({
        statusText: 'Concept successfully deleted.'
      }))
    } catch(err) {
      console.log(err);
    }
    
    this.updateConceptList();
  }

  handleAddConcept(e) {
    e.preventDefault();
    const question = this.state.addConceptQuestionName.trim();

    if (question) {
      createConcept(question, '', this.state.id)
        .then(() => {
          this.updateConceptList();
          this.setState(() => ({
            statusText: 'Concept successfully added!'
          }))
        })
        .catch((err) => {
          this.setState(() => ({
            statusText: 'There was an error. Check the console and refresh the app.'
          }))
          console.error(err);
        })

    } else {
      this.setState(() => ({
        statusText: 'One of your inputs is empty. Check your inputs and try again.'
      }))
    }
  }

  handleChangeAddConceptQuestion(e) {
    e.persist();
    this.setState(() => ({
        addConceptQuestionName: e.target.value
    }));
  }

  doUpdateConcept(conceptId, question, answer) {
    updateConcept(this.state.id, conceptId, question, answer).then(() => {
      this.setState(() => ({
        statusText: 'Concept successfully updated!',
      }));
      this.updateConceptList();
    }).catch((err) => {
      console.log(err);
      this.setState(() => ({
        statusText: 'There was an error. Check the console and refresh the app.'
      }));
    })
  }

  render() {
    return this.state.isLoading
      ? <BigLoading />
      : (
          <div>
            <div>
              <Link to={routes.dashboardRoute}>
                <button className = 'back-to-deck'>back to dashboard</button>
              </Link>
              <p className = 'deck-title edit-title'>{this.state.listName}</p>
              <p className = 'small-caption'>concept list title</p>
              <div className = 'hr'><hr /></div>
            </div>


            {
              this.state.userIsOwner
                ? <form onSubmit={this.handleAddConcept}>
                    <div>
                      <p id = 'add-a-concept'>add a concept:</p>
                      <div className = 'flashcard add-card'>
                        <input
                          maxLength='200'
                          placeholder='question or concept'
                          className = 'flashcard-text'
                          id = 'add-question'
                          type='text'
                          autoComplete='off'
                          value={this.state.addConceptQuestionName}
                          onChange={this.handleChangeAddConceptQuestion} />
                        <button type='submit' className = 'add'>add</button>
                      </div>
                    </div>
                  </form>
                : null
            }
            <div>
              <Link id = 'study-list' to={`${routes.studyConceptListRoute}/${this.state.id}`}>
                <button className = 'primary-button'>study this list</button>
              </Link>
            </div>

            {this.state.concepts.map((concept) => 
              <Concept 
                userIsOwner={this.state.userIsOwner}
                id={concept.id} 
                question={concept.question} 
                answer={concept.answer} 
                doUpdateConcept={this.doUpdateConcept}
                handleDeleteConcept={this.handleDeleteConcept} 
                key={concept.id} />
            )}
          </div>
        )
    
  }
}

export default ConceptList;