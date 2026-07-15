import { readFileSync, readdirSync } from "fs";
import { ZVecCreateAndOpen, ZVecCollectionSchema, ZVecDataType , ZVecOpen} from "@zvec/zvec";
import { v4 as uuidv4 } from "uuid";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import koffi from "koffi"

const collection = ZVecOpen("./zvec_example");

const main = async function(){
    let query = "";
    if(!process.argv){
      return;
    }
    if(!process.argv[2]){
      console.log("error, argment query none")
      return;
    }
    query = process.argv[2]
    console.log("query=" , query); 
    const lib = koffi.load('./libsample.so');
    const get_embed = lib.func('char* get_embed(const char* input)');
    const chat_post = lib.func('char* chat_post(const char* input)');
    const resp = get_embed(query);
    const j1 = JSON.parse(resp)
    //console.log("len=" ,j1.length); 

    const results = collection.querySync({
      fieldName: "embedding",
      vector: j1,
      topk: 1,
    });
    let match = "";
    for (const resulte of results) {
      if(resulte.score > 0.6){
        console.log("score", resulte.score);
        match += resulte.fields.content;
      }
    }
    let out_str = "日本語で、回答して欲しい。 \n要約して欲しい。\n\n";
    if(!match){
      out_str += "user query: " + query;
      out_str += " \n";
    }else{
      out_str += "context: \n";
      out_str += match;
      out_str += "\n user query: "+ query;
      out_str += " \n";
    }
    const res1 = chat_post(out_str)
    console.log("res1=", res1);
}
main();
