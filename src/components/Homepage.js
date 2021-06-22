import React from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import PropTypes from 'prop-types';
import routes from '../routes/routes';

class Homepage extends React.Component {

  render() {
    const { signedIn } = this.props;
    const redirectLink = routes.dashboard.base;

    return (
      <div id='homepage-wrapper'>
        <div className = "account-block">
          <h1 className id = "slogan">learning as smart as&nbsp;
            <span className = "emphasized-words">you</span> 
          </h1>
          <div>
            {signedIn
              ? <Link to={redirectLink}>
                <button className="primary-button" type="button">get started</button>
              </Link>
              : <LoginModal
                header='log in or register'
                signedIn={signedIn}>
                <button className="primary-button" type="button">get started</button>
              </LoginModal>}
          </div>
        </div>

        <div id = 'home-info-wrapper'>
          <div className="home-info">
            <h1 className="header-title">what is
              <span className="emphasized-words"> Corbii?</span>
            </h1>
            <div className="answer-text-wrapper">
              <p className="answer-text">Corbii is a study application that schedules your flashcards for you. The flashcards are scheduled based on the SM algorithms, which implement spaced repetition (spaced rep).</p>
            </div>
          </div>

          <div className='home-info'>
            <h1 className="header-title">what is
              <span className="emphasized-words"> spaced rep?</span>
            </h1>
            <div className="answer-text-wrapper">
              <p className="answer-text">Spaced repetition means you don&apos;t study something until just before you forget it. This saves you time, and is more effective because it makes your brain work harder. Corbii is able to determine this scheduling automatically for you!</p>
            </div>
          </div>

          <div className='learn-button-wrapper'>
            {/*the function below, located inside the onClick handler, is very bad practice in React since it uses window, directly manipulating the DOM. I can't think of another way to do it though so I'm going to leave this documentation here.*/}
            <button onClick={() => { window.scrollTo(0, 0); }} className="primary-button" id='start-learning' type="button">start learning!</button>
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