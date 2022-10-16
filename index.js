const robots = {
    youtube: require('./youtube.js')
}

async function start(){
    await robots.youtube()
}

start()