import requests
import json

def createStateDistrictJSON():
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36', "Accept-Language": "en-US,en;"}
    stateResponse = requests.get('https://cdn-api.co-vin.in/api/v2/admin/location/states', headers = headers)

    data = {}
    districtData = {}
    stateData = {}
    URL = 'https://cdn-api.co-vin.in/api/v2/admin/location/districts/'
    for val in stateResponse.json()['states']:
        stateName = val['state_name']
        stateId = val['state_id']
        stateData[stateName] = stateId
        districtResponse = requests.get(URL+str(stateId), headers = headers)
        data[stateId] = districtResponse.json()['districts']
        for district in districtResponse.json()['districts']:
            districtName = district['district_name']
            districtId = district['district_id']
            districtData[districtName] = districtId
    # print(data)
    # print(districtData)
    with open("state-district.json", "w") as outfile: 
        json.dump(data, outfile)

    with open("state-data.json", "w") as outfile: 
        json.dump(stateData, outfile)

    with open("district-data.json", "w") as outfile: 
        json.dump(districtData, outfile)

createStateDistrictJSON()