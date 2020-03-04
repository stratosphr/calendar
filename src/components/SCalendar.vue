<template>
  <div>
    <div style="position: relative">
      <v-calendar
          :interval-count="24 * 60 / intervalMinutes"
          :interval-height="intervalHeight"
          :interval-minutes="intervalMinutes"
          :short-intervals="false"
          :weekdays="[1, 2, 3, 4, 5, 6, 0]"
          locale="fr"
          type="week"
      >
      </v-calendar>
    </div>
  </div>
</template>

<script>
	export default {
		name: 's-calendar',

		data: () => ({
			intervalHeight: 30,
			intervalMinutes: 30,
			intervalWidth: 60
		})
	}
</script>

<style scoped>

</style>
