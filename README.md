# node_tui_rag_14

 Version: 0.9.1

 Author  :

 date    : 2026/07/15
 
 update :

***

node.js C++ , RAG Zvec + TUI OpenRouter

* Zvec vector database
* OpenRouter
* node 22
* C/C++
* LLVM CLang
* embedding : Gemini-embedding-001
* make
* Linux

***
## Image

* RAG APP

![img1](/images/node_tui_rag_14.png)

***
### related

https://openrouter.ai/

https://github.com/alibaba/zvec

***
### setup

* .env

```
OPENROUTER_API_KEY=
OPENROUTER_MODEL=deepseek/deepseek-v4-flash
GEMINI_API_KEY=
```

* LIB add
```
sudo apt install uuid-dev
sudo apt install nlohmann-json3-dev
sudo apt install libcurl4-openssl-dev
```
***
* C++ build
```
make all
```

* npm add
```
npm i
```

***
* use
* init
```
npx tsx init
```

* embed: ./data folder import (txt)

```
npx tsx embed
```

* TUI app start
```
npm run start
```


***