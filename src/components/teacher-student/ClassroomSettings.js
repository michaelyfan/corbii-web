import React from 'react';

function ChangeNameForm() {
  return (
    <div>
      Change Name Form
    </div>
  );
}

class PeriodList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        Period list
      </div>
    );
  }
}

class StudentList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        Student list
      </div>
    );
  }
}

class ClassroomSettings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      
    };
  }

  componentDidMount() {

  }

  render() {

    return (
      <div>
        <h1>CLASSROOM SETTINGS</h1>
        <ChangeNameForm />
        <PeriodList />
        <StudentList />
      </div>
    );
  }
}

export default ClassroomSettings;