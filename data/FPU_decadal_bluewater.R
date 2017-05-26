library(readxl)
library(reshape2)
library(magrittr)
library(plyr)
library(jsonlite)
library(rgdal)

# Convert data from Kummu et al. 2016 https://www.nature.com/articles/srep38495
# 12.5.2017

# Data format:
#9.5.2017 lucify slack
#separate file for geometry in GeoJSON, and a separate files for each scenario. 
# Each scenario also includes historical data.

# interface Datum {
#   // independent variables
#   featureId: string | number; //FPU
#   startYear: number;
#   endYear: number;
# 
#   // dependent variables
#   blueWaterShortage: number; //Blue water availability per capita (m3/cap/year). Includes NAs where population=0
#   blueWaterStress: number; //Blue water consumption-to-availability ratio. Includes NAs where availability=0
#   blueWaterAvailability: number; // Blue water availability (m3/year)
#   blueWaterConsumptionTotal: number; // Total blue water consumption (km3/year)
#   population: number; //Average population
#   blueWaterConsumptionIrrigation: number; //Blue water consumption for irrigation (km3/year)
#   blueWaterConsumptionDomestic: number; //Blue water consumption for households and small businesses (domestic )(km3/year)
#   blueWaterConsumptionElectric: number; //Blue water consumption for thermal electricity production (km3/year)
#   blueWaterConsumptionLivestock: number; //Blue water consumption for livestock farming (km3/year)
#   blueWaterConsumptionManufacturing: number; //Blue water consumption for manufacturing industries (km3/year)
# }

# [
#   {
#     featureId: 403940,
#     startYear: 1980,
#     endYear: 1990,
#     waterUse: 48394433,
#     surfaceWaterAvailability: 3203823,
#     foodSecurityIndex: 438043,
#     someIndex: 380232,
#     anotherIndex: 849343,
#   },
#   ...a lot of more objects
#   ]




## Tabular data ----------------------------------

#Load tabular data, downloaded from supplement of https://www.nature.com/articles/srep38495
sup.sheets=excel_sheets("orig/srep38495-s2.xls")[-1]
sup=list()
for(s in sup.sheets) sup[[s]]=read_excel("orig/srep38495-s2.xls",s)

#Convert to long format
measure.variable.names=lapply(sup,names) %>% unique %>% {.[[1]][-1]}
sup.long=melt(sup,measure.vars=measure.variable.names)

#Convert to wide format with variables as columns
sup.wide=dcast(sup.long,FPU+variable~L1)

#Calculate start and end years
sup.wide$startYear <- sup.wide$variable %>% as.character %>% as.numeric() %>% round %>% {.-4}
sup.wide$endYear <- sup.wide$variable %>% as.character %>% as.numeric() %>% round %>% {.+5}

# Change names
sup.wide=rename(sup.wide,c(FPU="featureid",
               Cons_dom="blueWaterConsumptionDomestic",
               Cons_elec="blueWaterConsumptionElectric",
               Cons_irri="blueWaterConsumptionIrrigation",
               Cons_live="blueWaterConsumptionLivestock",
               Cons_man="blueWaterConsumptionManufacturing",
               Cons_total="blueWaterConsumptionTotal",
               m3_decade="blueWaterAvailability",
               Pop="population",
               Shortage="blueWaterShortage",
               Stress="blueWaterStress"
               ))

# Reorder columns
sup.wide=sup.wide[,c("featureid","startYear","endYear",
         "blueWaterShortage","blueWaterStress",
         "blueWaterAvailability","blueWaterConsumptionTotal","population",
         "blueWaterConsumptionIrrigation","blueWaterConsumptionDomestic","blueWaterConsumptionElectric",
         "blueWaterConsumptionLivestock","blueWaterConsumptionManufacturing"
         )]

# Convert to json and write to file
sup.json=toJSON(sup.wide)
cat(sup.json,file="FPU_decadal_bluewater.json")




## Boundaries --------------------------

fpu.shp=readOGR("orig/fpu_past_scarcity_smooth_v2_diss.shp",stringsAsFactors = F)
plot(fpu.shp)

#Convert filename
fpu.shp$featureid <- fpu.shp$DN %>% as.integer
fpu.shp$DN<-NULL

writeOGR(fpu.shp,"FPU.geojson","fpu","GeoJSON")
