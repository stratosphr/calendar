<template>
  <div>
    <div style="position: relative">
      <v-calendar
          :end="end.format('YYYY-MM-DD')"
          :interval-count="24 * 60 / intervalMinutes"
          :interval-height="intervalHeight"
          :interval-minutes="intervalMinutes"
          :short-intervals="false"
          :start="start.format('YYYY-MM-DD')"
          locale="fr"
          type="custom-daily"
      >
      </v-calendar>
    </div>
  </div>
</template>

<script>
	import moment from 'moment'

	export default {
		name: 's-calendar',

		data: () => ({
			intervalHeight: 30,
			intervalMinutes: 30,
			intervalWidth: 60
		}),

		created() {
			moment.locale('fr')
		},

		computed: {
			start() {
				return moment().weekday() !== 6 ? moment().startOf('week') : moment().endOf('week').add(1, 'days')
			},
			end() {
				return moment(this.start).add(5, 'days')
			}
		}

	}
</script>

<style scoped>

</style>
