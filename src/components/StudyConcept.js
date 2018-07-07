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
    });
  }

  render() {
    const { content, data } = this.props;
    return (
      <div>
        <form onSubmit={this.handleSubmitAnswer}>
          <p>Question: {content && content.question}</p>
          <textarea onChange={this.handleChangeText} rows='10' cols='70'></textarea><br />
          <input type='submit' text='Save' />
        </form>
        <p>Past answer:</p>
        <p style={{maxWidth: '400px', fontSize: '16px', color: 'rgb()'}}>{data ? data.answer : 'none'}</p>
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
        <h1>{ listName }</h1>
        <SingleConcept
          listId={listId}
          content={conceptContent}
          data={conceptData}
          getList={this.getList} />
        { index > 0 && <button onClick={() => {this.changeIndex(true)}}>Previous</button> }
        { index < concepts.length - 1 && <button onClick={() => {this.changeIndex(false)}}>Next</button> }
      </div>
    )
  }
}

export default StudyConcept;