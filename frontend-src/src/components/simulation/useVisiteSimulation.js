/**
 * useVisiteSimulation — Main state machine hook for Visite Client simulation
 * Returns: { phase, scenario, activePeople, timer, phaseIdx, metrics, coaching, focus, consensus, tension, ... }
 * Stub: returns initial values. Full implementation in Step 2.
 */
import { useState } from "react";

export default function useVisiteSimulation(scenario) {
  const [phase, setPhase] = useState("splash"); // splash | simulation | end
  const [activePeople, setActivePeople] = useState([]);
  const [timer, setTimer] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [metrics, setMetrics] = useState({ interest: 50, trust: 35, resistance: 55 });
  const [coaching, setCoaching] = useState(null);
  const [focus, setFocus] = useState(null);
  const [consensus, setConsensus] = useState([]);
  const [tension, setTension] = useState(0);

  return {
    phase, setPhase,
    scenario,
    activePeople, setActivePeople,
    timer,
    phaseIdx,
    metrics,
    coaching,
    focus,
    consensus,
    tension,
  };
}
