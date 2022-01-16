/* eslint-disable */
const cfg = require('../../config.ts');

let ESX = null;
emit("esx:getSharedObject", (obj) => ESX = obj);

interface missionLog {
    id: number;
    jobCompleted: boolean;
    inProgress: boolean;
    startDeliveryTime: number;
    endDeliveryTime: number;
}

const missionLog = new Map<number, missionLog>();

ESX.RegisterUsableItem('darkUSB', function(source) {
  const xPlayer = ESX.GetPlayerFromId(source);
  if (xPlayer.getInventoryItem('darkUSB').count >= 1) {
    xPlayer.removeInventoryItem('darkUSB', 1)
    emitNet('dfs_weaponTruckRobbery:UsableItem', source);
  } else {
    global.exports.mythic_notify.DoHudText('inform', 'You need a ~r~Hacking Device~s~ to use the ~y~USB~s~');
  }
});

onNet('dfs_weaponTruckRobbery:StartMissionLog', () => {
  const source = global.source
  if(missionLog.has(Number(source))) return console.log('Mission already started for this player');

  missionLog.set(Number(source), {id: Number(source), jobCompleted: false, inProgress: false, startDeliveryTime: 0, endDeliveryTime: 0});
  console.log('Mission log started for player ' + source);
});

onNet('dfs_weaponTruckRobbery:StartDelivery', async () => {
  const player = GetPlayerName(source);
  const logPlayer = missionLog.get(Number(source));
  logPlayer.startDeliveryTime = GetGameTimer();
  console.log(`[DFS][WeaponTruckRobbery] ${player} just started the delivery at ${GetGameTimer()}`);
});

onNet('dfs_weaponTruckRobbery:CompleteDelivery', async () => {
  const player = GetPlayerName(source);
  const logPlayer = missionLog.get(Number(source));
  if(!missionLog.has(Number(source))) return console.log('Mission log not found for player ' + source + '. Possible cheater');

  logPlayer.endDeliveryTime = GetGameTimer();
  logPlayer.jobCompleted = true;

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
  missionLog.delete(Number(source));
  console.log(`[DFS][WeaponTruckRobbery] ${player} finished the mission`);
});