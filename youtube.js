const express = require('express')
const google = require('googleapis').google
const OAuth2 = google.auth.OAuth2
// const state = require('./state.js')


async function robot(){
    // const content = state.load()

    await authenticateWithOAuth()


    async function authenticateWithOAuth(){
        const webServer = await startWebServer()
        const OAuthClient = await createOAuthCliente()
        requestUserConsent(OAuthClient)
        // await waitForGoogleCallback()
        // await requestGoogleForAccessTokens()
        // await setGlobalGoogleAuthentication()
        // await stopWebServer()

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
    }
}

module.exports = robot