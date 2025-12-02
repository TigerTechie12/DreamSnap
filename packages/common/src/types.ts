import * as z from "zod"



export const TrainModel=z.object({
    name:z.string(),
age:z.number(),
gender:z.enum(["Man","Woman","Others"]),
ethinicity:z.enum(["White","Black","AsianAmerican","EastAsian","SouthEastAsian","SouthAsianMiddleEastern","Pacific","Hispanic"]),
eye_color:z.enum(["Brown","Blue","Hazel","Gray"]),
bald:z.boolean(),
images:z.array(z.string()),
imageUrl:z.string()

})
export const GenerateImage=z.object({
    prompt:z.string(),
    modelId:z.string()
})
export const GenerateImagesFromPack=z.object({
    modelId:z.string(),
    packType:z.string(),
    totalImages:z.number(),
    prompts:z.string()
})