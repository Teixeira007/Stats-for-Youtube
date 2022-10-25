const express = require('express')
const google = require('googleapis').google
const youtube = google.youtube({ version: 'v3' })
const OAuth2 = google.auth.OAuth2
const fs = require('fs')
const { request } = require('http')
// const state = require('./state.js')


async function robot(){
    // const content = state.load()

    // await authenticateWithOAuth()
    

    // INICIO DA AUTENTICAÇÃO OAUTH2

    // async function authenticateWithOAuth(){
    //     const webServer = await startWebServer()
    //     const OAuthClient = await createOAuthCliente()
    //     requestUserConsent(OAuthClient)
    //     const authorizationToken = await waitForGoogleCallback(webServer)
    //     await requestGoogleForAccessTokens(OAuthClient, authorizationToken)
    //     await setGlobalGoogleAuthentication(OAuthClient)
    //     await stopWebServer(webServer)

    //     async function startWebServer(){
    //         return new Promise((resolve, reject) => {
    //             const port = 5000
    //             const app = express()

    //             const server = app.listen(port, () => {
    //                 console.log(`> Listening on http://localhost:${port}`)

    //                 resolve({
    //                     app,
    //                     server
    //                 })
    //             })
    //         })
    //     }

    //     async function createOAuthCliente(){
    //         const credentials = require('./credenciais/client_secret_71860673882-fbidnfpj8je6f4ve0e1b7jfdbg3u88gu.apps.googleusercontent.com.json')

    //         const OAuthClient = new OAuth2(
    //             credentials.web.client_id,
    //             credentials.web.client_secret,
    //             credentials.web.redirect_uris[0]
    //         )

    //         return OAuthClient
    //     }

    //     function requestUserConsent(OAuthClient){
    //         const consentUrl = OAuthClient.generateAuthUrl({
    //             access_type: 'offline',
    //             scope: ['https://www.googleapis.com/auth/youtube']
    //         })

    //         console.log(`> Please give your consent: ${consentUrl}`)
    //     }

    //     async function waitForGoogleCallback(webServer){
    //         return new Promise((resolve, reject) => {
    //             console.log(`> Waiting for use consent...`)

    //             webServer.app.get('/oauth2callback', (req, res) => {
    //                 const authCode = req.query.code 
    //                 console.log(`> Consent given: ${authCode}`)

    //                 res.send('<h1>Thank you!</h1><p>Now close this tab.</p>')
    //                 resolve(authCode)
    //             })
    //         })
    //     }

    //     async function requestGoogleForAccessTokens(OAuthClient, authorizationToken){
    //         return new Promise((resolve, reject) => {
    //             OAuthClient.getToken(authorizationToken, (error, tokens) => {
    //                 if (error){
    //                     return reject(error)
    //                 }

    //                 console.log('> Access tokens received:')
    //                 console.log(tokens);

    //                 OAuthClient.setCredentials(tokens)
    //                 resolve()
    //             })
    //         })
    //     }

    //     function setGlobalGoogleAuthentication(OAuthClient){
    //         google.options({
    //             auth: OAuthClient
    //         })
    //     }

    //     async function stopWebServer(webServer){
    //         return new Promise((resolve, reject) => {
    //             webServer.server.close(() => {
    //                 resolve()
    //             })
    //         })
    //     }
    // }

    //FIM DA AUTENTICAÇÃO OAUTH2

    function generateHistoryList(historyJson){
        const history = require(historyJson)
        const names = history.youtube.map( x => x.subtitles)
        
        const namesNoUndefined = names.filter(x => x != undefined)
        const channel = namesNoUndefined.map(x => x[0].name)

        let list = []
        channel.map(x => list.push(x))

        return list;
    }   
    
    function getViewingHistoryAllTime(historyJson){
        const list = generateHistoryList(historyJson)
        list.sort()

        // Conta quantas vezes o titulo do canal apareceu
        var current = null;
        var listObjetc = []
        var cnt = 0;
        for (var i = 0; i < list.length; i++) {
            if (list[i] != current) {
                if (cnt > 0) {
                    var newChannel = new channelYoutubeAllTime(list[i-1], cnt)
                    listObjetc.push(newChannel)
                }
                current = list[i];
                cnt = 1;
            } else {
                cnt++;
            }
        }

        return listObjetc
    }

    //função para criar um objeto com o titulo do canal e o númeron de ocorrencia
    function channelYoutubeAllTime(name, ocorrency){
        this.name = name,
        this.ocorrency = ocorrency
    }

    


    function getViewingHistoryForTime(historyJson){
        const history = require(historyJson)

        let list = generateHistoryList(historyJson)
        let listNoOrder = []

        const time = history.youtube.map(x => x.time)
        const SplitTime = time.map(x => x.split("-"))
        const firstOfPartTime = SplitTime.map(x => x[0])

        for(var i=0; i< list.length; i++){
            var newChannerlNoOrder = new channelYoutubeNoOrder(list[i], firstOfPartTime[i])
            listNoOrder.push(newChannerlNoOrder)
        }
    
        orderName(listNoOrder)
    
        function orderName(listObject){
            listObject.sort(function(a,b){
                if(a.name > b.name) return -1;
                if(a.name < b.name) return 1;
                if(a.name == b.name) return 0;
            })
    
            return listObject
        }

        return listNoOrder; 
    }

    function channelYoutubeNoOrder(name, time){
        this.name = name
        this.time = time
    }

    const historyJson1 = './histórico-de-visualização.json'
    // console.log(getViewingHistoryAllTime(historyJson1));
    // console.log(getViewingHistoryForTime(historyJson1));
    // getViewingHistoryForTime(historyJson1)


    function getOccurrenceGivenTime(listNoOrder){
        var current = null;
        var listObjetc = []
        var cnt = 0;
        for (var i = 0; i < listNoOrder.length; i++) {
            if(current == null){
                current = listNoOrder[i]
                cnt = 1;
            }
            if((listNoOrder[i].name == current.name) & (listNoOrder[i].time == current.time)){
                cnt++;
            }else{
                if(cnt > 0){
                    var newChannel = new channelYoutube(listNoOrder[i-1].name, cnt, listNoOrder[i-1].time)
                    listObjetc.push(newChannel)
                }
                current = listNoOrder[i]
                cnt = 1;
            }
        }
        return listObjetc; 
    } 
    
    function channelYoutube(name, ocorrency, time){
        this.name = name,
        this.ocorrency = ocorrency
        this.time = time
    }

    // Filtrar canais com mais de 100 ocorrencias
    function overOcorrency100(listObjetc){
        return listObjetc.filter(function(obj){
            return obj.ocorrency > 100
        })
    }

    //Ordena pelo canal com mais ocorrencias
    function orderOcorrency(listObject){
        listObject.sort(function(a,b){
            if(a.ocorrency > b.ocorrency) return -1;
            if(a.ocorrency < b.ocorrency) return 1;
            if(a.ocorrency == b.ocorrency) return 0;
        })

        return listObject
    }



    //Pega o TopX de canais com maior ocorrencia
    function topXOcorrency(listObject, x){
        var topX = [];
        orderOcorrency(listObject)
        for(var i=0; i<x; i++){
            topX.push(listObject[i])
        }

        return topX;
    }
   

    const historyJson = './histórico-de-visualização.json'
    // let listObjectOcorrency = getViewingHistoryAllTime(historyJson)
    // console.log(listObjectOcorrency)

    let listObjectOcorrencyTime = getViewingHistoryForTime(historyJson)
    let listGiveOcorrencyTime = getOccurrenceGivenTime(listObjectOcorrencyTime)
    // console.log(getOccurrenceGivenTime(listObjectOcorrencyTime))
    // console.log(listObjectOcorrencyTime);
    // getViewingHistoryForTime(historyJson)
    console.log(topXOcorrency(listGiveOcorrencyTime, 10))  
}

module.exports = robot