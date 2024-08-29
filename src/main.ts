import { Player, system, world } from '@minecraft/server';
import { MinecraftBlockTypes, MinecraftDimensionTypes } from 'bedrock-vanilla-data-inline';
import lang from './lang';

interface DimensionLocation {
	dimension: MinecraftDimensionTypes;
	x: number;
	y: number;
	z: number;
}

let lock = false;
world.beforeEvents.playerInteractWithBlock.subscribe((e) => {
	if (lock) return;
	lock = true;
	const { block, player } = e;
	if (player.isSneaking && block.typeId === MinecraftBlockTypes.Bed && player.getSpawnPoint()) {
		e.cancel = true;
		const count = (player.getDynamicProperty('count') as number | undefined) ?? 0;
		for (let i = 1, id = ''; i <= count; i++) {
			id = `SpawnPoint${i}`;
			if (!player.getDynamicProperty(id)) {
				player.setDynamicProperty(id, JSON.stringify({ dimension: block.dimension.id, ...block.location }));
				lang.script.set_point.send([i.toString()], undefined, player);
				return (lock = false);
			}
		}
		lang.script.full_points.send(undefined, player);
	}
	lock = false;
});

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
	if (initialSpawn) {
		if (player.getDynamicProperty('count') === undefined) {
			player.setDynamicProperty('count', 3);
		}
	} else if (!player.getSpawnPoint()) {
		const count = (player.getDynamicProperty('count') as number | undefined) ?? 0;
		for (let i = 1, id = ''; i <= count; i++) {
			id = `SpawnPoint${i}`;
			const s = player.getDynamicProperty(id) as string | undefined;
			if (s) {
				const point = JSON.parse(s) as DimensionLocation;
				const dimension = world.getDimension(point.dimension);
				if (dimension.getBlock(point)?.typeId === MinecraftBlockTypes.Bed) {
					player.teleport(point, { dimension, keepVelocity: false, checkForBlocks: false });
					lang.script.respawn.send([i.toString()], undefined, player);
					return;
				} else {
					player.setDynamicProperty(id);
				}
			}
		}
		lang.script.no_points.send(undefined, player);
	}
});

const enum ScriptEventIds {
	Clear = 'brp:clear',
	Count = 'brp:count',
	Get = 'brp:get'
}

system.afterEvents.scriptEventReceive.subscribe(
	({ sourceEntity: player, id, message }) => {
		switch (id as ScriptEventIds) {
			case ScriptEventIds.Clear:
				player?.clearDynamicProperties();
				lang.script.clear.send(undefined, player as Player);
				return;

			case ScriptEventIds.Count:
				player?.setDynamicProperty('count', parseInt(message));
				lang.script.count.send([message], undefined, player as Player);
				return;

			case ScriptEventIds.Get:
				const Default = (player as Player).getSpawnPoint();
				if (Default) {
					const loc = `${Default.x}, ${Default.y}, ${Default.z}`;
					switch (Default.dimension.id) {
						case MinecraftDimensionTypes.Overworld:
							lang.script.get_points_overload.send(['0', loc], undefined, player as Player);
							break;

						case MinecraftDimensionTypes.Nether:
							lang.script.get_points_nether.send(['0', loc], undefined, player as Player);
							break;

						case MinecraftDimensionTypes.TheEnd:
							lang.script.get_points_the_end.send(['0', loc], undefined, player as Player);
							break;
					}
				}
				for (let i = 1, id = ''; i <= ((player!.getDynamicProperty('count') as number | undefined) ?? 0); i++) {
					id = `SpawnPoint${i}`;
					const s = player?.getDynamicProperty(id) as string | undefined;
					if (s) {
						const point = JSON.parse(s) as DimensionLocation;
						const loc = `${point.x}, ${point.y}, ${point.z}`;
						switch (point.dimension) {
							case MinecraftDimensionTypes.Overworld:
								lang.script.get_points_overload.send([i.toString(), loc], undefined, player as Player);
								break;

							case MinecraftDimensionTypes.Nether:
								lang.script.get_points_nether.send([i.toString(), loc], undefined, player as Player);
								break;

							case MinecraftDimensionTypes.TheEnd:
								lang.script.get_points_the_end.send([i.toString(), loc], undefined, player as Player);
								break;
						}
					}
				}
				return;
		}
	},
	{ namespaces: ['brp'] }
);
