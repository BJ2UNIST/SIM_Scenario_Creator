function exportSignals(signals: any[]) {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`,
    `<trafficSignalSystem>`,
  ];
  signals.forEach((signal) => {
    const { nodeId, schedules } = signal;
    const line = `    <trafficSignal id="${nodeId}">`;
    lines.push(line);
    schedules.forEach((schedule: any) => {
      schedule.phase.forEach((phase: any) => {
        const { state, duration } = phase;
        const line = `        <phase state="${state}" duration="${duration}" />`;
        lines.push(line);
      });
    });
    lines.push(`    </trafficSignal>`);
  });

  lines.push(`</trafficSignalSystem>`);
  return lines.join("\n");
}

export default exportSignals;
