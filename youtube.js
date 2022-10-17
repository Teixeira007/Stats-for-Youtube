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
        var playlistId, nextPageToken, prevPageToken;

        function handleAPILoaded(){
            requestWatchHistoryPlaylistId()
        }

        function requestWatchHistoryPlaylistId(){
            var request = gapi.client.youtube.channels.list({
                mine: true, 
                part: 'contentDetails'
            })
    
            request.execute(function(response){
                let playlistId = response.result.items[0].contentDetails.relatedPlaylists.watchHistory;
                retrieveListHistory(playlistId)
            })
        }

        function retrieveListHistory(playlistId, pageToken){
            $('#video-container').html('');
            var requestOptions = {
                playlistId: playlistId,
                part: 'snippet',
                maxResults: 10
            };
            if (pageToken) {
                requestOptions.pageToken = pageToken;
            }
            var request = gapi.client.youtube.playlistItems.list(requestOptions);
            request.execute(function(response) {
                nextPageToken = response.result.nextPageToken;
                var nextVis = nextPageToken ? 'visible' : 'hidden';
                $('#next-button').css('visibility', nextVis);
                prevPageToken = response.result.prevPageToken
                var prevVis = prevPageToken ? 'visible' : 'hidden';
                $('#prev-button').css('visibility', prevVis);
            
                var playlistItems = response.result.items;
                if (playlistItems) {
                  $.each(playlistItems, function(index, item) {
                    displayResult(item.snippet);
                  });
                } else {
                  $('#video-container').html('Sorry you have no uploaded videos');
                }
              });
            }
            function displayResult(videoSnippet) {
                var title = videoSnippet.title;
                var videoId = videoSnippet.resourceId.videoId;
                $('#video-container').append('<p>' + title + ' - ' + videoId + '</p>');
            }
              
              // Retrieve the next page of videos in the playlist.
              function nextPage() {
                requestVideoPlaylist(playlistId, nextPageToken);
              }
              
              // Retrieve the previous page of videos in the playlist.
              function previousPage() {
                requestVideoPlaylist(playlistId, prevPageToken);
              }
        }     
}

module.exports = robot