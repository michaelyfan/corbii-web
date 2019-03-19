/*
A component with styled elements related to filtering times. Calls the start time and end time
filtered by this component in a props callback, handleTimes(). If there is no time filter set,
handleTimes is called with null arguments.
 */

/* Required dependency modules */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

/* Required modules */
import { getNow, getHoursBeforeNow } from '../../utils/tools';

export default class FilterTime extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      startTime: '',
      endTime: ''
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleSubmitCustomTime = this.handleSubmitCustomTime.bind(this);
  }

  handleInput(e) {
    e.persist();
    this.setState(() => ({
      [e.target.name]: e.target.value
    }));
  }

  handleSubmitCustomTime(e) {
    e.preventDefault();
    const { startTime, endTime } = this.state;
    const { handleTimes } = this.props;

    // parse out Moment time objects from the entered times
    const startTimeObj = moment(startTime, 'MM-DD-YYYY');
    const endTimeObj = moment(endTime, 'MM-DD-YYYY');

    // check for valid dates
    if (!startTimeObj.isValid() || !endTimeObj.isValid()) {
      alert('One or both of your time entries is invalid.');
      return;
    }
    
    // go to the END of the endTime (ex. 11:59pm)
    endTimeObj.endOf('day');

    // check for valid year (only accepting 4-digit years for now)
    if ((startTimeObj.year() + '').length !== 4
      || (endTimeObj.year() + '').length !== 4) {
      alert('One of your time entries has an invalid year; make sure the year is four digits long.');
    } else if (startTimeObj.diff(endTimeObj) > 0) { // check for start time greater than end time
      alert('Your beginning time cannot be greater than your ending time.');
    } else { // valid dates were entered
      handleTimes(startTimeObj.unix(), endTimeObj.unix());
    }
  }

  render() {
    const { handleTimes } = this.props;
    const { startTime, endTime } = this.state;
    return (
      <div>
        <span className =  'filter-prompt'>show time:</span>
        <button className = 'view-filter-button' onClick={() => {handleTimes(null, null);}}>all</button>
        <button className = 'view-filter-button' onClick={() => {handleTimes(getHoursBeforeNow(24), getNow());}}>last day</button>
        <button className = 'view-filter-button' onClick={() => {handleTimes(getHoursBeforeNow(24 * 7), getNow());}}>last week</button>
        <button className = 'view-filter-button' onClick={() => {handleTimes(getHoursBeforeNow(24 * 7 * 30), getNow());}}>last 30 days</button>
        <form onSubmit={this.handleSubmitCustomTime}>
          <div className = 'flex'>
            <p className =  'filter-prompt'>custom time range...</p>
            <input className = 'time-entry' type='text' name='startTime' value={startTime} onChange={this.handleInput}
              placeholder="mm-dd-yyyy" />
            <p className =  'filter-prompt'>to</p>
            <input className = 'time-entry' type='text' name='endTime' value={endTime} onChange={this.handleInput}
              placeholder="mm-dd-yyyy" />
            <input className = 'primary-button submit-time' type='submit' value='submit' />
          </div>
        </form>
      </div>
    );
  }
}
FilterTime.propTypes = {
  handleTimes: PropTypes.func.isRequired
};