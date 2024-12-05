
export const INCOMING_LANE_MARKER_COLOR = 'skyblue'
export const OUTGOING_LANE_MARKER_COLOR = 'blue'

export const TYPE_LANE_MARKER = 'LaneMarker'
export const TYPE_CONNECTION = 'Connection'
export const TYPE_LANE = 'Lane'

export const DIRECTION_IN = 'in'
export const DIRECTION_OUT = 'out'

export const EDGE_IN_COLOR = 'gray'
export const EDGE_OUT_COLOR = 'lightgray'

function getDirectionColor(direction) {
  return direction === DIRECTION_IN ? INCOMING_LANE_MARKER_COLOR : OUTGOING_LANE_MARKER_COLOR
}


export { getDirectionColor }

export default {}
