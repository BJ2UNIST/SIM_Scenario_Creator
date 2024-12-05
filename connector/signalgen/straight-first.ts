// 직진 우선 신호 생성기
// 1현시: 남북 방향 직진 신호
// 2현시: 남서 방향 좌회전 신호
// 3현시: 동서 방향 직진 신호
// 4현시: 북동 방향 좌회전 신호

function buildSignals(connections, junctionType: number) {
  const edges: string[] = [];

  connections.forEach((connection: any) => {
    if (edges.indexOf(connection.from) < 0) {
      edges.push(connection.from);
    }
    connection.phases = ["", "", "", ""];
  });

  function straightSignal(connections, edges, phase = 0): Phase {
    const r = connections.map((connection) => {
      if (edges.includes(connection.from)) {
        const { from, to, label } = connection;
        if (label === "straight") {
          return "G";
        }
        if (label === "right") {
          return "g";
        }
        return "r";
      }
      return "r";
    });

    connections.forEach((connection, idx) => {
      connection.phases[phase] = r[idx];
      // console.log("-->", r[idx]);
      // connection.phases[phase] = {
      //   state: r[idx].join(""),
      //   duration: 25,
      // };
    });

    return {
      state: r.join(""),
      duration: 25,
    };

    // return r;
  }

  function leftSignal(connections, edges, phase = 0): Phase {
    const r = connections.map((connection) => {
      const { from, to, label } = connection;
      if (edges.includes(from)) {
        if (label === "left") {
          return "G";
        }
        return "r";
      } else {
        if (label === "right") {
          return "g";
        }
        return "r";
      }
    });

    connections.forEach((connection, idx: number) => {
      connection.phases[phase] = r[idx];
    });

    // return r;
    return {
      state: r.join(""),
      duration: 25,
    };
  }

  const p1 = straightSignal(connections, [edges[0], edges[2]], 0); // 북쪽, 남쪽

  const p2 = leftSignal(connections, [edges[0], edges[2]], 1); // 북동, 남서

  const p3 = straightSignal(connections, [edges[1], edges[3]], 2); // 북쪽, 남쪽

  const p4 = leftSignal(connections, [edges[1], edges[3]], 3); // 남북, 동남

  // return [phase1, phase2, phase3, phase4, connections];

  return {
    phases: [p1, p2, p3, p4],
    connections,
  };
}

export { buildSignals };

interface Phase {
  state: string;
  duration: number;
}

export type { Phase };
