module.exports.settings = {
    policeSettings: {
        police: 'police',
        policeNotify: false
    },
    jobSettings: {
        coolDoownTime: 60, // in minutes
        hackingDevice: 'darkUSB',
        jobVan: 'rumpo2'
    },
    rewardSettings: {
        jobCompleted: false,
        minCashReward: 500,
        maxCashReward: 3000,
        itemMin: 10,
        itemMax: 50,
        items: [
            'pistolMats',
            'smgMats',
            'arMats',
            'shotgunMats',
            'sniperMats'
        ]
    }
},

module.exports.locations = {
    deliveryLocations: {
        loc1: {
            Spot: {x: 236.44, y: -3314.52, z: 5.8},
            NPCSpawn: {x: 247.64, y: -3315.6, z: 5.8, h: 186.12},
            NPCTargetCoords: {x: 239.44, y: -3313.4, z: 5.8, h: 61.96},
        }
    },
    jobLocations: {
        loc1: {
            Spot: {x: -265.6, y: 6407.8, z: 31},
            Heading: 243.6233,
            InProgress: false,
            VanSpawned: false,
            VanDelivered: false,
            GoonsSpawned: false,
            Goons: [
                {x: -270.7, y: 6396.1, z: 30.9, h: 200.599, ped: 'g_m_y_lost_01', animDict: 'amb@world_human_cop_idles@female@base', animName: 'base', weapon: 'WEAPON_PISTOl'},
                {x: -270.36, y: 6402.16, z: 31.36, h: 246.76, ped: 'g_m_y_lost_01', animDict: 'amb@world_human_cop_idles@female@base', animName: 'base', weapon: 'WEAPON_PISTOl'},
                {x: -260.72, y: 6406.8, z: 31.36, h: 184.36, ped: 'g_m_y_lost_01', animDict: 'amb@world_human_cop_idles@female@base', animName: 'base', weapon: 'WEAPON_PISTOl'},
                {x: -274.52, y: 6410.64, z: 30.92, h: 275.84, ped: 'g_m_y_lost_01', animDict: 'amb@world_human_cop_idles@female@base', animName: 'base', weapon: 'WEAPON_PISTOl'}
            ]
        }
    }
}