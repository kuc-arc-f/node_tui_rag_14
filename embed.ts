import { readFileSync, readdirSync } from "fs";
import { ZVecCreateAndOpen, ZVecCollectionSchema, ZVecDataType , ZVecOpen} from "@zvec/zvec";
import { v4 as uuidv4 } from "uuid";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import koffi from "koffi"

let data = [];
const DATA_PATH = "./data"

async function add_db(collection, vec , content) {
  const uuid = crypto.randomUUID();
  console.log("id=", uuid); 
  collection.insertSync([
    { id: uuid, vectors: { embedding: vec } , fields: {content : content}},
  ]);
}

async function Embed(collection, content) 
{
  const chunkSizeMax = 1000; 
  const lib = koffi.load('./libsample.so');
  const textSplitter = new CharacterTextSplitter({
    chunkSize: chunkSizeMax,
    chunkOverlap: 0,
  });
  const texts = await textSplitter.splitText(content);
  //console.log("len=", texts.length)
  for (let i = 0; i < texts.length; i++) {
    try{
      let target = texts[i];
      console.log("i=", i)
      console.log(target)
      const get_embed = lib.func('char* get_embed(const char* input)');
      const resp = get_embed(target);
      const vec = JSON.parse(resp)
      console.log("len=" , vec.length);
      await add_db(collection, vec , content);
    }catch(e){console.log(e)}
  }
  return;
}

const main = async () => {
  try{
    const collection = ZVecOpen("./zvec_example");
    const files = readdirSync(DATA_PATH);
    for (const f of files) {
      const content = readFileSync(`${DATA_PATH}/${f}`, "utf-8");
      //console.log(content)
      Embed(collection, content);
    }    
  }catch(e){console.log(e)}
}
main();
