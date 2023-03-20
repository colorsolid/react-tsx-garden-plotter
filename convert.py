import csv
import json

from random import randint


header_found = False
plant_a = None

plants_dict = {}

with open('Companion plants - Sheet1.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',')
    for row in reader:
        if header_found:
            if row[0]:
                plant_a = row[0]
                plants_dict[plant_a] = {}
                r = randint(0, 255)
                g = randint(0, 255)
                b = randint(0, 255)

                print(f'.{plant_a} {{\n\tbackground-color: rgba({r}, {g}, {b}, 0.5)\n}}')
            elif plant_a:
                plant_b = row[1]
                if row[2]:
                    compatibility = int(row[2])
                    plants_dict[plant_a][plant_b] = compatibility
        else:
            if row[0] == 'Plant A':
                header_found = True

json_str = json.dumps(plants_dict, indent=2).replace('\"', '')

with open('plants.json', 'w+') as outfile:
    outfile.write(json_str)
