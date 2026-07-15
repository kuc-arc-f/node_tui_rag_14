import { ZVecCreateAndOpen, ZVecCollectionSchema, ZVecDataType } from "@zvec/zvec";

const DIM_SIZE = 3072;

const schema = new ZVecCollectionSchema({
  name: "example",
  fields: [
    {name: "content", dataType: ZVecDataType.STRING}
  ],
  vectors: { name: "embedding", dataType: ZVecDataType.VECTOR_FP32, dimension: DIM_SIZE },
});

// Create collection
const collection = ZVecCreateAndOpen("./zvec_example", schema);
  