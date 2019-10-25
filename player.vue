
<template>
	<div class="container-fluid p-3">
		<div class="row">
			<div class="embed-responsive embed-responsive-16by9">
				<video
					ref="videoPlayer"
					class="embed-responsive-item video-js vjs-default-skin vjs-big-play-centered"
					controls
					preload="auto"
					data-setup='{}'
				>
					<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video</p>
				</video>
			</div>
		</div>
	</div>
</template>>

<script lang="ts">
import Vue from "vue";
import videojs from "video.js";
import "video.js/dist/video-js.min.css";
import * as hotkeys from "videojs-hotkeys";
import RoosterTeethApi from "./RoosterTeethApi";

export default Vue.extend({
	data() {
		return {
			token: null,
			player: null
		};
	},
	methods: {
		async playVideo(slug) {
			let api = new RoosterTeethApi({
				ClientId: process.env.CLIENT_ID,
				Password: process.env.ROOSTERTEETH_PASSWORD,
				Username: process.env.ROOSTERTEETH_USERNAME
			});

			// let vidLink = await this.fetch(`https://red.bonner.is/roosterteeth/api/v1/watch/${slug}/videos`);
			let vidLink = (await api.getVideo(slug)).data[0];

			console.log(vidLink);

			let url = vidLink.attributes.url;
			let contentUUID = vidLink.attributes.content_uuid;

			let position = await api.getVideoPosition(contentUUID);

			this.player = videojs(
				this.$refs.videoPlayer,
				{
					autoplay: true,
					controls: true
				},
				() => {
					try {
						console.log("Ready!");

						if (this.player == null) return;

						if (vidLink.attributes.media_type == "manifest") {
							this.player.src({
								type: "application/x-mpegURL",
								src: url
							});

							this.player.ready(() => {
								this.player.setInterval(async () => {
									if (!this.player.paused()) {
										let currentTime = this.player.currentTime();

										let totalTime =
											this.player.currentTime() +
											this.player.remainingTime();

										let percentage = Math.round(
											(currentTime / totalTime) * 100
										);

										api.setVideoPosition(
											contentUUID,
											percentage,
											Math.round(currentTime)
										);
									}
								}, 5000);
							});
						}

						console.log(this.player);

						this.player.currentTime(position.value);
					} catch (err) {
						console.warn("Cap", err);
					}
				}
			);
		}
	},
	async mounted() {
		console.log("Slug: ", this.$route.params.slug);

		console.log(this);
		await this.playVideo(this.$route.params.slug);
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

@import "node_modules/bootstrap/scss/bootstrap";
@import "node_modules/bootstrap-vue/src/index.scss";

.card {
	background-color: transparent;
}
.container {
	color: green;
}
</style>