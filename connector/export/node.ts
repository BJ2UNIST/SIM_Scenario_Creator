function exportNodes(nodes: any[]) {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`,
    `<nodes>`,
  ];

  nodes.forEach((node) => {
    const line = `    <node id="${node.properties.NODE_ID}" x="${node.geometry.coordinates[0]}" y="${node.geometry.coordinates[1]}" />`;
    lines.push(line);
  });
  lines.push(`</nodes>`);
  return lines.join("\n");
}

export default exportNodes;
