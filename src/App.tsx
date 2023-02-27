import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Scanner} from "./scanner";



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Scanner></Scanner>

      </header>
    </div>
  );
}

export default App;
