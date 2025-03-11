/**
 * Authors: 
 * Andre, Addario
 * 
 * What we are simulating:
 * The spread of the flu
 * 
 * What we are attempting to model from the real world:
 * - The spread of the sickness and how fast it spreads depending on flu season
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

export const defaultSimulationParameters = {
  fluSeason: false, // Flu season toggle
  immunityChance: 50, // Default immunity chance is 50%
};

export const createPopulation = (size = 1600, youngRatio = 50) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  const youngPopulationCount = Math.floor((youngRatio / 100) * size);
  const oldPopulationCount = size - youngPopulationCount;

  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize,
      y: (100 * Math.floor(i / sideSize)) / sideSize,
      infected: false,
      immune: false,
      recovered: false,
      daysInfected: 0,
      reinfected: false,
      age: i < youngPopulationCount ? "young" : "old",
    });
  }

  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

export const updatePopulation = (population, fluSeason, immunityChance) => {
  for (let p of population) {
    if (p.infected) {
      p.daysInfected++;
      if (p.daysInfected >= 5) {
        p.recovered = true;
        p.infected = false;
        p.daysInfected = 0;

        if (Math.random() < immunityChance / 100) {
          p.immune = true;
        } else {
          p.infected = true;
          p.daysInfected = 1;
          p.reinfected = true;
        }
      }
    }

    if (!p.infected && !p.recovered) {
      for (let other of population) {
        if (other.infected && Math.abs(p.x - other.x) < 10 && Math.abs(p.y - other.y) < 10) {
          if (Math.random() < 0.025) {
            p.infected = true;
            p.newlyInfected = true;
            break;
          }
        }
      }
    }

    if (!p.reinfected && p.age === "young" && !p.infected && !p.recovered && Math.random() < 0.01) {
      p.infected = true;
    }
    if (!p.reinfected && p.age === "old" && !p.infected && !p.recovered && Math.random() < 0.02) {
      p.infected = true;
    }

    if (p.immune && !p.infected && !p.recovered && Math.random() < 0.01) {
      p.infected = true;
      p.daysInfected = 1;
      p.immune = false;
      p.reinfected = true;
    }

    if (p.reinfected && !p.infected && !p.recovered) {
      p.infected = false;
    }
  }

  return population;
};

export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Recovered", value: "recovered" },
  { label: "Total Immune", value: "immune" },
];

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
