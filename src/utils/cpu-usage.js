'use strict';

let previousUsage = process.cpuUsage();
let previousTimestamp = Date.now();

module.exports.sense = function () {
  let currentUsage = process.cpuUsage();
  let currentTimestamp = Date.now();

  let percentage_system = (currentUsage.system - previousUsage.system) / (currentTimestamp - previousTimestamp) / 10;
  let percentage_user = (currentUsage.user - previousUsage.user) / (currentTimestamp - previousTimestamp) / 10;

  return {
    system: percentage_system,
    user: percentage_user,
    total: percentage_system + percentage_user
  };
};
