import React from 'react';

const exports = {};

// Player views must be extended.
// It does not have its own Wrapper view.

exports.GuessFingers = class extends React.Component {
  render() {

    const {parent, playable, fingers} = this.props;
    return (
      <div>
        {fingers ? 'Got fingers' : ''}
        <input
          type='number'
          placeholder={0}
          onChange={(e) => this.setState({fingers: e.currentTarget.value})}
        />
        
        <button
          disabled={!playable}
          onClick={() => parent.playFingers(this.state.fingers)}
        >Pick Fingers</button>
      </div>
    );
  }
}

exports.GuessTotal = class extends React.Component {
  render() {
    const {parent, playable, total} = this.props;
    return (
      <div>
         {total ? 'Got a total' : ''}
         <input
          type='number'
          placeholder={0}
          onChange={(e) => this.setState({total: e.currentTarget.value})}
        /> 
        <button
          disabled={!playable}
          onClick={() => parent.playTotal(this.state.total)}
        >Pick Total</button>
      </div>
    );
  }
}

exports.WaitingForResults = class extends React.Component {
  render() {
    return (
      <div>
        Waiting for results...
      </div>
    );
  }
}

exports.Done = class extends React.Component {
  render() {
    const {outcome} = this.props;
    return (
      <div>
        Thank you for playing. The outcome of this game was:
        <br/>{outcome || 'No one guessed correctly. Playing another round.'}
      </div>
    );
  }
}

exports.Timeout = class extends React.Component {
  render() {
    return (
      <div>
        There's been a timeout. (Someone took too long.)
      </div>
    );
  }
}

export default exports;