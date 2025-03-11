import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";

const boxSize = 500;
const maxSize = 1000;

const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize);
  }

  function renderEmoji(p) {
    if (p.infected) return "🤢";  // Infected emoji
    if (p.immune) return "🦸";  // Immune emoji (this should take priority if the person is immune)
    if (p.recovered) return "🥳";  // Recovered emoji
    return "😀";  // Healthy individual emoji
}

  return (
    <>
      {amRenderingSubset && (
        <div className="subset-warning">
          Showing {maxSize} ({((maxSize * 100) / popSize).toFixed(2)}%) of {popSize} individuals...
        </div>
      )}
      {population.map((p) => (
        <div
          key={p.id}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${(p.y / 100) * boxSize}px)`,
          }}
        >
          {renderEmoji(p)}
        </div>
      ))}
    </>
  );
};

const Simulation = () => {
  const [popSize, setPopSize] = useState(20);
  const [youngRatio, setYoungRatio] = useState(50);
  const [fluSeason, setFluSeason] = useState(false);
  const [immunityChance, setImmunityChance] = useState(50);
  const [population, setPopulation] = useState(createPopulation(popSize * popSize, youngRatio));
  const [diseaseData, setDiseaseData] = useState([]);
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [autoMode, setAutoMode] = useState(false);

  const runTurn = () => {
    let newPopulation = updatePopulation([...population], fluSeason, immunityChance);
    setPopulation(newPopulation);
    let newStats = computeStatistics(newPopulation, diseaseData.length + 1);
    setDiseaseData([...diseaseData, newStats]);
  };

  const resetSimulation = () => {
    setPopulation(createPopulation(popSize * popSize, youngRatio));
    setDiseaseData([]);
  };

  useEffect(() => {
    if (autoMode) {
      setTimeout(runTurn, 500);
    }
  }, [autoMode, population]);

  return (
    <div>
      <h1>Flu Simulation</h1>
      <p>Population: {population.length} | Infected: {population.filter((p) => p.infected).length}</p>

      <button onClick={runTurn}>Next Turn</button>
      <button onClick={() => setAutoMode(true)}>AutoRun</button>
      <button onClick={() => setAutoMode(false)}>Stop</button>
      <button onClick={resetSimulation}>Reset</button>

      {/* 🔹 All User Controls Are Still Here */}
      <div>
        <label>
          Young Population Ratio: {youngRatio}%
          <input
            type="range"
            min="0"
            max="100"
            value={youngRatio}
            onChange={(e) => setYoungRatio(parseInt(e.target.value))}
          />
        </label>
      </div>

      <div>
        <label>
          Flu Season:
          <input
            type="checkbox"
            checked={fluSeason}
            onChange={() => setFluSeason(!fluSeason)}
          />
        </label>
      </div>

      <div>
        <label>
          Immunity Chance: {immunityChance}%
          <input
            type="range"
            min="0"
            max="100"
            value={immunityChance}
            onChange={(e) => setImmunityChance(parseInt(e.target.value))}
          />
        </label>
      </div>

      <section className="side-by-side">
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}

        <div className="world">
          <div className="population-box" style={{ width: boxSize, height: boxSize }}>
            {renderPatients(population)}
          </div>
        </div>

        {/* 🔹 New Table to Track Rounds, Infected, Recovered, and Immune Counts */}
        <div className="stats-table">
          <h2>Simulation Progress</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Round</th>
                <th>Infected</th>
                <th>Recovered</th>
                <th>Immune</th>
              </tr>
            </thead>
            <tbody>
              {diseaseData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.round}</td>
                  <td>{entry.infected}</td>
                  <td>{entry.recovered}</td>
                  <td>{entry.immune}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Simulation;