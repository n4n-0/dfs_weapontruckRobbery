/* eslint-disable */
const cfg = require('../../config.ts');

let ESX = null;
emit("esx:getSharedObject", (obj) => ESX = obj);

ESX.RegisterUsableItem('darkUSB', function(source) {
  const xPlayer = ESX.GetPlayerFromId(source);
  if (xPlayer.getInventoryItem('darkUSB').count >= 1) {
    xPlayer.removeInventoryItem('darkUSB', 1)
    emitNet('dfs_weaponTruckRobbery:UsableItem', source);
  } else {
    global.exports.mythic_notify.DoHudText('inform', 'You need a ~r~Hacking Device~s~ to use the ~y~USB~s~');
  }
});

onNet('dfs_weaponTruckRobbery:Reward', async (minMoney, maxMoney) => {
  console.log('I ran')
  const xPlayer = ESX.GetPlayerFromId(source);
  const moneyReward = Math.floor(Math.random() * (maxMoney - minMoney + 1)) + minMoney;
  xPlayer.addMoney(moneyReward);
  emitNet('mythic_notify:client:SendAlert', source, {type: 'inform', text: `You have received $${moneyReward}`});
  const itemRoll = Math.floor(Math.random() * Object.keys(cfg.settings.rewardSettings.items).length);
  const itemAmount = Math.floor(Math.random() * (cfg.settingscd.rewardSettings.itemMax - cfg.settings.rewardSettings.itemMin + 1)) + cfg.settings.rewardSettings.itemMin;
  xPlayer.addInventoryItem(cfg.settings.rewardSettings.items[itemRoll], itemAmount);
  emitNet('mythic_notify:client:SendAlert', source, {type: 'inform', text: `You have received Weapon Materials`});
});

RegisterCommand('test', (min, max) => {
  emitNet('dfs_weaponTruckRobbery:Reward', min, max);
}, false);