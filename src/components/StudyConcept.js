import React from 'react';
import PropTypes from 'prop-types';

class StudyBox extends React.Component {

}

class StudyConcept extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount() {

  };

  render() {
    return (
      <div>
        <button onClick={alert('Coming soon!')}>Study</button>
      </div>
    )
  }
}

StudyConcept.propTypes = {
  
}

export default StudyConcept;