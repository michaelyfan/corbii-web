import React from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import { Carousel } from 'react-responsive-carousel';
import PropTypes from 'prop-types';
import routes from '../routes/routes';

class Homepage extends React.Component {

  render() {
    const { signedIn } = this.props;
    const redirectLink = routes.dashboard.base;

    return (
      <div>
        <div className = "account-block">
          <h1 className = "header-title" id = "slogan">learning as smart as &nbsp;
            <span className = "emphasized-words" id = "you">you</span> 
          </h1>
          {signedIn
            ?  <Link to={redirectLink}>
              <button className="primary-button" type="button">get started</button>
            </Link>
            : <div>
              <LoginModal
                header='log in or register'
                signedIn={signedIn}>
                <button className="primary-button" type="button">get started</button>
              </LoginModal>
            </div>}
          <br /><br />
        </div>

        <div className = "home-info">
          <h1 className = "header-title">what is
            <span className = "emphasized-words"> Corbii?</span>
          </h1>
          <p className = "answer-text" id = 'answer-text-right'>Corbii is a study application that schedules your flashcards for you. The flashcards are scheduled based on the SM algorithms, an implementation of spaced repetition (spaced rep).</p>
        </div>

        <div className = 'home-info' id = 'info2'>
          <p className = "answer-text" id = 'answer-text-left'>Spaced repetition spaces out studying depending on your comfort level. The best time to review content is right before you forget it; this is both more efficient, as one has to study less often, and more effective, since the mind is doing more work.</p>
          <h1 className = "header-title">what is 
            <span className = "emphasized-words"> spaced rep?</span>
          </h1>
        </div>

        <div className = 'home-info'> 
          <div className = 'learn-button'>
            {/*the function below, located inside the onClick handler, is very bad practice in React since it uses window, directly manipulating the DOM. I can't think of another way to do it though so I'm going to leave this documentation here.*/}
            <button onClick={() => {window.scrollTo(0,0);}} className = "primary-button" id = 'start-learning' type = "button">start learning!</button>
          </div>  
        </div>
      </div>
    );
  }
}

Homepage.propTypes = {
  signedIn: PropTypes.bool.isRequired,
};

export default Homepage;