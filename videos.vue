
<template>
    <div>
        <div class="container-fluid p-3">
            <div v-if="videos != null" class="row">
                <div v-for="item in videos" v-bind:key="item.uuid" class="col-3">
                    <router-link :to="{ name: 'player', params: { slug: item.attributes.slug }}">
                        <div class="card">
                            <img class="card-img-top" v-bind:src="item.included.images[0].attributes.small" />
                            <div class="card-body">
                                <p>{{item.attributes.title}}</p>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>

        <infinite-loading @infinite="infiniteHandler"></infinite-loading>
    </div>
</template>>

<script lang="ts">

    import Vue from "vue";
    import videojs from "video.js"
    import "video.js/dist/video-js.min.css"
    import extend from "extend"
    import InfiniteLoading from 'vue-infinite-loading';

    export default Vue.extend({
        components: {
            InfiniteLoading,
        },
        data() {
            return {
                bundler: "Parcel",
                page: 1,
                token: null,
                videos: []
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
            async fetchVideos(page : number = 1) {

                this.token = (await this.login()).access_token;

                let episodes = null;//localStorage.getItem("roosterteeth_videos");

                if (episodes == null) {

                    let eps = (await this.fetch(`https://red.bonner.is/roosterteeth/api/v1/episodes?per_page=24&channel_id=achievement-hunter&order=desc&page=${page}`)).data

                    let slug = eps.filter(
                            i=>i.attributes.show_title != "AHWU" && 
                            i.attributes.show_title != "Off Topic"
                        );

                    //localStorage.setItem("roosterteeth_videos", JSON.stringify(eps));

                    console.log(eps);

                    return eps;
                } else {
                    return JSON.parse(episodes);
                }
               
                return episodes;
            },
            async infiniteHandler($state) {

                let videos = await this.fetchVideos(this.page);

                this.page += 1;
                this.videos.push(...videos);


                $state.loaded();
            }
        },
        async mounted() {
            
            // this.videos = await this.fetchVideos();
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