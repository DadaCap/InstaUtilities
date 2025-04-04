"""
Remplace simplement les emojis du fichier JSON par de l'ASCII
"""
import json
filePath = "C:/Users/Captain_Dada/My Drive/Programming etc/JavaScript/ChromeExtension/emojis.json"
with open(filePath, 'r', encoding="utf-8") as file:
    data = json.load(file)
with open(filePath, 'w') as file:
    json.dump({"emojis": data}, file, indent=4, ensure_ascii=True)