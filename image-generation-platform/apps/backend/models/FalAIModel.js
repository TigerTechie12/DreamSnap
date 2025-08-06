"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FalAIModel = void 0;
const client_1 = require("@fal-ai/client");
const BaseModel_1 = require("./BaseModel");
class FalAIModel extends BaseModel_1.BaseModel {
    constructor() {
        super();
    }
    generateImage(prompt, tensorPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const { request_id } = yield client_1.fal.queue.submit('fal-ai/flux-lora', {
                input: {
                    prompt: prompt,
                    loras: [{ path: tensorPath, scale: 1 }]
                },
                webhookUrl: `${process.env.WEBHOOK_URL}/fal-ai/webhook/image`,
            });
            return request_id;
        });
    }
    trainModel(zipUrl, triggerWord) {
        return __awaiter(this, void 0, void 0, function* () {
            const { request_id } = yield client_1.fal.queue.submit("fal-ai/flux-lora-fast-training", {
                input: {
                    images_data_url: zipUrl,
                    trigger_word: triggerWord
                },
                webhookUrl: `${process.env.WEBHOOK_URL}/fal-ai/webhook/train`,
            });
            return request_id;
        });
    }
}
exports.FalAIModel = FalAIModel;
