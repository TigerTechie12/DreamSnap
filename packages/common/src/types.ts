import * as z from "zod"



export const TrainModel=z.object({
    name:z.string(),
age:z.number(),
type:z.enum(["Man","Women","Other"]),
ethinicty:z.enum(["White","Black","Asian American","East Asian","South East Asian","South Asian","Middle Eastern","Pacific","Hispanic"]),
eye_color:z.enum(["Brown","Blue","Hazel","Gray"]),
bald:z.boolean(),
images:z.array(z.string())

})
export const GenerateImage=z.object({
    prompt:z.string(),
    modelId:z.string()
})
export const GenerateImagesFromPack=z.object({
    modelId:z.string(),
    packId:z.string()
})