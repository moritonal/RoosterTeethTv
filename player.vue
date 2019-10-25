
<template>
    <div class="container-fluid p-3">
        <div class="row">
            <div class="embed-responsive embed-responsive-16by9">
                <video ref="videoPlayer" class="embed-responsive-item video-js vjs-default-skin vjs-big-play-centered" controls preload="auto" data-setup='{}'>
                    <p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video</p>
                </video>
            </div>
        </div>
    </div>
</template>>

<script lang="ts">

    import Vue from "vue";
    import videojs from "video.js"
    import "video.js/dist/video-js.min.css"
    import extend from "extend"
    import * as hotkeys from "videojs-hotkeys"

    export default Vue.extend({
        data() {
            return {
                token: null,
                player: null
            };
        },
        methods: {
            async login() {
                
                let token = localStorage.getItem("roosterteeth");

                if (token == null) {

                    token = await (await fetch("https://red.bonner.is/roosterteeth/oauth/token", {
                        method: "POST",
                        body: JSON.stringify({
                            "client_id": process.env.CLIENT_ID,
                            "grant_type": "password",
                            "password": process.env.PASSWORD,
                            "scope": "user public",
                            "username": process.env.USERNAME
                        })
                    })).json();

                    localStorage.setItem("roosterteeth", JSON.stringify(token));

                    return token;
                } else {
                    return JSON.parse(token);
                }
            },
            async fetch(url : string, args) {

                args = extend(true, args, {
                    headers: {
                        Authorization: "Bearer " + this.token
                    }
                });

                return await (await fetch(url, args)).json();
            },
            async playVideo(slug) {

                this.token = (await this.login()).access_token;

                console.log("Token", this.token);

                let vidLink = await this.fetch(`https://red.bonner.is/roosterteeth/api/v1/watch/${slug}/videos`);

                let url = vidLink.data[0].attributes.url;

                console.log(vidLink.data[0]);

                let contentUUID = vidLink.data[0].attributes.content_uuid;

                console.log(contentUUID);

                let position = (await this.fetch(`https://wtc.roosterteeth.com/api/v1/my/played_positions/${contentUUID}`));

                console.log(`Last position:`, position);

                this.player = videojs(this.$refs.videoPlayer, {
                    autoplay: true,
                    controls: true
                }, () => {

                    try {
                        console.log("Ready!");

                        if (this.player == null)
                            return;

                        if (vidLink.data[0].attributes.media_type == "manifest") {

                            this.player.src({
                                type: 'application/x-mpegURL',
                                src: url
                            });

                            this.player.ready(() => {

                                this.player.setInterval(async () => {

                                    if (!this.player.paused()) {

                                        let currentTime = this.player.currentTime();

                                        console.log(currentTime);

                                        let totalTime = this.player.currentTime() + this.player.remainingTime();

                                        let percentage = Math.round((currentTime/totalTime) * 100);

                                        let v = Math.round(currentTime);

                                        console.log(v);

                                        await this.fetch("https://wtc.roosterteeth.com/api/v1/my/played_positions", {
                                            body: JSON.stringify({
                                                "item_id": contentUUID,
                                                "percentage": percentage,
                                                "time": v
                                            }),
                                            headers: {
                                                "Client-Id": "0.649921361353692",
                                                "Client-Type": "web",
                                                "Content-Type": "application/json"
                                            },
                                            method: "POST"
                                        });

                                        console.log("post");
                                    }
                                    console.log("skip");

                                }, 5000);
                            });
                        }

                        console.log(this.player);

                        this.player.currentTime(position.value);
                    }
                    catch (err) {
                        console.warn("Cap", err);
                    }
                });
            }
        },
        async mounted() {

            console.log("Slug: ", this.$route.params.slug);

            console.log(this);
            await this.playVideo(this.$route.params.slug)
        },
        beforeDestroy() {
            
            if (this.player != null) {
                this.player.dispose();
                this.player = null;
            }
        }
    });

</script>

<style lang="scss">

    $body-bg: #1d1d1d;
    $body-color: #e0e0e0;

    @import 'node_modules/bootstrap/scss/bootstrap';
    @import 'node_modules/bootstrap-vue/src/index.scss';

    .card {
        background-color: transparent
    }
    .container {
        color: green;
    }
</style>