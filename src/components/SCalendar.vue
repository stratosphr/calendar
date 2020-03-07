<template>
  <div
      @mouseup="onMouseUpOnPage"
      class="grey lighten-3"
      style="height: 100vh"
  >
    <v-sheet height="300px">
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
        <template #event="{event, day}">
          <div
              class="event-container"
              style="position: relative; width: 100%; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none; -o-user-select:none"
          >

            <!-- GHOST -->
            <div
                :style="`top: ${eventGeometry(ghost).y}px; height: ${eventGeometry(ghost).h}px; opacity: ${0.4}`"
                class="success lighten-1 event"
                style="position: absolute; left: 0; width: 100%; overflow: hidden"
                v-if="ghost && date(ghost.start) === day.date"
            >
              <!-- HEADER -->
              <v-row
                  :style="`height: ${Math.min(intervalHeight, 23)}px`"
                  class="success darken-2 px-1"
                  no-gutters
              />
              <!-- BODY -->
              <div>
                <div>
                  Start: {{ghost.start.format('YYYY-MM-DD HH:mm')}}
                </div>
                <div>
                  End: {{ghost.end.format('YYYY-MM-DD HH:mm')}}
                </div>
              </div>
            </div>

            <!-- EVENTS / GHOSTS -->
            <div
                :style="`top: ${eventGeometry(e).y}px; height: ${eventGeometry(e).h}px; z-index: ${dragging ? 0 : 1}; opacity: ${dragging ? 0.4 : 1}`"
                class="blue lighten-1 event"
                style="position: absolute; left: 0; width: 100%; overflow: hidden"
                v-for="e in dragging ? ghosts[date(event.start)] : events[date(event.start)]"
            >
              <!-- HEADER -->
              <v-row
                  :style="`height: ${Math.min(intervalHeight, 23)}px; cursor: ${e.locked ? 'not-allowed': 'grab'}`"
                  @mousedown="onDragEvent(e)"
                  class="blue darken-2 px-1"
                  no-gutters
              >
                <v-spacer />
                <div
                    @mousedown.stop
                    v-if="!dragging"
                >
                  <v-icon
                      @click="onLockEventClicked(e)"
                      color="black"
                      style="cursor: default"
                      v-text="e.locked ? 'mdi-lock' : 'mdi-lock-open'"
                      x-small
                  />
                  <v-icon
                      @click="onRemoveEventClicked(e)"
                      color="black"
                      small
                      style="cursor: default"
                      v-text="'mdi-close'"
                  />
                </div>
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

            <div
                :style="`top: ${(interval - 1) * intervalHeight}px; height: ${intervalHeight}px; cursor: ${dragging ? 'grabbing' : 'default'}; opacity: 0.4`"
                @mouseenter="onMouseEntersIntervalOfDate(interval - 1, day.date)"
                @mouseup="onMouseUpOnIntervalOfDate(interval - 1, day.date)"
                class="transparent"
                style="position: absolute; width: 100%"
                v-for="interval in intervalCount"
            />

          </div>
        </template>
      </v-calendar>
    </v-sheet>
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
				dragging: false,
				ghost: null,
				ghosts: {},
				events: {}
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
			onDragEvent(event) {
				if (!event.locked) {
					this.dragging = true
					this.ghost = {
						start: moment(event.start),
						end: moment(event.end)
					}
					this.$set(this.ghosts, this.date(this.ghost.start), this.ghosts[this.date(this.ghost.start)].filter(ghost => !ghost.start.isSame(this.ghost.start) || !ghost.end.isSame(this.ghost.end)))
				}
			},
			onMouseEntersIntervalOfDate(interval, date) {
				if (this.dragging) {
					const start = moment(date).add({minutes: interval * this.intervalMinutes + this.firstInterval * this.intervalMinutes})
					const end = moment(start).add(this.duration(this.ghost))
					this.ghost = {
						start,
						end
					}
				}
			},
			onMouseUpOnIntervalOfDate() {
				if (this.dragging) {
					this.events = Object.assign({}, this.ghosts)
					this.$set(this.events, this.date(this.ghost.start), [...(this.events[this.date(this.ghost.start)] || []), this.ghost])
					this.onMouseUpOnPage()
				}
			},
			onMouseUpOnPage() {
				if (this.dragging) {
					this.dragging = false
					this.ghost = null
					this.updateGhosts()
				}
			},
			onLockEventClicked(event) {
				this.$set(event, 'locked', !event.locked)
				this.updateGhosts()
			},
			onRemoveEventClicked(event) {
				this.$set(this.events, this.date(event.start), this.events[this.date(event.start)].filter(e => !e.start.isSame(event.start) || !e.end.isSame(event.end)))
				this.updateGhosts()
			},
			updateGhosts() {
				Object.entries(this.events).forEach(([date, events]) => {
					this.$set(this.ghosts, date, events.map(event => {
						return {
							locked: event.locked,
							start: moment(event.start),
							end: moment(event.end)
						}
					}))
				})
			},


			print(event) {
				console.log([event.start.format('YYYY-MM-DD HH:mm'), event.end.format('YYYY-MM-DD HH:mm'), this.duration(event).asMinutes()].join(' | '))
			},
			duration(event) {
				return moment.duration(event.end.diff(event.start))
			},
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
					h: this.minutesToPixels(moment.duration(event.end.diff(event.start)).asMinutes()) - 1
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
					this.ghosts = {
						'2020-03-04': [
							{
								start: moment('2020-03-04 01:30'),
								end: moment('2020-03-04 04:30'),
								locked: true
							},
							{
								start: moment('2020-03-04 04:30'),
								end: moment('2020-03-04 05:30')
							},
							{
								start: moment('2020-03-04 05:30'),
								end: moment('2020-03-04 08:07')
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
								start: moment('2020-03-07 01:30'),
								end: moment('2020-03-07 04:23')
							}
						]
					}
					this.events = Object.assign({}, this.ghosts)
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
