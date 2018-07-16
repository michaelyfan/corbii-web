import React from 'react';
import PropTypes from 'prop-types';
import { getConceptListForStudy, updateConceptPersonalData } from '../utils/api';


class SingleConcept extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    }

    this.handleChangeText = this.handleChangeText.bind(this);
    this.handleSubmitAnswer = this.handleSubmitAnswer.bind(this);
  }

  handleChangeText(e) {
    e.persist();
    this.setState(() => ({
      text: e.target.value
    }))
  }

  handleSubmitAnswer(e) {
    e.preventDefault();

    const { content, listId } = this.props;
    updateConceptPersonalData(listId, content.id, this.state.text).then(() => {
      this.props.getList();
    }).catch((err) => {
      console.error(err);
    });
  }

  render() {
    const { content, data } = this.props;
    return (
      <div>
        <form onSubmit={this.handleSubmitAnswer}>
          <p className = 'question-answer'>explain or answer: 
            <span className = 'content-info'> {content && content.question}</span>
          </p>
          <div className = 'center-button'>
            <textarea 
              className = 'self-exp-box'
              onChange={this.handleChangeText} 
              rows='10' 
              cols='70'>
            </textarea>
          </div>
          <br />
          <div className = 'center-button'>
            <button className = 'primary-button' type='submit'>save</button>
          </div>
        </form>
        <p className = 'question-answer'>previous answer:
          <span className = 'content-info'>{data ? data.answer : 'none'}</span>
        </p>
      </div>
    )
  }
}

SingleConcept.propTypes = {

}

class StudyConcept extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      listName: '',
      concepts: [],
      listId: '',
      conceptsAnswers: {},
      index: 0
    }

    this.getList = this.getList.bind(this);
    this.changeIndex = this.changeIndex.bind(this);
  }

  componentDidMount() {
    this.getList();
  } 
  
  getList() {
    const { id } = this.props.match.params;
    getConceptListForStudy(id).then((result) => {
      const { name, concepts, conceptsAnswers } = result;
      this.setState(() => ({
        listName: name,
        concepts: concepts,
        conceptsAnswers: conceptsAnswers,
        listId: id
      }))
    }).catch((err) => {
      console.error(err);
    })
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
    const { index, concepts, conceptsAnswers, listId, listName } = this.state;
    const conceptContent = concepts[index];
    const conceptData = conceptContent ? conceptsAnswers[conceptContent.id] : {};

    return (
      <div>
        <p className = 'deck-title'>{ listName }</p>
        <div className = 'disp-inline center-button'>
          { index > 0 && 
            <img src = '/src/resources/prev-arrow.png'
              className = 'arrows' 
              onClick={() => {this.changeIndex(true)}} /> }
          <SingleConcept
            listId={listId}
            content={conceptContent}
            data={conceptData}
            getList={this.getList} />
          { index < concepts.length - 1 && 
            <img src = '/src/resources/next-arrow.png' 
              className = 'arrows'
              onClick={() => {this.changeIndex(false)}} /> }
        </div>
      </div>
    )
  }
}

export default StudyConcept;