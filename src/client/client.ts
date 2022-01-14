let ESX = null;
emit("esx:getSharedObject", obj => {ESX = obj});

/* eslint-disable */
const cfg = require('../../config.ts');

// Blips
let blip;
let deliveryBlip;

let inProgress;
let goonsSpawned;
let vanSpawned;
let vanDelivered;
let jobVan;
let insideVan = false;
let isDead = false;

setImmediate(() => {
  emit('chatAddSuggestion', '/testreward', 'Test the reward for Weapon Truck Robbery', [
    {name: "Min Reward", help: "Minimum reward for the player"},
    {name: "Max Reward", help: "Maximum reward for the player"}
  ]);
});

function CreateMissionBlip(x,y,z) {
  blip = AddBlipForCoord(x,y,z);
	SetBlipSprite(blip, 1);
	SetBlipColour(blip, 5);
	AddTextEntry('MYBLIP', "Drug Job");
	BeginTextCommandSetBlipName('MYBLIP');
	EndTextCommandSetBlipName(blip);
	SetBlipScale(blip, 0.9);
	SetBlipAsShortRange(blip, true);
	SetBlipRoute(blip, true);
	SetBlipRouteColour(blip, 5);
	return blip;
}

function CreateDeliveryBlip(x,y,z) {
  deliveryBlip = AddBlipForCoord(x,y,z);
  SetBlipColour(deliveryBlip, 5);
  BeginTextCommandSetBlipName("STRING");
	AddTextComponentString("Delivery Location");
	EndTextCommandSetBlipName(deliveryBlip);
  SetBlipRoute(deliveryBlip, true);
  SetBlipRouteColour(deliveryBlip, 5);
  return deliveryBlip;
}

function Delay(ms) { 
  return new Promise((res) => {
      setTimeout(res, ms)
  })
}

function DrawText3Ds(x, y, z, text) {
  SetTextScale(0.35, 0.35);
  SetTextFont(4);
  SetTextProportional(true);
  SetTextColour(255, 255, 255, 215);
  SetTextEntry("STRING");
  SetTextCentre(true);
  AddTextComponentString(text);
  SetDrawOrigin(x, y, z, 0);
  DrawText(0.0, 0.0);
  let factor = (text.length / 370);
  DrawRect(0.0, 0.0+0.0125, 0.017+ factor, 0.03, 0, 0, 0, 75);
  ClearDrawOrigin();
}

onNet('dfs_weaponTruckRobbery:UsableItem', async () => {
  const playerPed = PlayerPedId();
  if(IsPedInAnyVehicle(playerPed, false)) { // Checks if player is in a vehicle
    global.exports.progressBars.startUI(4000, 'CONNECTING USB TO DEVICE');
    await Delay(4000);

    if(Math.floor(Math.random() * 10) >= 3) { // 7% chance of success
      global.exports.mythic_notify.DoHudText('inform', 'USB connected successfully');
      emit('dfs_weaponTruckRobbery:Main', 0, 500);
    } else {
      global.exports.mythic_notify.DoHudText('inform', 'USB has no information avaialable');
    }
  } else { // Player is not in a vehicle
    TaskStartScenarioInPlace(playerPed, 'WORLD_HUMAN_STAND_MOBILE', 0, true);
    FreezeEntityPosition(playerPed, true);
    global.exports.progressBars.startUI(4000, 'CONNECTING USB TO DEVICE');
    await Delay(4000);

    if(Math.floor(Math.random() * 10) >= 3) { // 7% chance of success
      global.exports.mythic_notify.DoHudText('inform', 'USB connected successfully');
      FreezeEntityPosition(playerPed, false);
      ClearPedTasks(playerPed);
      emit('dfs_weaponTruckRobbery:Main', source);
    } else {
      global.exports.mythic_notify.DoHudText('inform', 'USB has no information avaialable');
      FreezeEntityPosition(playerPed, false);
      ClearPedTasks(playerPed);
    }
  }
});

on('dfs_weaponTruckRobbery:Main', async () => {
  const playerPed = PlayerPedId();
  const jobLocation = cfg.locations.jobLocations.loc1;
  const deliveryLocation = cfg.locations.deliveryLocations.loc1;

  // Reset Mission
  emit('dfs_weaponTruckRobbery:Reset');
  emitNet('dfs_weaponTruckRobbery:StartMission');

  // Create First Blip
  const blipCoords = cfg.locations.jobLocations.loc1.Spot;
  blip = CreateMissionBlip(blipCoords.x, blipCoords.y, blipCoords.z);
  global.exports.mythic_notify.DoHudText('inform', 'The USB has marked a location on your GPS');
  inProgress = true;

  while(inProgress) {
    await Delay(1);

    while(!goonsSpawned) {
      await Delay(1);
      const coords = GetEntityCoords(playerPed, true);
  
      if(GetDistanceBetweenCoords(coords[0], coords[1], coords[2], jobLocation.Spot.x, jobLocation.Spot.y, jobLocation.Spot.z, true) < 250) {
        ClearAreaOfPeds(jobLocation.Spot.x, jobLocation.Spot.y, jobLocation.Spot.z, 50, 0);
        SetPedRelationshipGroupHash(GetPlayerPed(-1), GetHashKey("PLAYER"));
        AddRelationshipGroup('JobGoons', 0);
        global.exports.mythic_notify.DoHudText('inform', 'Next Step is Spawn Goons')
        for(let i = 0; i < Object.keys(cfg.locations.jobLocations.loc1.Goons).length; i++) {
          const goon = jobLocation.Goons[i];
          const pedModel = GetHashKey(goon.ped);
          RequestModel(pedModel);
          while(!HasModelLoaded(pedModel)) {
            await Delay(1);
          }
          const goonPed = CreatePed(4, pedModel, goon.x, goon.y, goon.z, goon.h, false, false);
          SetPedCanSwitchWeapon(goonPed, true);
          GiveWeaponToPed(goonPed, GetHashKey(goon.weapon), 999, false, true);
          SetPedArmour(goonPed, 50);
          SetPedAccuracy(goonPed, 60);
          SetPedDropsWeaponsWhenDead(goonPed, false);
          SetPedRelationshipGroupHash(goonPed, GetHashKey("JobGoons"));
  
          global.exports.mythic_notify.DoHudText('inform', `${goon.ped} has spawned`);
        }
        SetRelationshipBetweenGroups(5, GetHashKey("JobGoons"), GetHashKey("PLAYER"));
        goonsSpawned = true;
      }
    }
    while(!vanSpawned) {
      await Delay(1);
      const coords = GetEntityCoords(playerPed, true);
      if(GetDistanceBetweenCoords(coords[0], coords[1], coords[2], jobLocation.Spot.x, jobLocation.Spot.y, jobLocation.Spot.z, true) < 150) {
        ClearAreaOfVehicles(jobLocation.Spot.x, jobLocation.Spot.y, jobLocation.Spot.z, 50, false, false, false, false, false);
        global.exports.mythic_notify.DoHudText('inform', 'Next Step is to Spawn Van');
        ESX.Game.SpawnVehicle(cfg.settings.jobSettings.jobVan, jobLocation.Spot, jobLocation.Heading, (vehicle) => {
          SetEntityCoordsNoOffset(vehicle, jobLocation.Spot.x, jobLocation.Spot.y, jobLocation.Spot.z, false, false, false);
            SetEntityHeading(vehicle, 243.62330627442);
            FreezeEntityPosition(vehicle, true);
            SetVehicleOnGroundProperly(vehicle);
            FreezeEntityPosition(vehicle, false);
  
            jobVan = vehicle
            SetEntityAsMissionEntity(jobVan, true, true);
        });
        vanSpawned = true;
      }
    }
    while(!insideVan) {
      await Delay(1);
      if(IsPedInAnyVehicle(playerPed, false)) {
        if(GetVehiclePedIsIn(playerPed, false) == jobVan) {
          RemoveBlip(blip);
          emitNet('dfs_weaponTruckRobbery:StartDelivery');
          deliveryBlip = CreateDeliveryBlip(deliveryLocation.Spot.x, deliveryLocation.Spot.y, deliveryLocation.Spot.z);
          global.exports.mythic_notify.DoHudText('inform', 'Head to the point marked on your GPS');
          insideVan = true;
        }
      }
    }

    const coords = GetEntityCoords(playerPed, true);
    if(GetDistanceBetweenCoords(coords[0], coords[1], coords[2], deliveryLocation.Spot.x, deliveryLocation.Spot.y, deliveryLocation.Spot.z, true) < 5) {
      RemoveBlip(deliveryBlip);
      DrawText3Ds(deliveryLocation.Spot.x, deliveryLocation.Spot.y, deliveryLocation.Spot.z, 'Press [E] to Deliver');

      if(!vanDelivered) {
        if(IsControlJustPressed(0, 38)) {
          global.exports.mythic_notify.DoHudText('inform', 'Please wait while we process your delivery');
          FreezeEntityPosition(jobVan, true);
          const ped = GetHashKey('s_m_m_chemsec_01');
          RequestModel(ped);
          while(!HasModelLoaded(ped)) {
            await Delay(500);
          }
          const dropPed = CreatePed(4, ped, deliveryLocation.NPCSpawn.x, deliveryLocation.NPCSpawn.y, deliveryLocation.NPCSpawn.z, deliveryLocation.NPCSpawn.h, false, false);
          TaskGoToCoordAnyMeans(dropPed, deliveryLocation.NPCTargetCoords.x, deliveryLocation.NPCTargetCoords.y, deliveryLocation.NPCTargetCoords.z, 1.0, 0, false, 786603, 0xbf800000);

          await Delay(8000);
          TaskStartScenarioInPlace(dropPed, 'CODE_HUMAN_MEDIC_TIME_OF_DEATH', 0, true);
          SetVehicleDoorOpen(jobVan, 3, false, false);
          SetVehicleDoorOpen(jobVan, 2, false, false);
          global.exports.progressBars.startUI(15000, "Processing Delivery");
          await Delay(15000);
          SetVehicleDoorShut(jobVan, 3, false);
          SetVehicleDoorShut(jobVan, 2, false);
          ClearPedTasks(dropPed);
          TaskGoToCoordAnyMeans(dropPed, deliveryLocation.NPCSpawn.x, deliveryLocation.NPCSpawn.y, deliveryLocation.NPCSpawn.z, 1.0, 0, false, 786603, 0xbf800000);
          FreezeEntityPosition(jobVan, false);
          vanDelivered = true;
          global.exports.mythic_notify.DoHudText('inform', 'Thanks for the delivery! Better leave the area as fast as possible');
          emitNet('dfs_weaponTruckRobbery:CompleteDelivery');
          await Delay(15000);
          DeletePed(dropPed);
          emit('dfs_weaponTruckRobbery:Reset');
        }
      }
    }
  }
});

on('esx:onPlayerDeath', (data) => {
  const jobLocation = cfg.locations.jobLocations.loc1;
  global.exports.mythic_notify.DoHudText('inform', 'You failed to steal the van and they have fled the scene');
  emitNet('dfs_weaponTruckRobbery:Reset');
  ClearAreaOfVehicles(jobLocation.Spot.x, jobLocation.Spot.y, jobLocation.Spot.z, 50, false, false, false, false, false);
});

on('dfs_weaponTruckRobbery:Reset', async () => { 
  emitNet('dfs_weaponTruckRobbery:EndMission');
  vanSpawned = cfg.locations.jobLocations.loc1.VanSpawned;
  vanDelivered = cfg.locations.jobLocations.loc1.VanDelivered;
  goonsSpawned = cfg.locations.jobLocations.loc1.GoonsSpawned;
  inProgress = cfg.locations.jobLocations.loc1.InProgress;
  jobVan = null;
  insideVan = false;
});

RegisterCommand('testreward', async (source, args) => {
  if(args === undefined || args.length === 0) {
    emitNet('dfs_weaponTruckRobbery:CompleteDelivery');
  } else {
    global.exports.mythic_notify.DoHudText('inform', 'This command does not take any arguments');
  }
}, false);

// RegisterCommand('test1', async (source, args) => {
//   if(args === undefined || args.length === 0) {
//     emitNet('dfs_weaponTruckRobbery:StartMission');
//   } else {
//     global.exports.mythic_notify.DoHudText('inform', 'This command does not take any arguments');
//   }
// }, false);

// RegisterCommand('test2', async (source, args) => {
//   if(args === undefined || args.length === 0) {
//     emitNet('dfs_weaponTruckRobbery:EndMission');
//   } else {
//     global.exports.mythic_notify.DoHudText('inform', 'This command does not take any arguments');
//   }
// }, false);