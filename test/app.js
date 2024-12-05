class Connection {
  constructor(from, to, fromLane, toLane) {
    this.from = from;
    this.to = to;
    this.fromLane = fromLane;
    this.toLane = toLane;
  }
}

class Phase {
  constructor(connections, duration = 30) {
    this.connections = connections;
    this.duration = duration;
  }
}

class SignalPlan {
  constructor() {
    this.phases = [];
    this.yellowTime = 3;
    this.allRedTime = 2;
  }

  addPhase(phase) {
    this.phases.push(phase);
  }

  generateXML() {
    let xml = '<tlLogic id="intersection1" type="static" programID="1" offset="0">\n';
    let time = 0;
    this.phases.forEach((phase, index) => {
      xml += `  <phase duration="${phase.duration}" state="${this.generateStateString(index)}"/>\n`;
      time += phase.duration;
      xml += `  <phase duration="${this.yellowTime}" state="${this.generateYellowState(index)}"/>\n`;
      time += this.yellowTime;
      xml += `  <phase duration="${this.allRedTime}" state="${this.generateAllRedState()}"/>\n`;
      time += this.allRedTime;
    });
    xml += '</tlLogic>';
    return xml;
  }

  generateStateString(currentPhaseIndex) {
    return this.phases.map((_, index) => index === currentPhaseIndex ? 'G' : 'r').join('');
  }

  generateYellowState(currentPhaseIndex) {
    return this.phases.map((_, index) => index === currentPhaseIndex ? 'y' : 'r').join('');
  }

  generateAllRedState() {
    return 'r'.repeat(this.phases.length);
  }
}

function generateSignalPlan(connections) {
  const groupedConnections = groupConnections(connections);
  const signalPlan = new SignalPlan();
  console.log(groupedConnections)
  Object.values(groupedConnections).forEach(group => {
    signalPlan.addPhase(new Phase(group));
  });

  return signalPlan;
}

function groupConnections(connections) {
  const groups = {};
  connections.forEach(conn => {
    const key = `${conn.from}-${conn.to}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(conn);
  });
  return groups;
}

// 사용 예시
const connections = [
  new Connection('N', 'S', 0, 0),
  new Connection('N', 'S', 1, 1),
  // new Connection('E', 'W', 0, 0),
  // new Connection('E', 'W', 1, 1),
  // new Connection('S', 'N', 0, 0),
  // new Connection('S', 'N', 1, 1),
  // new Connection('W', 'E', 0, 0),
  // new Connection('W', 'E', 1, 1),
  // new Connection('N', 'E', 2, 0), // 좌회전
  // new Connection('E', 'S', 2, 0), // 좌회전
  // new Connection('S', 'W', 2, 0), // 좌회전
  // new Connection('W', 'N', 2, 0)  // 좌회전
];

const signalPlan = generateSignalPlan(connections);
console.log(signalPlan.generateXML());
