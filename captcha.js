
const request = require('request-promise');


class Captcha{
    constructor(key){
        this.key = key;
        this.tasks = new Map();

        
    }

    async createTask(){
        let r = await request('https://api.capmonster.cloud/createTask', {method: 'POST', json: true,
        body: {
            
        clientKey: this.key,
        task: {
            type: 'NoCaptchaTaskProxyless',
            websiteURL: 'https://discord.com',
            websiteKey: '6Lef5iQTAAAAAKeIvIY-DeexoO3gj7ryl9rLMEnn'
        }}})

        this.tasks.set(r.taskId, null);
        return r.taskId
    }

    async getTaskResult(taskID){
        let r = await request('https://api.capmonster.cloud/getTaskResult', {
            method: 'POST',
            json: true,
            body: {
                clientKey: this.key,
                taskId: taskID
            }
        })

        console.log(r)
        if(r.status !== 'ready') return undefined;

        this.tasks.set(taskID, r.solution.text)

        return r.solution.gRecaptchaResponse;
    }

    getResult(taskID){
        return this.tasks.get(taskID);
    }


}


module.exports = {
    Captcha
}
