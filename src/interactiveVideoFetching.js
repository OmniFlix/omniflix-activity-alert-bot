let request = require("request")
var cron = require('node-cron');
const dotenv = require('dotenv').config()
const { interactiveVideoData } = require("../models/interactive_video.model");

let interactiveVideoFetching = async () => {
    await interactiveVideoData.find({}, {}, {
        sort: {
            created_at: 'desc'
        },
        limit: 10
    }, async (error, result) => {
        if (error) {
            console.log(error)
        } else if (result) {
            let url = `${process.env.STUDIO_API_URL}/tv/interactive-videos?sortBy=created_at&order=desc&limit=1000`
            
            let options = { json: true };  
            request(url, options, async (error, res, body) => {
                if (error) {
                    return console.log(error)
                } else if (!error && res.statusCode == 200) {
                    let interactiveVideos = body.result.list
                    interactiveVideos.forEach(interactiveVideo => {
                        interactiveVideoData.findOne({
                            "_id":interactiveVideo._id
                        }, async (error, result) => {
                            if (error) {
                                console.log(error)
                            } else if (result) {      
                            } else {
                                interactiveVideo.isNotified=false
                                let interactiveVideoD = new interactiveVideoData(interactiveVideo)
                                interactiveVideoD.save()

                            }
                        })
                    })
                }
            })
        }
    });
};

let interactiveVideoFetch = cron.schedule('*/30 * * * * *', interactiveVideoFetching)

interactiveVideoFetch.start()


module.exports = {
    interactiveVideoFetch
}