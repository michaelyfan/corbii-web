import React from 'react';
import PropTypes from 'prop-types';
import { getConceptListForStudy, getUserProfileInfo, updateConceptPersonalData } from '../utils/api';
import routes from '../routes/routes';
import Title from './reusables/Title';


class SingleConcept extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };

    this.handleSubmitAnswer = this.handleSubmitAnswer.bind(this);
  }

  handleSubmitAnswer(e) {
    e.preventDefault();
    const { thisConcept, listId, answer } = this.props;
    const dataId = thisConcept.data ? thisConcept.data.id : null;
    
    // check for no answer
    if (answer == null || answer.trim() === '') {
      alert('Answer cannot be empty.');
      return;
    }

    updateConceptPersonalData(dataId, listId, thisConcept.id, answer).then(() => {
      this.props.getList();
    }).catch((err) => {
      console.error(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    });
  }

  render() {
    const { thisConcept, handleChangeAnswer, answer } = this.props;
    const { data } = thisConcept;
    return (
      <div>
        <form onSubmit={this.handleSubmitAnswer}>
          <p className = 'question-answer'>explain or answer: 
            <span className = 'content-info'> {thisConcept && thisConcept.question}</span>
          </p>
          <div className = 'center-button'>
            <textarea 
              className = 'self-exp-box'
              onChange={handleChangeAnswer}
              value={answer || ''}
              rows='5' 
              cols='70'>
            </textarea>
          </div>
          <br />
          <div className = 'center-button'>
            <button className = 'primary-button' type='submit'>save</button>
          </div>
        </form>
        <p className = 'question-answer' id = 'saved-answer'>previous answer:
          <span className = 'content-info'>{data ? data.answer : 'none'}</span>
        </p>
      </div>
    );
  }
}

class StudyConcept extends React.Component {

  constructor(props) {
    super(props);

    /*
     * where concepts is an array of objects:
    {
      id: the ID of this concept (similar to a deck's card's ID)
      question: this concept's question
      data: (Optional) a data object for this concept, might be null, of structure:
        {
          answer: this concept's previous answer (unique to current user)
          conceptId: the ID of this concept
          id: the ID of this data point
          listId: the ID of this concept's list
          userId: the ID of the user
        }
    }
     *
     * where answers is an object corresponding to the user's answers:
    {
      [concept-id-here]: answer-here
    }
    
     */
    this.state = {
      listName: 'Loading...',
      creatorName: '',
      concepts: [],
      answers: {},
      listId: '',
      index: 0
    };

    this.getList = this.getList.bind(this);
    this.changeIndex = this.changeIndex.bind(this);
    this.handleChangeAnswer = this.handleChangeAnswer.bind(this);
  }

  componentDidMount() {
    this.getList();
  } 
  
  getList() {
    const { id } = this.props.match.params;
    getConceptListForStudy(id).then((result) => {
      return getUserProfileInfo(result.creatorId).then((result2) => {
        result.creatorName = result2.data().name;
        return result;
      });
    }).then((result) => {
      const { name, creatorName, concepts } = result;
      this.setState(() => ({
        listName: name,
        creatorName: creatorName,
        concepts: concepts,
        listId: id
      }));
    }).catch((err) => {
      console.error(err);
      alert(`There was an error - sorry!\nTry refreshing the page, or try later.\n${err}`);
    });
  }

  handleChangeAnswer(e) {
    e.persist();
    this.setState(() => {
      const { answers, concepts, index } = this.state;
      const currentConceptId = concepts[index].id;
      answers[currentConceptId] = e.target.value;
      return { answers };
    });
  }
  
  changeIndex(isDecrement) {
    if (isDecrement) {
      this.setState((prevState) => ({index: prevState.index - 1}));
    } else {
      this.setState((prevState) => {
        const newIndex = prevState.index + 1;
        return {
          index: newIndex,
        };
      });  
    }
  }

  render() {
    const { listName, creatorName, index, concepts, listId, answers } = this.state;
    const thisConcept = concepts[index];
    const thisUserAnswer = thisConcept ? answers[thisConcept.id] : null;

    return (
      <div>
        <Title 
          text={listName}
          titleLink={routes.viewConceptList.getRoute(listId)}
          subtitle={`created by ${creatorName}`} />
        <div className = 'disp-inline center-button'>
          { index > 0 && 
            <img src = '/src/resources/prev-arrow.png'
              className = 'arrows' 
              onClick={() => {this.changeIndex(true);}} /> }
          { thisConcept
            ? <SingleConcept
              listId={listId}
              thisConcept={thisConcept}
              getList={this.getList}
              answer={thisUserAnswer}
              handleChangeAnswer={this.handleChangeAnswer} />
            : <h2>This list doesn&apos;t have any concepts in it!</h2>}
          
          { index < concepts.length - 1 && 
            <img src = '/src/resources/next-arrow.png' 
              className = 'arrows'
              onClick={() => {this.changeIndex(false);}} /> }
        </div>
      </div>
    );
  }
}

export default StudyConcept;

StudyConcept.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  }),
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  })
};
SingleConcept.propTypes = {
  thisConcept: PropTypes.object,
  listId: PropTypes.string.isRequired,
  getList: PropTypes.func.isRequired,
  handleChangeAnswer: PropTypes.func.isRequired,
  answer: PropTypes.string
};