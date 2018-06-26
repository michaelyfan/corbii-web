import React from 'react';
import { getConceptList, createConcept, deleteConcept, updateConcept } from '../utils/api';
import firebase from '../utils/firebase';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

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
      <div className='card-wrapper'>
        <div className='card'>
          <div className='card-front'>
            <p className='low'>Question</p>
            {
              this.state.isUpdate && this.props.userIsOwner
                ? <input type='text' value={this.state.questionChangeValue} onChange={this.handleQuestionChange} />
                : <p>{question}</p>
            }
          </div>
          <div>
            <p className='low'>Answer</p>
            {
              this.state.isUpdate && this.props.userIsOwner
                ? <input type='text' value={this.state.answerChangeValue} onChange={this.handleAnswerChange} />
                : <p>{answer}</p>
            }
          </div>
        </div>

        { 
          this.props.userIsOwner
            ? this.state.isUpdate
                ? <span>
                    <button onClick={this.handleUpdateConcept}>Update</button>
                    <button onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>Cancel</button>
                  </span>            
                : <button onClick={() => {this.setState((prevState) => ({isUpdate: !prevState.isUpdate}))}}>Edit</button>
            : null
        }
        { this.props.userIsOwner && <button onClick={() => {handleDeleteConcept(id)}}>Delete</button>}
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
      addConceptAnswerName: '',
      statusText: ''
    }

    this.handleAddConcept = this.handleAddConcept.bind(this);
    this.handleDeleteConcept = this.handleDeleteConcept.bind(this);
    this.handleChangeAddConceptQuestion = this.handleChangeAddConceptQuestion.bind(this);
    this.handleChangeAddConceptAnswer = this.handleChangeAddConceptAnswer.bind(this);
    this.doUpdateConcept = this.doUpdateConcept.bind(this);
  }

  componentDidMount() {
    this.updateConceptList();
  }

  async updateConceptList() {
    const { d } = queryString.parse(this.props.location.search);
    const list = await getConceptList(d);
    const currentUser = firebase.auth().currentUser;
    this.setState(() => ({
      listName: list.listName,
      id: d,
      userIsOwner: currentUser != null && list.creatorId === firebase.auth().currentUser.uid,
      concepts: list.concepts
    }));
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
    const answer = this.state.addConceptAnswerName.trim();

    if (question && answer) {
      createConcept(question, answer, this.state.id)
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

  handleChangeAddConceptAnswer(e) {
    e.persist();
    this.setState(() => ({
      addConceptAnswerName: e.target.value
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
    return (
      <div>
        <h1>{this.state.listName}</h1>
        {this.state.statusText}
        <br />
        <Link to='/dashboard'>
          <button>Your concept lists</button>
        </Link>
        {
          this.state.userIsOwner
            ? <form onSubmit={this.handleAddConcept}>
                <span>Add a concept:</span>
                <input
                  placeholder='Question...'
                  type='text'
                  autoComplete='off'
                  value={this.state.addConceptQuestionName}
                  onChange={this.handleChangeAddConceptQuestion} />
                <input
                  placeholder='Answer...'
                  type='text'
                  autoComplete='off'
                  value={this.state.addConceptAnswerName}
                  onChange={this.handleChangeAddConceptAnswer} />
                <button type='submit'>Add</button>
              </form>
            : null
        }
        <div>
          <Link to='/study/conceptlist'>
            <button>
              Study
            </button>
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