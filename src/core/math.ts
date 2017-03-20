export function mapValueToRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  if(value < inMin) {
    return outMin
  }

  if(value > inMax) {
    return outMax
  }

  return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin
}
