class Connection {
  constructor(from, to, fromLane, toLane) {
    this.from = from;
    this.to = to;
    this.fromLane = fromLane;
    this.toLane = toLane;
  }
}

class Phase {
  constructor(state, duration) {
    this.state = state;
    this.duration = duration;
  }
}

class SignalPlan {
  constructor(id) {
    this.id = id;
    this.phases = [];
    this.yellowTime = 3;
    this.allRedTime = 2;
    this.cycleTime = 0;
  }

  addPhase(state, duration) {
    this.phases.push(new Phase(state, duration));
    this.cycleTime += duration + this.yellowTime + this.allRedTime;
  }

  generateXML() {
    let xml = `<tlLogic id="${this.id}" type="static" programID="1" offset="0">\n`;
    this.phases.forEach(phase => {
      xml += `  <phase duration="${phase.duration}" state="${phase.state}"/>\n`;
      xml += `  <phase duration="${this.yellowTime}" state="${this.generateYellowState(phase.state)}"/>\n`;
      xml += `  <phase duration="${this.allRedTime}" state="${'r'.repeat(phase.state.length)}"/>\n`;
    });
    xml += '</tlLogic>';
    return xml;
  }

  generateYellowState(greenState) {
    return greenState.replace(/G/g, 'y');
  }
}

class SignalPlanGenerator {
  constructor() {
    this.connections = [];
    this.includeSeparateLeftTurn = false;
  }

  addConnection(connection) {
    this.connections.push(connection);
  }

  setIncludeSeparateLeftTurn(include) {
    this.includeSeparateLeftTurn = include;
  }

  generateSignalPlan(intersectionId) {
    const signalPlan = new SignalPlan(intersectionId);
    const directions = ['N', 'E', 'S', 'W'];
    const stateLength = directions.length * 3; // 3 lanes per direction (straight, right, left)

    // Generate basic 4-phase plan
    directions.forEach(dir => {
      const state = this.generateStateForDirection(dir, stateLength);
      signalPlan.addPhase(state, 30); // Default duration of 30 seconds
    });

    // Add separate left-turn phases if enabled
    if (this.includeSeparateLeftTurn) {
      directions.forEach(dir => {
        const state = this.generateLeftTurnState(dir, stateLength);
        signalPlan.addPhase(state, 15); // Left-turn phase duration of 15 seconds
      });
    }

    return signalPlan;
  }

  generateStateForDirection(direction, stateLength) {
    let state = '';
    for (let i = 0; i < stateLength; i++) {
      if (i % 3 === 0) { // First lane of each direction
        state += i / 3 === directions.indexOf(direction) ? 'G' : 'r';
      } else if (i % 3 === 1) { // Second lane
        state += i / 3 === directions.indexOf(direction) ? 'G' : 'r';
      } else { // Third lane (left turn)
        state += 'r'; // Left turn is red in main phase
      }
    }
    return state;
  }

  generateLeftTurnState(direction, stateLength) {
    let state = 'r'.repeat(stateLength);
    const index = directions.indexOf(direction) * 3 + 2;
    state = state.substr(0, index) + 'G' + state.substr(index + 1);
    return state;
  }
}

// Usage example
const generator = new SignalPlanGenerator();

// Add connections (simplified for this example)
const directions = ['N', 'E', 'S', 'W'];
directions.forEach(from => {
  directions.forEach(to => {
    if (from !== to) {

      generator.addConnection(new Connection(from, to, 0, 0));
    }
  });
});

generator.setIncludeSeparateLeftTurn(true);
const signalPlan = generator.generateSignalPlan("intersection1");
console.log(signalPlan.generateXML());
