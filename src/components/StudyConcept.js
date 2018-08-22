import React from 'react';
import PropTypes from 'prop-types';
import { getConceptListForStudy, getUserProfileInfo, updateConceptPersonalData } from '../utils/api';
import { Link, NavLink, withRouter } from 'react-router-dom';
import routes from '../routes/routes';
import Title from './Title';


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

    const { content, listId, data } = this.props;
    const dataId = data ? data.id : null;
    
    updateConceptPersonalData(dataId, listId, content.id, this.state.text).then(() => {
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
    )
  }
}

SingleConcept.propTypes = {
  data: PropTypes.object,
  content: PropTypes.object,
  listId: PropTypes.string.isRequired,
  getList: PropTypes.func.isRequired
}

class StudyConcept extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      listName: '',
      creatorName: '',
      concepts: [],
      listId: '',
      conceptsData: {},
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
      return getUserProfileInfo(result.creatorId).then((result2) => {
        result.creatorName = result2.data().name;
        return result;
      });
    }).then((result) => {
      const { name, creatorName, concepts, conceptsData } = result;
      this.setState(() => ({
        listName: name,
        creatorName: creatorName,
        concepts: concepts,
        conceptsData: conceptsData,
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
    const { listName, creatorName, index, concepts, conceptsData, listId } = this.state;

    const conceptContent = concepts[index] || {};
    const conceptData = conceptsData ? conceptsData[conceptContent.id] : null;

    return (
      <div>

        <Title 
          text={listName}
          titleLink={`${routes.viewConceptList}/${listId}`}
          subtitle={`created by ${creatorName}`} />
          
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