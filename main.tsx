import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import 'dotenv/config'
import koffi from "koffi"

import { ZVecCreateAndOpen, ZVecCollectionSchema, ZVecDataType , ZVecOpen} from "@zvec/zvec";
import { v4 as uuidv4 } from "uuid";
import { CharacterTextSplitter } from "@langchain/textsplitters";

const collection = ZVecOpen("./zvec_example");

const OPENROUTER_API_KEY=process.env.OPENROUTER_API_KEY;
const MODEL_NAME = process.env.OPENROUTER_MODEL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
//console.log(`OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY}`)
//console.log(`OPENROUTER_MODEL=${process.env.OPENROUTER_MODEL}`)

const start_str = `Welcome
Chat app Example

`;

const ITEM_DATA = [
  {id: "-1" , type: "info", title: start_str},
];

const rag_search = async function(query){
  let ret = "";
  try{
    const lib = koffi.load('./libsample.so');
    const get_embed = lib.func('char* get_embed(const char* input)');
    const chat_post = lib.func('char* chat_post(const char* input)');
    const resp = get_embed(query);
    const j1 = JSON.parse(resp)

    const results = collection.querySync({
      fieldName: "embedding",
      vector: j1,
      topk: 1,
    });
    let match = "";
    for (const resulte of results) {
      if(resulte.score > 0.6){
        //console.log("score", resulte.score);
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
    //console.log("res1=", res1);
    ret = res1

    return ret;
  }catch(e){console.log(e)}
  return ret;
}

function SearchCommandLine() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [items, setItems] = useState(ITEM_DATA);

  const handleSubmit = async (value) => {
    setSubmittedQuery(value);
    setQuery("")
    
    let targetStr = value;

    setTimeout(async () => {
      const resp = await rag_search(targetStr);
      let responseText = resp;
      let uuid = crypto.randomUUID();
      const target = items;
      target.push({id: uuid , type: "user" , title: targetStr})
      uuid = crypto.randomUUID();
      target.push({id: uuid , type: "ai" , title: responseText})

      setItems(target)
      setSubmittedQuery("");
    }, 1000);		
  };

  return (
  <Box flexDirection="column" padding={1}>
    <Box flexDirection="row">
      <Box width="80%" flexDirection="column" padding={0}>
        {items.map(item => {
          if(item.type === "user"){
            return(
              <Box key={item.id} flexDirection="column" borderStyle="round" marginBottom={0} padding={1}>
                <Text bold color="cyan">You:</Text>
                <Text>{item.title}</Text>
              </Box>
            )
          }      
          if(item.type === "ai"){
            return(
              <Box key={item.id} flexDirection="column" borderStyle="round" marginBottom={0} padding={1}>
                <Text bold color="cyan">AI:</Text>
                <Text>{item.title}</Text>
              </Box>
            )
          }      
          if(item.type === "info"){
            return(
              <Box key={item.id} height={10} flexDirection="column" borderStyle="round" padding={1}>
                <Text bold color="cyan">{item.title}</Text>
                <Text>End: Ctrl + c</Text>
              </Box>
            )
          }      
        })}
      </Box>
      <Box width="20%" flexDirection="column" padding={1}>
        <Text bold >AppName:</Text>
        <Text bold marginTop={1}>version: 0.9.1</Text>
      </Box>    
    </Box>  
    {submittedQuery ? (
    <Box marginTop={1} marginBottom={1} marginLeft={1}>
      <Text color="green" marginTop={1}>Please Wait...</Text>
    </Box>
    ):(<Box />)}
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Box marginRight={1}>
        <Text bold color="cyan">Input: </Text>
        <TextInput 
          value={query} 
          onChange={setQuery} 
          onSubmit={handleSubmit} 
        />
      </Box>
      <Box marginTop={0} flexDirection="column">
        <Text dimColor>Type your text and press Enter:</Text>
      </Box>
    </Box>

  </Box>
  );
}

const main = async function(){
  if(!OPENROUTER_API_KEY){
    console.log("OPENROUTER_API_KEY is not set.");
    return;
  }
  if(!MODEL_NAME){
    console.log("OPENROUTER_MODEL is not set.");
    return;
  }
  if(!GEMINI_API_KEY){
    console.log("GEMINI_API_KEY is not set.");
    return;
  }

  render(<SearchCommandLine />);
}
main();