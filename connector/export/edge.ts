function exportEdges(edges: any[]) {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`,
    `<edges>`,
  ];

  edges.forEach((edge) => {
    const { LINK_ID, F_NODE, T_NODE, LANES } = edge.properties;
    const line = `    <edge id="${LINK_ID}" from="${F_NODE}" to="${T_NODE}" numLanes="${LANES}" />`;
    lines.push(line);
  });
  lines.push(`</edges>`);
  return lines.join("\n");
}

export default exportEdges;
