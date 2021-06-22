// Used to polyfill some latest JS features
// See https://babeljs.io/docs/en/babel-polyfill
// See https://babeljs.io/docs/en/babel-preset-env#usebuiltins
import "core-js/stable";
import "regenerator-runtime/runtime";

import React from'react';
import ReactDOM from'react-dom';
import './css/index.css'; // import base styles first; defining a style again in below stylesheets will override the corresponding style in index.css
import './css/dashboard.css';
import './css/flashcard.css';
import './css/footer.css';
import './css/header.css';
import './css/homepage.css';
import './css/search.css';
import './css/profile.css';
import './css/study.css';
import App from'./components/App';

ReactDOM.render(<App />, document.getElementById('root'));
