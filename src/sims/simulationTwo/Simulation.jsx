import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";

// Set size constants for the grid that displays the population.
const boxSize = 500; // Width/height of the population box
const maxSize = 1000; // Max population size shown in the grid at once

// Function to render patient status using emojis (based on their health status)
const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize; // Check if the population size exceeds maxSize
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize); // Slice the population if too large to render
  }

  // Function that assigns emojis based on health status
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
      {/* Render each individual in the population */}
      {population.map((p) => (
        <div
          key={p.id}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${(p.y / 100) * boxSize}px)`, // Position patient
          }}
        >
          {renderEmoji(p)} {/* Render emoji for the patient */}
        </div>
      ))}
    </>
  );
};

const Simulation = () => {
  // State hooks to manage the simulation parameters and data
  const [popSize, setPopSize] = useState(20); // Population size
  const [youngRatio, setYoungRatio] = useState(50); // Ratio of young to old population
  const [fluSeason, setFluSeason] = useState(false); // Whether it's flu season or not
  const [immunityChance, setImmunityChance] = useState(50); // Probability of becoming immune after recovery
  const [population, setPopulation] = useState(createPopulation(popSize * popSize, youngRatio)); // Initial population
  const [diseaseData, setDiseaseData] = useState([]); // Store disease data for chart
  const [lineToGraph, setLineToGraph] = useState("infected"); // Track which data to graph (Infected, Recovered, Immune)
  const [autoMode, setAutoMode] = useState(false); // Toggle auto mode to automatically simulate turns

  // Function to run a turn (i.e., update population, stats, etc.)
  const runTurn = () => {
    let newPopulation = updatePopulation([...population], fluSeason, immunityChance); // Update population based on the current state
    setPopulation(newPopulation); // Update state with new population
    let newStats = computeStatistics(newPopulation, diseaseData.length + 1); // Compute stats for this round
    setDiseaseData([...diseaseData, newStats]); // Add new stats to the diseaseData array
  };

  // Function to reset the simulation to its initial state
  const resetSimulation = () => {
    setPopulation(createPopulation(popSize * popSize, youngRatio)); // Create a new population
    setDiseaseData([]); // Reset disease statistics
  };

  // Effect hook that runs when autoMode or population changes
  useEffect(() => {
    if (autoMode) {
      setTimeout(runTurn, 500); // Automatically run the simulation every 500ms
    }
  }, [autoMode, population]); // Dependencies: autoMode, population

  return (
    <div>
      <h1>Flu Simulation</h1>
      <h3></h3>The model shows how disease spreads based on age, flu season, and infection rate. You can see how young and old people are affected differently by the infection. Turning flu season on makes the infection spread faster. Tracking infection rates and population helps us understand how the disease grows and recovers as well as how effective immunity becomes.

      <p>Population: {population.length} | Infected: {population.filter((p) => p.infected).length}</p> {/* Display population and infected count */}

      {/* Simulation Control Buttons */}
      <button onClick={runTurn}>Next Turn</button> {/* Run the next simulation turn */}
      <button onClick={() => setAutoMode(true)}>AutoRun</button> {/* Start auto mode */}
      <button onClick={() => setAutoMode(false)}>Stop</button> {/* Stop auto mode */}
      <button onClick={resetSimulation}>Reset</button> {/* Reset simulation to its initial state */}

      {/* User Controls for adjusting simulation parameters */}
      <div>
        <label>
          Young Population Ratio: {youngRatio}%
          <input
            type="range"
            min="0"
            max="100"
            value={youngRatio}
            onChange={(e) => setYoungRatio(parseInt(e.target.value))} // Update youngRatio state
          />
        </label>
      </div>

      <div>
        <label>
          Flu Season:
          <input
            type="checkbox"
            checked={fluSeason}
            onChange={() => setFluSeason(!fluSeason)} // Toggle flu season state
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
            onChange={(e) => setImmunityChance(parseInt(e.target.value))} // Update immunityChance state
          />
        </label>
      </div>

      {/* Side-by-side layout: Chart on the left, population on the right */}
      <section className="side-by-side">
        {/* Render the chart based on diseaseData */}
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}

        {/* Render the population grid */}
        <div className="world">
          <div className="population-box" style={{ width: boxSize, height: boxSize }}>
            {renderPatients(population)} {/* Render patients in the grid */}
          </div>
        </div>

        {/* Display statistics in a table format */}
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
              {/* Map through diseaseData to show each round's stats */}
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

export default Simulation; // Export Simulation component
