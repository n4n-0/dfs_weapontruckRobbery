/* eslint-disable */
const cfg = require('../../config.ts');

let ESX = null;
emit("esx:getSharedObject", (obj) => ESX = obj);

function MissionProgress(id:number, jobCompleted:boolean, inProgress:boolean, startDeliveryTime:number, endDeliveryTime:number) {
    this.id = id;
    this.jobCompleted = jobCompleted;
    this.inProgress = inProgress;
    this.startDeliveryTime = startDeliveryTime;
    this.endDeliveryTime = endDeliveryTime;
}

ESX.RegisterUsableItem('darkUSB', function(source) {
  const xPlayer = ESX.GetPlayerFromId(source);
  if (xPlayer.getInventoryItem('darkUSB').count >= 1) {
    xPlayer.removeInventoryItem('darkUSB', 1)
    emitNet('dfs_weaponTruckRobbery:UsableItem', source);
  } else {
    global.exports.mythic_notify.DoHudText('inform', 'You need a ~r~Hacking Device~s~ to use the ~y~USB~s~');
  }
});

onNet('dfs_weaponTruckRobbery:StartMission', async () => {
  const player = GetPlayerName(source);
  eval(`missionProgress${player} = new MissionProgress(${source}, false, true, 0, 0)`);
  console.log('[DFS][WeaponTruckRobbery] Mission Started by ' + player);
});

onNet('dfs_weaponTruckRobbery:StartDelivery', async () => {
  const player = GetPlayerName(source);
  eval(`missionProgress${player}.startDeliveryTime = GetGameTimer()`);
  console.log(`[DFS][WeaponTruckRobbery] ${player} just started the delivery`);
});

onNet('dfs_weaponTruckRobbery:CompleteDelivery', async () => {
  const player = GetPlayerName(source);

  try {
    eval(`missionProgress${player}`).jobCompleted = true;
    // Future update: calculate the time taken to complete the mission if its done to fast trigger a Error and nulls the reward
    eval(`missionProgress${player}`).endDeliveryTime = GetGameTimer();

    console.log(`[DFS][WeaponTruckRobbery] ${player} just completed the mission`);
    const minMoney = cfg.settings.rewardSettings.minCashReward;
    const maxMoney = cfg.settings.rewardSettings.maxCashReward;
    const xPlayer = ESX.GetPlayerFromId(source);
    const moneyReward = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney;
    xPlayer.addMoney(moneyReward);
    emitNet('mythic_notify:client:SendAlert', source, {type: 'inform', text: `You have received $${moneyReward}`});
    const itemRoll = Math.floor(Math.random() * Object.keys(cfg.settings.rewardSettings.items).length);
    const itemAmount = Math.floor(Math.random() * (cfg.settings.rewardSettings.itemMax - cfg.settings.rewardSettings.itemMin + 1)) + cfg.settings.rewardSettings.itemMin;
    xPlayer.addInventoryItem(cfg.settings.rewardSettings.items[itemRoll], itemAmount);
    emitNet('mythic_notify:client:SendAlert', source, {type: 'inform', text: `You have received Weapon Materials`});
  } catch (e) {
    console.log(`[DFS][WeaponTruckRobbery][ERROR]: Reward was triggered but Job was not completed. Possible Hacker [${source}]`);
  }
});

onNet('dfs_weaponTruckRobbery:EndMission', async () => {
  const player = GetPlayerName(source);
  eval(`missionProgress${player} = null`);
  console.log(`[DFS][WeaponTruckRobbery] ${player} finished the mission`);
});