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
  }

  addPhase(state, duration) {
    this.phases.push(new Phase(state, duration));
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
    this.includeSeparateLeftTurn = false;
  }

  setIncludeSeparateLeftTurn(include) {
    this.includeSeparateLeftTurn = include;
  }

  generateSignalPlan(intersectionId) {
    const signalPlan = new SignalPlan(intersectionId);
    const stateLength = 12; // 3 lanes per direction (straight, right, left) * 4 directions

    // North-South
    signalPlan.addPhase("GGGrrrrrrrGG", 30);

    // East-West
    signalPlan.addPhase("rrrGGGrrrrrr", 30);

    if (this.includeSeparateLeftTurn) {
      // North-South left turn
      signalPlan.addPhase("rrrrrrrGGrrr", 15);

      // East-West left turn
      signalPlan.addPhase("rrrrrrrrrrGG", 15);
    }

    return signalPlan;
  }
}

// Usage example
const generator = new SignalPlanGenerator();
generator.setIncludeSeparateLeftTurn(true);
const signalPlan = generator.generateSignalPlan("intersection1");
console.log(signalPlan.generateXML());
