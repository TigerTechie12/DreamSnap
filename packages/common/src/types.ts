import * as z from "zod"



export const TrainModel=z.object({
    name:z.string(),
age:z.number(),
gender:z.enum(["Man","Woman","Others"]),
ethinicity:z.enum(["White","Black","AsianAmerican","EastAsian","SouthEastAsian","SouthAsianMiddleEastern","Pacific","Hispanic"]),
eye_color:z.enum(["Brown","Blue","Hazel","Gray"]),
bald:z.boolean(),
images:z.array(z.string()),
userId:z.string(),
imageUrl:z.array(z.string())

})
export type TrainModel=z.infer<typeof TrainModel>
export const GenerateImage=z.object({
    prompt:z.string(),
    userId:z.string(),
    name:z.string(),
    modelId:z.string()
})
export type GenerateImage=z.infer<typeof GenerateImage>
export const GenerateImagesFromPack=z.object({
    modelId:z.string(),
    packType:z.string(),
    userId:z.string(),
    totalImages:z.number(),
    prompts:z.array(z.string())
})
export type GenerateImagesFromPack=z.infer<typeof GenerateImagesFromPack>