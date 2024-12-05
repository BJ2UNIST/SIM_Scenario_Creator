// 직진-좌회전 동시 신호 생성기

function buildSignals(connections, junctionType: number) {
  const edges: string[] = [];

  connections.forEach((connection) => {
    if (edges.indexOf(connection.from) < 0) {
      edges.push(connection.from);
    }

    // 현시값 설정을 위한 초기화
    connection.phases = [{}, {}, {}, {}];
  });

  function straightLeftSignal(connections, idx) {
    const r = connections.map((connection) => {
      const { from, to, label } = connection;
      if (connection.from === edges[idx]) {
        if (label === "straight") {
          return "G";
        }
        if (label === "left") {
          return "G";
        }
        if (label === "right") {
          return "g";
        }
        return "r";
      } else if (connection.from === edges[(idx + 1) % 4]) {
        if (label === "right") {
          return "g";
        }
      }
      return "r";
    });

    connections.forEach((connection, i) => {
      connection.phases[idx] = r[i];
    });

    return {
      state: r.join(""),
      duration: 25,
    };
  }

  const phase1 = straightLeftSignal(connections, 0);
  const phase2 = straightLeftSignal(connections, 1);
  const phase3 = straightLeftSignal(connections, 2);
  const phase4 = straightLeftSignal(connections, 3);

  return {
    phases: [phase1, phase2, phase3, phase4],
    connections,
  };
}

// 3거리용
function buildSignals2(connections, junctionType: number) {
  const edges: string[] = [];

  connections.forEach((connection) => {
    if (edges.indexOf(connection.from) < 0) {
      edges.push(connection.from);
    }

    // 현시값 설정을 위한 초기화
    connection.phases = new Array(junctionType).fill("").map(() => ({}));
  });

  function straightLeftSignal(connections, idx) {
    const r = connections.map((connection) => {
      const { from, to, label } = connection;
      if (connection.from === edges[idx]) {
        if (label === "straight") {
          return "G";
        }
        if (label === "left") {
          return "G";
        }
        if (label === "right") {
          return "g";
        }
        return "r";
      } else if (connection.from === edges[(idx + 1) % junctionType]) {
        if (label === "right") {
          return "g";
        }
      }
      return "r";
    });

    connections.forEach((connection, i) => {
      connection.phases[idx] = r[i];
    });

    return {
      state: r.join(""),
      duration: 25,
    };
  }

  const phase1 = straightLeftSignal(connections, 0);
  const phase2 = straightLeftSignal(connections, 1);
  const phase3 = straightLeftSignal(connections, 2);
  const phase4 = straightLeftSignal(connections, 3);

  return {
    phases:
      junctionType === 4
        ? [phase1, phase2, phase3, phase4]
        : [phase1, phase2, phase3],
    connections,
  };
}

export { buildSignals2 as buildSignals };
