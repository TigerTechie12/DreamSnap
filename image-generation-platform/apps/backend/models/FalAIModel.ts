import {fal} from '@fal-ai/client'
import {BaseModel} from './BaseModel'

export class FalAIModel extends BaseModel{
    constructor(){
        super()
    }


private async generateImage(prompt:string,tensorPath:string){
    const {request_id}=await fal.queue.submit('fal-ai/flux-lora',{
  input: {
    prompt: prompt,
    loras:[{path:tensorPath,scale:1}]
  },
  
  
});
return request_id

}
private async trainModel(zipUrl:string,triggerWord:string){
    const {request_id}=await fal.queue.submit("fal-ai/flux-lora-fast-training",
        {
            input:{
                images_data_url:zipUrl
            },
            webhookUrl:`${process.env.WEBOOK_URL}/fal-ai/webhook`,
        })
        return request_id
}
}
