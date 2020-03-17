<template>
  <div
      @keydown.ctrl.89="onRedo"
      @keydown.ctrl.90="onUndo"
      @mouseup="onMouseUpOnPage"
      autofocus
      class="grey lighten-3"
      style="height: 100vh"
      tabindex="-1"
  >
    <v-sheet height="600px">
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

            <!-- EVENTS / GHOSTS -->
            <v-fade-transition
                :key="eIndex"
                appear
                v-for="(e, eIndex) in dragging || resizing ? ghosts[date(event.start)] : events[date(event.start)]"
            >
              <div
                  :style="`top: ${eventGeometry(e).y}px; height: ${eventGeometry(e).h}px; z-index: ${dragging || resizing ? 0 : 1}; opacity: ${dragging ? 0.4 : 1}`"
                  class="blue lighten-2"
                  style="position: absolute; left: 0; width: 100%; overflow: hidden; border-left: solid white thin !important; border-right: solid white thin !important"
              >
                <v-overlay
                    :absolute="true"
                    :value="(dragging || resizing) && e.locked === true"
                    color="error"
                    opacity="0.6"
                >
                  <v-row
                      align="center"
                      justify="center"
                  >
                    <v-col cols="12">
                      <v-icon v-text="'mdi-lock'" />
                    </v-col>
                  </v-row>
                </v-overlay>
                <!-- RESIZER -->
                <div
                    @mousedown="onResizeEvent(e, 'top')"
                    style="position: absolute; height: 6px; top: 0; width: 100%; cursor: row-resize"
                    v-if="!e.locked"
                />
                <!-- HEADER -->
                <v-row
                    :style="`height: ${Math.min(intervalHeight - 1, 22)}px; cursor: ${e.locked ? 'not-allowed': 'grab'}`"
                    @mousedown="onDragEvent(e)"
                    class="blue darken-2 px-1 elevation-2"
                    no-gutters
                >
                  <v-spacer />
                  <div
                      @mousedown.stop
                      v-if="!dragging"
                  >
                    <v-icon
                        :color="e.locked ? 'error lighten-2' : 'success lighten-2'"
                        :size="Math.min(intervalHeight - 1, 22) / 1.3"
                        @click="onLockEventClicked(e)"
                        style="cursor: default"
                        v-text="e.locked ? 'mdi-lock' : 'mdi-lock-open'"
                    />
                    <v-icon
                        :size="Math.min(intervalHeight - 1, 22) / 1.3"
                        @click="onRemoveEventClicked(e)"
                        color="white"
                        style="cursor: default"
                        v-text="'mdi-close'"
                    />
                  </div>
                </v-row>
                <!-- BODY -->
                <div class="pa-1 fill-height">
                  <div>
                    Start: {{e.start.format('YYYY-MM-DD HH:mm')}}
                  </div>
                  <div>
                    End: {{e.end.format('YYYY-MM-DD HH:mm')}}
                  </div>
                  <div>
                    Duration: {{duration(e).hours()}}h {{duration(e).minutes()}}min
                  </div>
                </div>
                <!-- RESIZER -->
                <div
                    :style="`cursor: ${e.locked ? 'not-allowed' : 'row-resize'}`"
                    @mousedown="onResizeEvent(e, 'bottom')"
                    style="position: absolute; bottom: 0; height: 6px; width: 100%"
                />
              </div>
            </v-fade-transition>

            <!-- GHOST -->
            <v-fade-transition>
              <div
                  :class="dropAllowed ? 'success' : 'error'"
                  :style="`top: ${eventGeometry(ghost).y}px; height: ${eventGeometry(ghost).h}px`"
                  class="lighten-1"
                  style="position: absolute; left: 0; width: 100%; opacity: 0.5; overflow: hidden; border-left: solid white thin !important; border-right: solid white thin !important"
                  v-if="ghost && date(ghost.start) === day.date"
              >
                <!-- RESIZER -->
                <div style="position: absolute; height: 6px; top: 0; width: 100%; cursor: row-resize" />
                <!-- HEADER -->
                <v-row
                    :class="dropAllowed ? 'success' : 'error'"
                    :style="`height: ${Math.min(intervalHeight - 1, 22)}px`"
                    class="darken-2 px-1 elevation-2"
                    no-gutters
                />
                <!-- BODY -->
                <div class="pa-1 fill-height">
                  <div>
                    Start: {{ghost.start.format('YYYY-MM-DD HH:mm')}}
                  </div>
                  <div>
                    End: {{ghost.end.format('YYYY-MM-DD HH:mm')}}
                  </div>
                  <div>
                    Duration: {{duration(ghost).hours()}}h {{duration(ghost).minutes()}}min
                  </div>
                </div>
                <!-- RESIZER -->
                <div style="position: absolute; height: 6px; bottom: 0; width: 100%; cursor: row-resize" />
              </div>
            </v-fade-transition>

            <!-- INTERVALS -->
            <div
                :style="`top: ${(interval - 1) * intervalHeight}px; height: ${intervalHeight}px; cursor: ${dragging ? 'grabbing' : resizing ? 'row-resize' : 'default'}; opacity: 0.4`"
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
				intervalMinutes: 15,
				firstInterval: 5,
				intervalCount: 4 * 8 - 5,
				eventsContainers: [
					{
						start: '0000-01-01 00:00',
						end: '0000-01-01 00:00'
					}
				],
				dragging: false,
				dropAllowed: true,
				resizing: false,
				resizeHandlerPosition: null,
				ghost: null,
				tmpGhosts: {},
				ghosts: {},
				events: {},
				undoHistory: [],
				redoHistory: []
			}
		},

		created() {
			moment.locale('fr')
		},

		mounted() {
			console.clear()
			this.createEventsContainers()
		},

		computed: {
			start() {
				return moment().weekday() !== 6 ? moment().startOf('week') : moment().endOf('week').add({days: 1}).startOf('day')
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
					this.$set(this.tmpGhosts, this.date(this.ghost.start), this.tmpGhosts[this.date(this.ghost.start)].filter(ghost => !ghost.start.isSame(this.ghost.start) || !ghost.end.isSame(this.ghost.end)))
				}
			},
			onResizeEvent(event, handler) {
				if (!event.locked) {
					this.resizing = true
					this.resizeHandlerPosition = handler
					this.ghost = {
						start: moment(event.start),
						end: moment(event.end)
					}
					this.$set(this.ghosts, this.date(this.ghost.start), this.ghosts[this.date(this.ghost.start)].filter(ghost => !ghost.start.isSame(this.ghost.start) || !ghost.end.isSame(this.ghost.end)))
					this.$set(this.tmpGhosts, this.date(this.ghost.start), this.tmpGhosts[this.date(this.ghost.start)].filter(ghost => !ghost.start.isSame(this.ghost.start) || !ghost.end.isSame(this.ghost.end)))
				}
			},
			onMouseEntersIntervalOfDate(interval, date) {
				let start, end
				if (this.dragging || this.resizing) {
					if (this.dragging) {
						start = moment(date).add({minutes: interval * this.intervalMinutes + this.firstInterval * this.intervalMinutes})
						end = moment(start).add(this.duration(this.ghost))
					} else if (this.resizing) {
						start = this.resizeHandlerPosition === 'top' ? moment(this.date(this.ghost.start)).add({minutes: interval * this.intervalMinutes + this.firstInterval * this.intervalMinutes}) : moment(this.ghost.start)
						end = this.resizeHandlerPosition === 'top' ? moment(this.ghost.end) : moment(this.date(this.ghost.end)).add({minutes: (interval + 1) * this.intervalMinutes + this.firstInterval * this.intervalMinutes})
					}
					if (end.isAfter(start)) {
						this.ghost = {
							start,
							end
						}
						this.scheduleGhosts()
					}
				}
			},
			scheduleGhosts() {
				this.ghosts = this.cloneEvents(this.tmpGhosts)
				this.dropAllowed = true
				const overlappingTmpGhostsBeforeGhost = (this.tmpGhosts[this.date(this.ghost.start)] || []).filter(tmpGhost => this.ghost.start.isAfter(tmpGhost.start) && tmpGhost.end.isAfter(this.ghost.start))
				const firstOverlappingTmpGhostBeforeGhost = overlappingTmpGhostsBeforeGhost.find(tmpGhost => tmpGhost.start.isSame(moment.max(overlappingTmpGhostsBeforeGhost.map(tmpGhost => tmpGhost.start))))
				const overlappingTmpGhostsAfterGhost = (this.tmpGhosts[this.date(this.ghost.start)] || []).filter(tmpGhost => this.ghost.start.isSameOrBefore(tmpGhost.start) && this.ghost.end.isAfter(tmpGhost.start))
				const firstOverlappingTmpGhostAfterGhost = overlappingTmpGhostsAfterGhost.find(tmpGhost => tmpGhost.start.isSame(moment.min(overlappingTmpGhostsAfterGhost.map(tmpGhost => tmpGhost.start))))
				// The ghost overlaps some event(s) starting before it
				if (firstOverlappingTmpGhostBeforeGhost) {
					const overlapDuration = moment.duration(firstOverlappingTmpGhostBeforeGhost.end.diff(this.ghost.start))
					const ghostsToUpdate = this.ghosts[this.date(this.ghost.start)].filter(ghost => ghost.start.isSameOrBefore(firstOverlappingTmpGhostBeforeGhost.start))
					const ghostToUpdateWithMinStart = ghostsToUpdate.find(ghost => ghost.start.isSame(moment.min(ghostsToUpdate.map(ghost => ghost.start))))
					const ghostToEarly = moment(this.date(this.ghost.start)).add({minutes: this.firstInterval * this.intervalMinutes}).isAfter(moment(ghostToUpdateWithMinStart.start).subtract(overlapDuration))
					this.dropAllowed = !ghostsToUpdate.some(ghost => ghost.locked) && !ghostToEarly
					if (this.dropAllowed) {
						ghostsToUpdate.forEach(ghost => {
							ghost.start = moment(ghost.start).subtract(overlapDuration)
							ghost.end = moment(ghost.end).subtract(overlapDuration)
						})
					}
				}
				// The ghost overlaps some event(s) starting after it
				if (firstOverlappingTmpGhostAfterGhost) {
					const overlapDuration = moment.duration(this.ghost.end.diff(firstOverlappingTmpGhostAfterGhost.start))
					const ghostsToUpdate = this.ghosts[this.date(this.ghost.start)].filter(ghost => ghost.start.isSameOrAfter(firstOverlappingTmpGhostAfterGhost.start))
					const ghostToUpdateWithMaxEnd = ghostsToUpdate.find(ghost => ghost.end.isSame(moment.max(ghostsToUpdate.map(ghost => ghost.end))))
					const ghostToLate = moment(ghostToUpdateWithMaxEnd.end).add(overlapDuration).isAfter(moment(this.date(this.ghost.start)).add({minutes: (this.firstInterval + this.intervalCount) * this.intervalMinutes}))
					this.dropAllowed = this.dropAllowed && !ghostsToUpdate.some(ghost => ghost.locked) && !ghostToLate
					if (this.dropAllowed) {
						ghostsToUpdate.forEach(ghost => {
							ghost.start = moment(ghost.start).add(overlapDuration)
							ghost.end = moment(ghost.end).add(overlapDuration)
						})
					}
				}
			},
			onMouseUpOnIntervalOfDate() {
				if (this.dropAllowed) {
					if (this.dragging || this.resizing) {
						this.undoHistory.push(this.cloneEvents(this.events))
						this.events = this.cloneEvents(this.ghosts)
						this.$set(this.events, this.date(this.ghost.start), [...(this.events[this.date(this.ghost.start)] || []), this.ghost])
						this.onMouseUpOnPage()
					}
				}
			},
			onMouseUpOnPage() {
				if (this.dragging || this.resizing) {
					this.dragging = false
					this.resizing = false
					this.ghost = null
					this.updateGhosts()
				}
			},
			onLockEventClicked(event) {
				this.undoHistory.push(this.cloneEvents(this.events))
				this.$set(event, 'locked', !event.locked)
				this.updateGhosts()
			},
			onRemoveEventClicked(event) {
				this.undoHistory.push(this.cloneEvents(this.events))
				this.$set(this.events, this.date(event.start), this.events[this.date(event.start)].filter(e => !e.start.isSame(event.start) || !e.end.isSame(event.end)))
				this.updateGhosts()
			},
			onUndo() {
				const previousEvents = this.undoHistory.pop()
				if (previousEvents) {
					this.redoHistory.push(this.events)
					this.events = this.cloneEvents(previousEvents)
					this.updateGhosts()
				}
			},
			onRedo() {
				const nextEvents = this.redoHistory.pop()
				if (nextEvents) {
					this.undoHistory.push(this.events)
					this.events = this.cloneEvents(nextEvents)
					this.updateGhosts()
				}
			},
			updateGhosts() {
				this.ghosts = this.cloneEvents(this.events)
				this.tmpGhosts = this.cloneEvents(this.ghosts)
			},
			cloneEvents(events) {
				const clonedEvents = {}
				Object.entries(events).forEach(([date, events]) => {
					clonedEvents[date] = []
					events.forEach(event => {
						clonedEvents[date].push({
							start: moment(event.start),
							end: moment(event.end),
							locked: event.locked
						})
					})
				})
				return clonedEvents
			},


			print(event) {
				console.log([event.start.format('YYYY-MM-DD HH:mm'), event.end.format('YYYY-MM-DD HH:mm'), this.duration(event).asMinutes()].join(' | '))
			},
			areEventsOverlapping(event1, event2) {
				return event1.start.isBetween(event2.start, event2.end, null, '[)') || event1.end.isBetween(event2.start, event2.end, null, '(]') || event2.start.isBetween(event1.start, event1.end, null, '[)') || event2.end.isBetween(event1.start, event1.end, null, '(]')
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
					}).asMinutes() - this.firstInterval * this.intervalMinutes) + 2,
					h: this.minutesToPixels(moment.duration(event.end.diff(event.start)).asMinutes()) - 3
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
						'2020-03-16': [
							{
								start: moment('2020-03-16 01:15'),
								end: moment('2020-03-16 01:45'),
								locked: false
							},
							{
								start: moment('2020-03-16 03:15'),
								end: moment('2020-03-16 03:45')
							},
							{
								start: moment('2020-03-16 03:00'),
								end: moment('2020-03-16 03:15')
							},
							{
								start: moment('2020-03-16 05:30'),
								end: moment('2020-03-16 07:45')
							}
						],
						'2020-03-17': [
							{
								start: moment('2020-03-17 01:45'),
								end: moment('2020-03-17 02:00'),
								locked: true
							},
							{
								start: moment('2020-03-17 02:30'),
								end: moment('2020-03-17 03:00')
							},
							{
								start: moment('2020-03-17 03:15'),
								end: moment('2020-03-17 04:30')
							},
							{
								start: moment('2020-03-17 05:00'),
								end: moment('2020-03-17 06:45')
							},
							{
								start: moment('2020-03-17 06:45'),
								end: moment('2020-03-17 07:30')
							}
						],
						'2020-03-18': [
							{
								start: moment('2020-03-18 01:30'),
								end: moment('2020-03-18 04:00')
							}
						]
					}
					this.tmpGhosts = this.cloneEvents(this.ghosts)
					this.events = this.cloneEvents(this.ghosts)
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
    cursor: default !important;
  }
</style>
