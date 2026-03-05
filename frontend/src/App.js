import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Navbar from './components/Navbar';
import FitnessTimetable from './pages/FitnessTimetable';
import FoodLog from './pages/FoodLog';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/fitness" />} />
            <Route path="/fitness" component={FitnessTimetable} />
            <Route path="/food" component={FoodLog} />
          </Switch>
        </main>
      </div>
    </Router>
  );
}

export default App;
