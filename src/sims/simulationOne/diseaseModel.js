//AI used through out this project
import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

export const defaultSimulationParameters = {
  infectionChance: 50,
  deathRate : 40,
  immunityRate : 80,
  // Add any new parameters you want here with their initial values
};

export const createPopulation = (size = 1600, initialInfected = 10) => {
  const population = [];
  const sideSize = Math.sqrt(size);

  // Create the population and give them initial status
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize,
      y: (100 * Math.floor(i / sideSize)) / sideSize,
      infected: false,
      daysSick: 0, // Track how long they've been sick
      alive: true, // Track if they're dead or alive
      immune: false, // Track if they become immune
    });
  }

  // Infect initial individuals
  for (let i = 0; i < initialInfected; i++) {
    const patient = population[Math.floor(Math.random() * size)];
    patient.infected = true;
  }

  return population;
};

const updateIndividual = (person, contact, params) => {
  if (!person.alive || person.immune) {
    return; // Dead or immune people don't interact
  }

  if (person.infected) {
    person.daysSick += 1;
    if (person.daysSick >= 3) {
      if (Math.random() < (params.deathRate / 100)) {
        person.alive = false; // 40% chance of death
      } else {
        person.infected = false;
        person.daysSick = 0;
        if (Math.random() < (params.immunityRate/100)) {
          person.immune = true; // 80% chance of gaining immunity
        }
      }
    }
  }

  if (contact.infected && Math.random() * 100 < params.infectionChance) {
    if (!person.infected && person.alive && !person.immune) {
      person.infected = true;
      person.daysSick = 0;
    }
  }
};

export const updatePopulation = (population, params) => {
  population = shufflePopulation(population);
  for (let i = 0; i < population.length; i++) {
    let p = population[i];
    let contact = population[(i + 1) % population.length];
    updateIndividual(p, contact, params);
  }
  return population;
};

export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Total Dead", value: "dead" },
  { label: "Total Immune", value: "immune" },
];

export const computeStatistics = (population, round) => {
  let infected = 0;
  let dead = 0;
  let immune = 0;

  // Counting infected, dead, and immune individuals
  for (let p of population) {
    if (p.infected) infected += 1;
    if (!p.alive) dead += 1;
    if (p.immune) immune += 1;
  }

  return { round, infected, dead, immune };
};
