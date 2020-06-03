import React from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import { Carousel } from 'react-responsive-carousel';
import PropTypes from 'prop-types';
import routes from '../routes/routes';

// image assets
import spacedRepImg from '../resources/slideshow-img/spaced-rep.jpg';
import selfExpImg from '../resources/slideshow-img/self-exp.jpg';

class Slideshow extends React.Component {
  render() {
    return (
      <Carousel
        showThumbs = {false}
        showIndicators = {false}
        className = 'slideshow-carousel'
        autoPlay = {true}
        infiniteLoop = {true}
        interval = {7000}
      >
        <div><img src = {spacedRepImg} /></div>
        <div><img src = {selfExpImg} /></div>
      </Carousel>
    );
  }
}

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
          <br />
          {signedIn && 
            <h3>
              You&apos;re already signed in. Click <Link to={redirectLink}>here</Link> to view your dashboard.
            </h3>}
          <div style={{visibility: signedIn ? 'hidden' : 'visible'}}>
            <LoginModal 
              header = 'sign up'
              signedIn = {signedIn}>
              <button className = "primary-button" type = "button">i am a student</button>
            </LoginModal>
            <h3 id = 'log-in-subheader'> 
              Already have an account?&nbsp; 
              <LoginModal 
                header = "log in" 
                signedIn = {signedIn}
              >
                <button className = 'log-in'>Log in.</button>
              </LoginModal>
            
            </h3>
          </div>
          
          <br /><br />
        </div>

        <div className = "home-info">
          <h1 className = "header-title">who are 
            <span className = "emphasized-words"> we?</span>
          </h1>
          <p className = "answer-text" id = 'answer-text-right'>Corbii is an education technology startup founded by five students from the Georgia Institute of Technology in 2018. We aim to create a user-friendly, intelligent platform to make learning better and more efficient for everyone. </p>
        </div>

        <div className = 'home-info' id = 'info2'>
          <p className = "answer-text" id = 'answer-text-left'>Corbii is an online learning platform that uses cognitive science research to make your learning more efficient and improve your long term memory. With our site, you&apos;ll be able to truly learn the material you want to know, not just memorize it.</p>
          <h1 className = "header-title">what do we 
            <span className = "emphasized-words"> do?</span>
          </h1>
        </div>

        <div className = 'cogsci-techniques'>
          <h2 className = 'header-title' id = 'our-techniques'>our techniques</h2>
          <Slideshow />
        </div>
        
        <div className = 'learn-button'>
          {/*the function below, located inside the onClick handler, is very bad practice in React since it uses window, directly manipulating the DOM. I can't think of another way to do it though so I'm going to leave this documentation here.*/}
          <button onClick={() => {window.scrollTo(0,0);}} className = "primary-button" id = 'start-learning' type = "button">start learning!</button>
        </div>
        
      </div>
    );
  }
}

Homepage.propTypes = {
  signedIn: PropTypes.bool.isRequired,
};

export default Homepage;