<template>
  <div>
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
        event-color="transparent"
        locale="fr"
        type="custom-daily"
    >
      <template #event="{event}">
        <div
            @mousedown.prevent.stop
            class="event-container"
            style="position: relative; width: 100%; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none; -o-user-select:none"
        >

          <!-- EVENTS -->
          <div
              :style="`top: ${eventGeometry(e).y}px; height: ${eventGeometry(e).h}px`"
              class="blue lighten-1 event"
              style="position: absolute; left: 0; width: 100%; overflow: hidden"
              v-for="e in events[date(event.start)]"
          >
            <!-- HEADER -->
            <v-row
                :style="`height: ${Math.min(intervalHeight, 23)}px`"
                class="blue darken-2 px-1"
                no-gutters
                style="cursor: grab"
            >
              <v-spacer />
              <v-icon
                  color="black"
                  small
                  v-text="'close'"
              />
            </v-row>
            <!-- BODY -->
            <div>
              <div>
                Start: {{e.start.format('YYYY-MM-DD HH:mm')}}
              </div>
              <div>
                End: {{e.end.format('YYYY-MM-DD HH:mm')}}
              </div>
            </div>
          </div>

        </div>
      </template>
    </v-calendar>
  </div>
</template>

<script>
	import moment from 'moment'
	import 'jquery-ui-dist/jquery-ui'

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
				events: {
					'2020-03-04': [
						{
							start: moment('2020-03-04 01:30'),
							end: moment('2020-03-04 04:30')
						},
						{
							start: moment('2020-03-04 04:30'),
							end: moment('2020-03-04 05:30')
						}
					],
					'2020-03-05': [
						{
							start: moment('2020-03-05 05:30'),
							end: moment('2020-03-05 09:48')
						}
					],
					'2020-03-07': [
						{
							start: moment('2020-03-05 01:30'),
							end: moment('2020-03-05 04:23')
						}
					]
				}
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
			date(m) {
				return moment(m).format('YYYY-MM-DD')
			},
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
    margin-top: -1px !important;
  }

  /*noinspection CssUnusedSymbol*/
  .theme--light.v-calendar-events .v-event-timed {
    padding: 0 !important;
    border: 0 solid !important;
    border-radius: 0 !important;
    cursor: default !important;
  }
</style>
