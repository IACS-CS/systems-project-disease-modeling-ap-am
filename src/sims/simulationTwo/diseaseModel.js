

/* Update this code to simulate a simple disease model! */

/* For this simulation, you should model a *real world disease* based on some real information about it.
*
* Options are:
* - Mononucleosis, which has an extremely long incubation period.
*
* - The flu: an ideal model for modeling vaccination. The flu evolves each season, so you can model
    a new "season" of the flu by modeling what percentage of the population gets vaccinated and how
    effective the vaccine is.
* 
* - An emerging pandemic: you can model a new disease (like COVID-19) which has a high infection rate.
*    Try to model the effects of an intervention like social distancing on the spread of the disease.
*    You can model the effects of subclinical infections (people who are infected but don't show symptoms)
*    by having a percentage of the population be asymptomatic carriers on the spread of the disease.
*
* - Malaria: a disease spread by a vector (mosquitoes). You can model the effects of the mosquito population
    (perhaps having it vary seasonally) on the spread of the disease, or attempt to model the effects of
    interventions like bed nets or insecticides.
*
* For whatever illness you choose, you should include at least one citation showing what you are simulating
* is based on real world data about a disease or a real-world intervention.
*/

/**
 * Authors: 
 * Andre, Addario
 * 
 * What we are simulating:
 * The spread of the flu
 * What we are attempting to model from the real world:
 * The spread of the sicknes and how fast it spreads depending on if its in season
 * What we are leaving out of our model:
 * Death rate
 * What elements we have to add:
 * Flu Season on and off button 
 * What parameters we will allow users to "tweak" to adjust the model:
 * Infection chance, flu season, population, Age of population 
 * In plain language, what our model does:
 * Our model shows the impact and distribution of the flu depending on things like if its flu seaon, age of the person, infection chance,
 */

import { shufflePopulation } from "../../lib/shufflePopulation";

// Default parameters -- any properties you add here
// will be passed to your disease model when it runs.
export const defaultSimulationParameters = {
  fluSeason: false, // Flu season toggle
};

export const createPopulation = (size = 1600, youngRatio = 50) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  const youngPopulationCount = Math.floor((youngRatio / 100) * size);
  const oldPopulationCount = size - youngPopulationCount;

  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize, // X-coordinate within 100 units
      y: (100 * Math.floor(i / sideSize)) / sideSize, // Y-coordinate scaled similarly
      infected: false,
      age: i < youngPopulationCount ? "young" : "old", // Assign age based on the ratio
      daysInfected: 0, // Track days infected
    });
  }

  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

export const updatePopulation = (population, fluSeason) => {
  let fluSeasonActive = fluSeason;

  // Loop through the population to update infection status
  for (let p of population) {
    if (p.infected) {
      p.daysInfected += 1;
      if (p.daysInfected >= 3) {
        p.infected = false; // Recover after 3 days
        p.daysInfected = 0;
      }
    }

    // Nearby individuals infection logic (simple model)
    if (!p.infected) {
      for (let other of population) {
        if (other.infected && Math.abs(p.x - other.x) < 10 && Math.abs(p.y - other.y) < 10) {
          // Nearby people can get infected
          if (Math.random() < 0.025) { // General infection rate in close proximity
            p.infected = true;
            p.newlyInfected = true;
            break;
          }
        }
      }
    }

    // Reinfection chance (1% for young, 2% for old)
    if (p.age === "young" && !p.infected && Math.random() < 0.01) {
      p.infected = true;
    }
    if (p.age === "old" && !p.infected && Math.random() < 0.02) {
      p.infected = true;
    }
  }

  return population;
};

export const trackedStats = [
  { label: "Total Infected", value: "infected" },
];

export const computeStatistics = (population, round) => {
  let infected = 0;
  for (let p of population) {
    if (p.infected) {
      infected += 1; // Count the infected
    }
  }
  return { round, infected };
};
