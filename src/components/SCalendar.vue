<template>
  <div>
    <div style="position: relative">
      <v-calendar
          :end="end.format('YYYY-MM-DD')"
          :events="eventsContainers"
          :interval-count="24 * 60 / intervalMinutes"
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
              class="black fill-height"
              style="position: relative; opacity: 0.7;"
          >
            <div>
              {{event.start}}
            </div>
            <div>
              {{event.end}}
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
				intervalHeight: 30,
				intervalMinutes: 30,
				intervalWidth: 60,
				eventsContainers: [
					{
						start: '0000-01-01 00:00',
						end: '0000-01-01 00:00'
					}
				],
				events: []
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
				return moment().weekday() !== 6 ? moment().startOf('week') : moment().endOf('week').add(1, 'days')
			},
			end() {
				return moment(this.start).add(5, 'days')
			}
		},

		methods: {
			createEventsContainers() {
				for (let day = 0; day < 6; day++) {
					const start = moment(this.start).add(day, 'days').format('YYYY-MM-DD 00:00')
					const end = moment(start).format('YYYY-MM-DD 24:00')
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
    margin: -1px !important;
  }

  /*noinspection CssUnusedSymbol*/
  .v-event-timed {
    border-radius: 0 !important;
  }
</style>
