const express = require('express')
const google = require('googleapis').google
const youtube = google.youtube({ version: 'v3' })
const OAuth2 = google.auth.OAuth2
const fs = require('fs')
const { request } = require('http')
// const state = require('./state.js')


async function robot(){
    // const content = state.load()

    await authenticateWithOAuth()
    const listHistory = await getViewingHistory()


    async function authenticateWithOAuth(){
        const webServer = await startWebServer()
        const OAuthClient = await createOAuthCliente()
        requestUserConsent(OAuthClient)
        const authorizationToken = await waitForGoogleCallback(webServer)
        await requestGoogleForAccessTokens(OAuthClient, authorizationToken)
        await setGlobalGoogleAuthentication(OAuthClient)
        await stopWebServer(webServer)

        async function startWebServer(){
            return new Promise((resolve, reject) => {
                const port = 5000
                const app = express()

                const server = app.listen(port, () => {
                    console.log(`> Listening on http://localhost:${port}`)

                    resolve({
                        app,
                        server
                    })
                })
            })
        }

        async function createOAuthCliente(){
            const credentials = require('./credenciais/client_secret_71860673882-fbidnfpj8je6f4ve0e1b7jfdbg3u88gu.apps.googleusercontent.com.json')

            const OAuthClient = new OAuth2(
                credentials.web.client_id,
                credentials.web.client_secret,
                credentials.web.redirect_uris[0]
            )

            return OAuthClient
        }

        function requestUserConsent(OAuthClient){
            const consentUrl = OAuthClient.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube']
            })

            console.log(`> Please give your consent: ${consentUrl}`)
        }

        async function waitForGoogleCallback(webServer){
            return new Promise((resolve, reject) => {
                console.log(`> Waiting for use consent...`)

                webServer.app.get('/oauth2callback', (req, res) => {
                    const authCode = req.query.code 
                    console.log(`> Consent given: ${authCode}`)

                    res.send('<h1>Thank you!</h1><p>Now close this tab.</p>')
                    resolve(authCode)
                })
            })
        }

        async function requestGoogleForAccessTokens(OAuthClient, authorizationToken){
            return new Promise((resolve, reject) => {
                OAuthClient.getToken(authorizationToken, (error, tokens) => {
                    if (error){
                        return reject(error)
                    }

                    console.log('> Access tokens received:')
                    console.log(tokens);

                    OAuthClient.setCredentials(tokens)
                    resolve()
                })
            })
        }

        function setGlobalGoogleAuthentication(OAuthClient){
            google.options({
                auth: OAuthClient
            })
        }

        async function stopWebServer(webServer){
            return new Promise((resolve, reject) => {
                webServer.server.close(() => {
                    resolve()
                })
            })
        }
    }

    async function getViewingHistory(){
       
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
    
}

module.exports = robot