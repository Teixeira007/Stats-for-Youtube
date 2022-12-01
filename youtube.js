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

    const historyJson = './histórico-de-visualização.json'

    //Cria uma lista com os nomes de todos os canais dos videos assistidos
    function generateHistoryList(historyJson){
        const history = require(historyJson)
        const names = history.youtube.map( x => x.subtitles)
        
        const namesNoUndefined = names.filter(x => x != undefined)
        const channel = namesNoUndefined.map(x => x[0].name)

        let list = []
        channel.map(x => list.push(x))

        return list;
    }   
    
    // Lista todas as ocorrencias daquele canal desde a criação da conta
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

    //Pegar todos as datas dos videos
    function getHistoryFormatTime(historyJson){
        const history = require(historyJson)

        const times = history.youtube.filter(x => x.subtitles != undefined)
        const time = times.map(x => x.time)

        return time
    }
    
    //Cria uma lista com nome e ano ordenada pelo nome
    function getViewingHistoryForTime(historyJson){
        const history = require(historyJson)

        let list = generateHistoryList(historyJson)
        let listNoOrder = []

        const time = getHistoryFormatTime(historyJson)
        const SplitTime = time.map(x => x.split("-"))
        
        const firstOfPartTime = SplitTime.map(x => x[0])

        for(var i=0; i< list.length; i++){
            var newChannerlNoOrder = new channelYoutubeNoOrder(list[i], firstOfPartTime[i])
            listNoOrder.push(newChannerlNoOrder)
        }
    
        orderName(listNoOrder)

        return listNoOrder; 
    }

    //ordena a lista dos canais pelo nome
    function orderName(listObject){
        listObject.sort(function(a,b){
            if(a.name > b.name) return -1;
            if(a.name < b.name) return 1;
            if(a.name == b.name) return 0;
        })

        return listObject
    }

    //Cria uma lista com nome e data completa ordenada pelo nome
    function getViewingHistoryWithDateComplete(historyJson){
        const history = require(historyJson)

        let list = generateHistoryList(historyJson)
        let listNoOrder = []

        const time = getHistoryFormatTime(historyJson)
        const SplitTime = time.map(x => new Date(x))
        // const SplitTimeString = SplitTime.map(x => x.toLocaleDateString())

        for(var i=0; i< list.length; i++){
            var newChannerlNoOrder = new channelYoutubeNoOrder(list[i], SplitTime[i])
            listNoOrder.push(newChannerlNoOrder)
        }

        orderName(listNoOrder)

        return listNoOrder
    }

    //retorna uma lista com os videos assistidos no ultimo mês
    function getViewingHistoryForLastMonth(listNoOrder, quantMonth){
        let list = []

        const currentData = new Date()
        
        for(var i=0; i<listNoOrder.length; i++){
            const duractionMileseconds = currentData - listNoOrder[i].time
            const durationMinutes = duractionMileseconds/60000
            const durationDays = Math.trunc(durationMinutes/1440)

            const days = quantMonth * 30
            if(durationDays <= days){
                list.push(listNoOrder[i])
            }
        }

        return list
    }

     //retorna uma lista com os videos assistidos nos ultimos dias x
     function getViewingHistoryForLastDayX(listNoOrder, daysX){
        let list = []

        const currentData = new Date()
        
        for(var i=0; i<listNoOrder.length; i++){
            const duractionMileseconds = currentData - listNoOrder[i].time
            const durationMinutes = duractionMileseconds/60000
            const durationDays = Math.trunc(durationMinutes/1440)

            if(durationDays <= daysX){
                list.push(listNoOrder[i])
            }
        }

        return list
    }

    //Contar as ocorrencias dos canais que aparecem na lista
    function countOcorrencyLastMonth(list){
        var current = null;
        var listObjetc = []
        var cnt = 0;
        for (var i = 0; i < list.length; i++) {
            if (list[i].name != current) {
                if (cnt > 0) {
                    var newChannel = new channelYoutubeAllTime(list[i-1].name, cnt)
                    listObjetc.push(newChannel)
                }
                current = list[i].name;
                cnt = 1;
            } else {
                cnt++;
            }
        }

        return listObjetc
    }


    //Cria objeto channelYoutubeOrder - (nome, ano)
    function channelYoutubeNoOrder(name, time){
        this.name = name
        this.time = time
    }


    //Conta o número de ocorrencias que cada canal teve em determinado ano
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
    
    //Cria objeto channelYoutube - (nome, número de ocorrencias, ano)
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

    //Lista os canais assistidos em determinado ano
    function selectTimeViewingHistory(listObject, timeS){
        return listObject.filter(function(obj){
            return obj.time == timeS
        })
    }
   


    //lista com os nomes e ano
    let listObjectOcorrencyTime = getViewingHistoryForTime(historyJson)

    //lista com os nomes e datas completas
    let listObjectDateComplete = getViewingHistoryWithDateComplete(historyJson)

    //Lista as ocorrencias dos canais em determinados anos
    let listGiveOcorrencyTime = getOccurrenceGivenTime(listObjectOcorrencyTime)
    let listChannelForTime = selectTimeViewingHistory(listGiveOcorrencyTime, 2016)

    //retorna uma lista com os videos assistidos nos ultimo mês X, sendo X os ultimos meses
    let listLastMonth = getViewingHistoryForLastMonth(listObjectDateComplete, 1)
    let listGiveOcorrencyLastMonth = countOcorrencyLastMonth(listLastMonth)

    //retorna uma lista com os videos assistidos nos ultimo dias X, sendo X os ultimos dias
    let listLastDaysX = getViewingHistoryForLastDayX(listObjectDateComplete, 10)
    let listGiveOcorrencyLastDayX = countOcorrencyLastMonth(listLastDaysX)

    let historyComplete = getViewingHistoryAllTime(historyJson)
    

    // console.log(historyComplete);
    console.log(topXOcorrency(historyComplete, 10)) 
    


    // function teste(historyJson){
    //     const history = require(historyJson)

    //     const names = history.youtube.map( x => x.subtitles)
        
    //     const namesNoUndefined = names.filter(x => x != undefined)
    //     const channel = namesNoUndefined.map(x => x[0].name)

    //     let list = []
    //     channel.map(x => list.push(x))

    //     // const times = history.youtube.filter(x => x.subtitles != undefined)
    //     const time = times.youtube.map(x => x.time)

    //     const SplitTime = time.map(x => x.split("-"))
    //     const firstOfPartTime = SplitTime.map(x => x[0])
        
    //     let cont = 0;
    //     for(var i=0; i<firstOfPartTime.length; i++){
    //         if(firstOfPartTime[i] == 2016){
    //             cont++
    //         }
    //     }
    //     // console.log(firstOfPartTime.length, list.length);
    //     // console.log(list);
    // }

    // teste(historyJson1)
}

module.exports = robot