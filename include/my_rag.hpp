#pragma once
#include <cstdlib>
#include <iostream>
#include <fstream>
#include <filesystem>
#include <vector>
#include <string>
#include <sstream>
#include <stdexcept>
#include <map>
#include <curl/curl.h>
#include <nlohmann/json.hpp>

#include "GeminiEmbeddingClient.hpp"
#include "my_config.hpp"
#include "openrouter_client.hpp"

using json = nlohmann::json;

const std::string DB_PATH = "example.db";
const std::string DATA_PATH = "./data";

// 1ファイル分のデータを保持する構造体
struct TextFile {
    std::string filename;
    std::vector<std::string> lines;
};

// .txt ファイルを読み込んで行を返す
TextFile loadTextFile(const std::filesystem::path& filepath) {
    TextFile tf;
    tf.filename = filepath.filename().string();

    std::ifstream ifs(filepath);
    if (!ifs.is_open()) {
        std::cerr << "[警告] ファイルを開けません: " << filepath << "\n";
        return tf;
    }

    std::string line;
    while (std::getline(ifs, line)) {
        tf.lines.push_back(line);
    }
    return tf;
}

class MyRag {
private:
    std::string m_name;

    public:
    explicit MyRag(std::string str){}

    ~MyRag() {}


    std::string get_embed(std::string query){
        std::string ret = "";
        try{
            const char* api_key = std::getenv("GEMINI_API_KEY");
            if (api_key != nullptr) {
            }else{
                std::cerr << "Error: GEMINI_API_KEY environment variable not set" << std::endl;
                return ret;
            }      
            auto embeddings = EmbeddingStart(query);
            //std::cout << "vlen=" << embeddings.size() << std::endl;
            std::string out = "";
            for (size_t i = 0; i < embeddings.size(); ++i) {
                std::string s = std::to_string(embeddings[i]); 
                if(i > 0){
                    out += "," + s;
                    //std::cout << "," << s;
                }else{
                    out = "[" + s;
                    //std::cout << s;
                }
            }
            ret = out + "]";
            return ret;
        }  catch (const std::exception& e) {
            std::cout << "Error , get_embed" << std::endl;
        }  
        return ret;

    }

    std::string chat_post(std::string query){
        std::string ret = "";
        try{
            const char* api_key = std::getenv("OPENROUTER_API_KEY");
            if (api_key != nullptr) {
            }else{
                std::cerr << "Error: OPENROUTER_API_KEY environment variable not set" << std::endl;
                std::cerr << "Please set it with: export OPENROUTER_API_KEY=your_api_key_here" << std::endl;
                return ret;
            }      
            const char* model_name = std::getenv("OPENROUTER_MODEL");
            if (!model_name) {
                std::cerr << "Error: OPENROUTER_MODEL environment variable not set" << std::endl;
                return ret;
            }      
            OpenRouterClient client(api_key);
            auto response = client.sendChatCompletion(
                model_name,
                query,
                1.0,
                10000
            );

            if (response.has_value()) {
                //std::cout << "Response: " << response.value() << std::endl;
                auto outStr = response.value();
                ret = outStr;
                return ret;
            } else {
                std::cerr << "Failed to get response from API" << std::endl;
                return ret;
            }            
            return ret;
        } catch (const std::exception& e) {
            std::cout << "Error , main" << std::endl;
        }  
        return ret;
    }

};
