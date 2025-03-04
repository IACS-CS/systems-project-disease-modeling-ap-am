import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";
import { renderTable } from "../../lib/renderTable";

let boxSize = 500; // World box size in pixels
let maxSize = 1000; // Max number of icons we render (we can simulate big populations, but don't render them all...)

/**
 * Renders a subset of the population as a list of patients with emojis indicating their infection status.
 */
const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize);
  }

  function renderEmoji(p) {
    if (p.newlyInfected) {
      return "🤧"; // Sneezing Face for new cases
    } else if (p.infected) {
      return "🤢"; // Vomiting Face for already sick
    } else if (p.daysInfected === 0 && p.recovered) {
      return "🥳"; // Party Face for recovered
    } else if (p.immune) {
      return "🦸"; // Superhero for immune individuals
    } else {
      return "😀"; // Healthy person
    }
  }

  function renderSubsetWarning() {
    if (amRenderingSubset) {
      return (
        <div className="subset-warning">
          Only showing {maxSize} ({((maxSize * 100) / popSize).toFixed(2)}%) of{" "}
          {popSize} patients...
        </div>
      );
    }
  }

  return (
    <>
      {renderSubsetWarning()}
      {population.map((p) => (
        <div
          key={p.id}
          data-patient-id={p.id}
          data-patient-x={p.x}
          data-patient-y={p.y}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${
              (p.y / 100) * boxSize
            }px)`,
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
  const [youngRatio, setYoungRatio] = useState(50); // User controls this value (0-100)
  const [fluSeason, setFluSeason] = useState(false); // Flu season toggle
  const [population, setPopulation] = useState(createPopulation(popSize * popSize, youngRatio));
  const [diseaseData, setDiseaseData] = useState([]);
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [autoMode, setAutoMode] = useState(false);
  const [simulationParameters, setSimulationParameters] = useState(defaultSimulationParameters);

  // Runs a single simulation step
  const runTurn = () => {
    let newPopulation = updatePopulation([...population], fluSeason);
    setPopulation(newPopulation);
    let newStats = computeStatistics(newPopulation, diseaseData.length);
    setDiseaseData([...diseaseData, newStats]);
  };

  // Resets the simulation
  const resetSimulation = () => {
    setPopulation(createPopulation(popSize * popSize, youngRatio));
    setDiseaseData([]);
  };

  // Auto-run simulation effect
  useEffect(() => {
    if (autoMode) {
      setTimeout(runTurn, 500);
    }
  }, [autoMode, population]);

  return (
    <div>
      <section className="top">
        <h1>My Second Custom Simulation</h1>
        <p>
          Edit <code>simulationTwo/diseaseModel.js</code> to define how your
          simulation works. This one should try to replicate features of a real
          world illness and/or intervention.
        </p>

        <p>
          Population: {population.length}. Infected:{" "}
          {population.filter((p) => p.infected).length}
        </p>

        <button onClick={runTurn}>Next Turn</button>
        <button onClick={() => setAutoMode(true)}>AutoRun</button>
        <button onClick={() => setAutoMode(false)}>Stop</button>
        <button onClick={resetSimulation}>Reset Simulation</button>

        <div>
          {/* Age distribution slider */}
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
          {/* Flu Season Toggle */}
          <label>
            Flu Season:
            <input
              type="checkbox"
              checked={fluSeason}
              onChange={() => setFluSeason(!fluSeason)}
            />
          </label>
        </div>
      </section>

      <section className="side-by-side">
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}

        <div className="world">
          <div
            className="population-box"
            style={{ width: boxSize, height: boxSize }}
          >
            {renderPatients(population)}
          </div>
        </div>

        {renderTable(diseaseData, trackedStats)}
      </section>
    </div>
  );
};

export default Simulation;
