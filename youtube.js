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
    // const listHistory = await getViewingHistory()

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
    // const history = require('./histórico-de-visualização.json')
    async function getViewingHistory(){

        //pega o arquivo json
        const history = require('./histórico-de-visualização.json')
        
        //pega os subtitulos do canal - titulo e url
        const names = history.youtube.map( x => x.subtitles)

        //filtra os arquivos undefined
        const namesNoUndefined = names.filter(x => x != undefined)
        
        //pega apenas o nome dos canais
        const channel = namesNoUndefined.map(x => x[0].name)

        //adiciona os titulos dos canais em uma lista e ordena
        let list = []
        channel.map(x => list.push(x))
        list.sort()
        
        //função para criar um objeto com o titulo do canal e o númeron de ocorrencia
        function channelYoutube(name, ocorrency){
            this.name = name,
            this.ocorrency = ocorrency
        }

        // Conta quantas vezes o titulo do canal apareceu
        var current = null;
        var cnt = 0;
        for (var i = 0; i < list.length; i++) {
            if (list[i] != current) {
                if (cnt > 0) {
                    var newChannel = new channelYoutube(list[i-1], cnt)
                    console.log(newChannel)
                }
                current = list[i];
                cnt = 1;
            } else {
                cnt++;
            }
        }

        // function execute() {
        //     return youtube.channels.list({
        //         mine: true, 
        //         part: 'contentDetails'
        //     })
        //         .then(function(response) {
        //                 // Handle the results here (response.result has the parsed body).
                        
        //                 let id = response.data.items[0].contentDetails.relatedPlaylists.watchHistory;
        //                 var requestOptions = {
        //                             playlistId: id,
        //                             part: 'snippet',
        //                             maxResults: 10
        //                         };
                               
        //                         // var request = youtube.playlistItems.list(requestOptions);
        //                         console.log(id)
        //               },
        //               function(err) { console.error("Execute error", err); });
        // }
        // execute()
        
    
    }    
    getViewingHistory()
}

module.exports = robot