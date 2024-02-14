import { addRxPlugin, createRxDatabase } from "rxdb"
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode"
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie"

addRxPlugin(RxDBDevModePlugin)

export const initialize = async () => {
  const db = await createRxDatabase({
    name: 'mydb',
    storage: getRxStorageDexie(),
  })

  const collection = await db.addCollections({
    characters: {
      schema: {
        title: 'characters',
        version: 0,
        type: 'object',
        primaryKey: 'id',
        properties: {
          id: {
            type: 'string',
            maxLength: 100,
          },
          name: {
            type: 'string',
          },
        },
      },
    },
  });

  return db;
};
