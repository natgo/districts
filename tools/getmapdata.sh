#!/bin/sh
wget -O kaupunginosat.json "https://kartta.hel.fi/ws/geoserver/avoindata/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=avoindata:Kaupunginosajako&SRSNAME=urn:x-ogc:def:crs:EPSG:4326&OUTPUTFORMAT=json"
wget -O suurpiirit.json "https://kartta.hel.fi/ws/geoserver/avoindata/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=avoindata:Piirijako_suurpiiri&SRSNAME=urn:x-ogc:def:crs:EPSG:4326&OUTPUTFORMAT=json"
wget -O osaalueet.json "https://kartta.hel.fi/ws/geoserver/avoindata/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=avoindata:Piirijako_osaalue&SRSNAME=urn:x-ogc:def:crs:EPSG:4326&OUTPUTFORMAT=json"
wget -O peruspiirit.json "https://kartta.hel.fi/ws/geoserver/avoindata/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=avoindata:Piirijako_peruspiiri&SRSNAME=urn:x-ogc:def:crs:EPSG:4326&OUTPUTFORMAT=json"
wget -O pienalueet.json "https://kartta.hel.fi/ws/geoserver/avoindata/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=avoindata:Piirijako_pienalue&SRSNAME=urn:x-ogc:def:crs:EPSG:4326&OUTPUTFORMAT=json"
wget -O postinumerot.json "https://kartta.hel.fi/ws/geoserver/avoindata/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=avoindata:Postinumeroalue&SRSNAME=urn:x-ogc:def:crs:EPSG:4326&OUTPUTFORMAT=json"

pnpm prettier -w tools/
