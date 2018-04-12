const delay = time => new Promise(resolve => setTimeout(() => resolve(time), time))
const delayBy = time => x => new Promise(resolve => setTimeout(() => resolve(x), time))
const log = x => y => { console.log(x + ":" + JSON.stringify(y, null, 2)); return y }

const httpGet = (url, options) => {
    return new Promise((resolve, reject) => {

        const req = new XMLHttpRequest()
        req.open('GET', url)

        req.addEventListener('load', () => {
            if(req.status == 200) {
                try {
                    resolve(req.response)
                } 
                catch(e) {
                    reject(e)
                }
            } else {
                reject(Error(req.statusText))
            }
        })

        req.addEventListener('error', () => {
            reject(Error(req.statusText))
        })

        req.send()
    });
}

const getJson = (url, options) => {
    return httpGet(url, options)
            .then(res => {
                try {
                    return JSON.parse(res)
                } 
                catch(e) {
                    return Promise.reject(e)
                }
            })
}

const getXml = (url, options) => {
    return httpGet(url, options)
            .then(res => {
                try {
                    const parser = new DOMParser();
                    return parser.parseFromString(res, "text/xml");
                } 
                catch(e) {
                    return Promise.reject(e)
                }
            })
}

module.exports = {
    names:[ 'delay', 'delayBy', 'log', 'getJson', 'getXml' ],
    functions:[ delay, delayBy, log, getJson, getXml ]
};

