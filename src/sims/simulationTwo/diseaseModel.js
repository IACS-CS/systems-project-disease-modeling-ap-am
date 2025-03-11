/**
 * Authors: 
 * Andre, Addario
 * 
 * What we are simulating:
 * - The spread of the flu
 * 
 * What we are attempting to model from the real world:
 * - The spread of sickness and how fast it spreads depending on flu season
 * 
 * What we are leaving out of our model:
 * - Death rate (Individuals will stay in the simulation even if infected)
 * 
 * What elements we have to add:
 * - Flu Season toggle 
 * 
 * What parameters we will allow users to "tweak":
 * - Infection chance, flu season, population, age distribution
 * 
 * In plain language, what our model does:
 * - Our model shows how flu spreads based on flu season, age, and infection chance.
 */

// Default simulation settings
export const defaultSimulationParameters = {
  fluSeason: false, // Flu season toggle
  immunityChance: 50, // Default chance to become immune after recovery (50%)
};

/**
 * Creates the initial population with a mix of young and old individuals.
 * @param {number} size - Total population size.
 * @param {number} youngRatio - Percentage of the population that is young.
 * @returns {Array} - Array representing the population.
 */
export const createPopulation = (size = 1600, youngRatio = 50) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  const youngPopulationCount = Math.floor((youngRatio / 100) * size); // Calculate young population size
  const oldPopulationCount = size - youngPopulationCount; // Remaining are old individuals

  // Generate individuals
  for (let i = 0; i < size; i++) {
    population.push({
      id: i, // Unique ID
      x: (100 * (i % sideSize)) / sideSize, // X coordinate
      y: (100 * Math.floor(i / sideSize)) / sideSize, // Y coordinate
      infected: false, // Initially not infected
      immune: false, // Initially not immune
      recovered: false, // Initially not recovered
      daysInfected: 0, // Days infected counter
      reinfected: false, // Reinfection status
      roundsSinceImmune: 0, // Tracks how long immunity lasts
      age: i < youngPopulationCount ? "young" : "old", // Assign age category
    });
  }

  // Select and infect patient zero (first infected person)
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

/**
 * Updates the population each round.
 * - Infected individuals recover after 5 days.
 * - Recovered individuals have a chance to become immune.
 * - The infection spreads to nearby individuals.
 * - Immune individuals can get reinfected only after 40 rounds.
 */
export const updatePopulation = (population, fluSeason, immunityChance) => {
  for (let p of population) {
    
    // Handle infected individuals
    if (p.infected) {
      p.daysInfected++;

      // Recover after 5 days
      if (p.daysInfected >= 5) {
        p.recovered = true;
        p.infected = false;
        p.daysInfected = 0;
      }
    }

    // Track how long an individual has been immune
    if (p.immune) {
      p.roundsSinceImmune++;
    }

    // Recovered individuals have a chance to become immune
    if (p.recovered && Math.random() < immunityChance / 100) {
      p.immune = true;
      p.recovered = false; // Remove recovered status
      p.roundsSinceImmune = 0; // Reset immunity timer
    }

    // Spread infection to nearby people
    if (!p.infected && !p.recovered) {
      for (let other of population) {
        if (
          other.infected &&
          Math.abs(p.x - other.x) < 10 && // Check if they are nearby
          Math.abs(p.y - other.y) < 10
        ) {
          if (Math.random() < 0.025) { // 2.5% chance of infection
            p.infected = true;
            break;
          }
        }
      }
    }

    // Reinfection chance (young: 1%, old: 2%)
    if (!p.reinfected && p.age === "young" && !p.infected && !p.recovered && Math.random() < 0.01) {
      p.infected = true;
    }
    if (!p.reinfected && p.age === "old" && !p.infected && !p.recovered && Math.random() < 0.02) {
      p.infected = true;
    }

    // Immune individuals can only get reinfected after 40 rounds
    if (p.immune && p.roundsSinceImmune >= 40 && Math.random() < 0.01) {
      p.infected = true;
      p.daysInfected = 1;
      p.immune = false;
      p.reinfected = true;
    }
  }

  return population;
};

/**
 * Defines which statistics we track in the simulation.
 */
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Recovered", value: "recovered" },
  { label: "Total Immune", value: "immune" },
];

/**
 * Computes the statistics for a given round.
 * @param {Array} population - The entire population array.
 * @param {number} round - The current round number.
 * @returns {Object} - Statistics for the current round.
 */
export const computeStatistics = (population, round) => {
  let infected = 0;
  let recovered = 0;
  let immune = 0;

  for (let p of population) {
    if (p.infected) infected++;
    if (p.recovered) recovered++;
    if (p.immune) immune++;
  }

  return { round, infected, recovered, immune };
};
