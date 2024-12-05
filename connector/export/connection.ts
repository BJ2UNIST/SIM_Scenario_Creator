function exportConnections(connections: any[]) {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`,
    `<connections>`,
  ];

  connections.forEach((connection) => {
    const { from, to, fromLane, toLane } = connection.connections[0];
    const line = `    <connection from="${from}" to="${to}" fromLane="${fromLane}" toLane="${toLane}" />`;
    lines.push(line);
  });

  lines.push(`</connections>`);
  return lines.join("\n");
}

export default exportConnections;
