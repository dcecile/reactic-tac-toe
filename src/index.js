import React from 'react';
import ReactDOM from 'react-dom';
import { Transition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames';
import './index.css';

function Square(props) {
  return (
    <span className="square" onClick={props.onClick}>
      {props.value}
    </span>
  );
}

function Board(props) {
  const renderSquare = i => (
    <Square
      value={props.squares[i]}
      onClick={() => props.onClick(i)}
    />
  );

  const renderRow = i => (
    <div className="board-row">
      {renderSquare(i * 3 + 0)}
      {renderSquare(i * 3 + 1)}
      {renderSquare(i * 3 + 2)}
    </div>
  );

  return (
    <div className="board-grid">
      {renderRow(0)}
      {renderRow(1)}
      {renderRow(2)}
    </div>
  );
}

function HistoryItem(props) {
  const moveNumber = !props.i ?  'game start' : `move #${props.i}`;
  const description = `Go to ${moveNumber}`;

  const className = classNames({
    'history-entry': true,
    'history-entry-current': props.diff === 0,
    'history-entry-next': props.diff > 0,
    [`history-entry-${props.status}`]: true
  });

  return (
    <button className={className} onClick={props.onClick}>
      {description}
    </button>
  );
}

class Game extends React.Component {
  constructor() {
    super()
    this.state = {
      history: [
        {
          squares: Array(9).fill(null)
        }
      ],
      historyIndex: 0
    };
  }

  get currentState() {
    return this.state.history[this.state.historyIndex];
  }

  pushState(newState) {
    const history = this.state.history.slice(0, this.state.historyIndex + 1);
    history.push(newState);
    this.setState({
      history,
      historyIndex: this.state.historyIndex + 1
    });
  }

  jumpToState(index) {
    const history = this.state.history;
    this.setState({
      history,
      historyIndex: index
    });
  }

  get nextPlayer() {
    return (this.state.historyIndex % 2) === 0 ? 'X' : 'O';
  }

  calculateWinner() {
    const createLine = (from, by) =>
      [0, 1, 2].map(i => from + i * by);

    const winningLines = [
      createLine(0, 1),
      createLine(0, 3),
      createLine(0, 4),
      createLine(1, 3),
      createLine(2, 2),
      createLine(2, 3),
      createLine(3, 1),
      createLine(6, 1),
    ];

    const getSquares = line =>
      line.map(i => this.currentState.squares[i]).join('');

    const isWinner = squares =>
      squares === 'XXX' || squares === 'OOO';

    return (winningLines.map(getSquares).find(isWinner) || '')[0];
  }

  handleClick(i) {
    if (this.calculateWinner() || this.currentState.squares[i]) {
      return;
    }

    const squares = this.currentState.squares.slice();
    squares[i] = this.nextPlayer;
    this.pushState({
      squares
    });
  }

  render() {
    return (
      <div className="game">
        <div className="game-main">
          {this.renderStatus()}
          <Board
            squares={this.currentState.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        {this.renderHistory()}
      </div>
    );
  }

  renderStatus() {
    const winner = this.calculateWinner();
    const status = winner ?
      `${winner} is the winner!` :
      `${this.nextPlayer} is next...`;

    return (
      <div className="status">{status}</div>
    );
  }

  renderHistory() {
    const createHistoryItem = (i, status) => (
      <HistoryItem
        i={i}
        status={status}
        diff={i - this.state.historyIndex}
        onClick={() => this.jumpToState(i)}
      />
    );

    const historyItems = this.state.history.map((_state, i) => (
      <Transition key={i} timeout={{exit: 400}}>
        {status => createHistoryItem(i, status)}
      </Transition>
    ));

    return (
      <TransitionGroup className="history">
        {historyItems}
      </TransitionGroup>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.querySelector('.root')
);
