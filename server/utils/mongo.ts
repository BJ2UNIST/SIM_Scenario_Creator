import mongoose from "mongoose";

type Collection = mongoose.mongo.Collection;

const collectionExists = async (collectionName: string) => {
  const collections = await mongoose.connection?.db
    ?.listCollections()
    .toArray();
  return collections?.some((collection) => collection.name === collectionName);
};

async function insertBulk(collection: Collection, features: any) {
  // try {
  //   if (await collectionExists(collection.collectionName)) {
  //     await collection.drop();
  //   }
  //   console.log("drop existing collection");
  // } catch (err) {
  //   console.log(err);
  // }
  const bulkOperation = collection.initializeOrderedBulkOp();
  features.forEach(bulkOperation.insert.bind(bulkOperation));
  const bulkWriteResult = await bulkOperation.execute();
  await collection.createIndex(
    {
      mapId: 1,
      projectId: 1,
      envId: 1,
      id: 1,
      geometry: "2dsphere",
    },
    { unique: true }
  );
  return bulkWriteResult;
}

export { insertBulk };
