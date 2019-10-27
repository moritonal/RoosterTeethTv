
<template>
	<div v-bind:class="{blur : !playerReader}">
		<video
			ref="videoPlayer"
			class="embed-responsive-item video-js vjs-big-play-centered w-100 h-100"
		>
			<p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that supports HTML5 video</p>
		</video>
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
			player: null,
			playerReader: false
		};
	},
	methods: {
		async playVideo(slug) {
			let api = new RoosterTeethApi();
			let vidsLink = (await api.getVideo(slug));
			
			console.log(vidsLink);

			if (vidsLink.access == false) {
				console.log(vidsLink);
				console.warn("Test");
				this.$router.push("/videos");
				return;
			}

			let vidLink = vidsLink.data[0];

			let url = vidLink.attributes.url;
			let contentUUID = vidLink.attributes.content_uuid;

			let position = await api.getVideoPosition(contentUUID);

			this.player = videojs(
				this.$refs.videoPlayer,
				{
					controls: true
				}, () => {
					try {
						if (this.player == null)
							return;

						if (vidLink.attributes.media_type == "manifest") {
							this.player.src({
								type: "application/x-mpegURL",
								src: url
							});

							this.player.ready(() => {

								try {
								this.player.play();
								this.player.focus();

								let keyDown = (event : KeyboardEvent) => {

									switch (event.keyCode) {
										case 37: // Left
											let seekTimeBackwards = Math.max(0, this.player.currentTime() - 5);
											this.player.currentTime(seekTimeBackwards);
											event.preventDefault();
											break;
										case 39: // Right
											let seekTimeForwards = Math.min(this.player.duration(), this.player.currentTime() + 5);
											this.player.currentTime(seekTimeForwards);
											event.preventDefault();
											break;
										case 38: // Up
											break;
										case 40: // Down
											break
										case 32: // Space
											if (this.player.paused()) {
												this.player.play();
											} else {
												this.player.pause();
											}
											break;
										default:
											console.warn("Unhandled key", event);
											break;
									}
								}

								this.player.on('keydown', keyDown);

								// Setup loop to set current Time
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

								// Set the current time
								this.player.currentTime(position.value);

								this.playerReader = true;
								}
								catch (ex) {
									console.warn(ex);
								}
							});
						} else {
							alert(`Unsupported media-type: ${vidLink.attributes.media_type}`);
						}

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

div {
	transition: all 1s;
}

.blur {
	filter: blur(2px);
}
.card {
	background-color: transparent;
}
.container {
	color: green;
}
</style>