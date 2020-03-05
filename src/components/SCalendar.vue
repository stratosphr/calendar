<template>
  <div>
    <div style="position: relative">
      <v-calendar
          :end="end.format('YYYY-MM-DD')"
          :event-ripple="false"
          :events="eventsContainers"
          :first-interval="firstInterval"
          :interval-count="intervalCount"
          :interval-height="intervalHeight"
          :interval-minutes="intervalMinutes"
          :short-intervals="false"
          :start="start.format('YYYY-MM-DD')"
          event-color="blue"
          locale="fr"
          type="custom-daily"
      >
        <template #event="{event}">
          <div
              class="black"
              style="position: relative; opacity: 0.7"
          >
            <div
                :style="`top: ${eventGeometry(e).y}px; height: ${eventGeometry(e).h}px`"
                class="black"
                style="position: absolute; left: 1px; right: 1px; overflow: hidden"
                v-for="e in events"
            >
              <div>
                {{e.start}}
              </div>
              <div>
                {{e.end}}
              </div>
            </div>
          </div>
        </template>
      </v-calendar>
    </div>
  </div>
</template>

<script>
	import moment from 'moment'

	export default {
		name: 's-calendar',

		data() {
			return {
				intervalHeight: 20,
				intervalMinutes: 30,
				firstInterval: 3,
				intervalCount: 24,
				eventsContainers: [
					{
						start: '0000-01-01 00:00',
						end: '0000-01-01 00:00'
					}
				],
				events: [
					{
						start: moment('2020-03-04 03:30'),
						end: moment('2020-03-04 04:30')
					},
					{
						start: moment('2020-03-04 04:30'),
						end: moment('2020-03-04 05:48')
					}
				]
			}
		},

		created() {
			moment.locale('fr')
		},

		mounted() {
			this.createEventsContainers()
		},

		computed: {
			start() {
				return moment().weekday() !== 6 ? moment().startOf('week') : moment().endOf('week').add({days: 1})
			},
			end() {
				return moment(this.start).add(5, 'days')
			}
		},

		methods: {
			minutesToPixels(minutes) {
				return +(minutes * (this.intervalHeight / this.intervalMinutes)).toFixed(0)
			},
			eventGeometry(event) {
				return {
					y: this.minutesToPixels(moment.duration({
						hours: event.start.hours(),
						minutes: event.start.minutes()
					}).asMinutes() - this.firstInterval * this.intervalMinutes + 1),
					h: this.minutesToPixels(moment.duration(moment(event.end).diff(event.start)).asMinutes()) - 1
				}
			},
			createEventsContainers() {
				for (let day = 0; day < 6; day++) {
					const start = moment(this.start).add({
						days: day,
						minutes: this.firstInterval * this.intervalMinutes
					}).format('YYYY-MM-DD HH:mm')
					const end = moment(start).add({
						minutes: (this.intervalCount * this.intervalMinutes)
					}).format(`${moment(start).format('YYYY-MM-DD')} kk:mm`)
					this.eventsContainers.push({
						start,
						end
					})
				}
			}
		}

	}
</script>

<style>
  /*noinspection CssUnusedSymbol*/
  .v-event-timed-container {
    margin-right: 0 !important;
  }

  /*noinspection CssUnusedSymbol*/
  .theme--light.v-calendar-events .v-event-timed {
    padding: 0 !important;
    border: 0 solid !important;
    border-radius: 0 !important;
  }
</style>
