<template>
  <q-page padding>
    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input :disable="this.loading" filled v-model="publickey"
        label="钱包地址"
        placeholder="请输入20位钱包地址"
        stack-label
        counter maxlength="20"
        lazy-rules
        :rules="[ val => val.length == 2 || '请输入20位钱包地址.']"
      />
      <div v-if="this.loading" class="text-center">
        <h6 class="a">正在搜索我发行的Token......</h6>
        <q-spinner color="primary" size="3em" />
      </div>

      <div>
        <q-btn :disabled="this.loading" class="full-width q-mt-md" label="提交" type="submit" color="primary"/>
      </div>
      <div>
        <q-btn :to="{ name: 'socialshare' }" class="full-width q-mt-md" label="share" type="share" color="primary"/>
      </div>
      <div>
        <q-btn :to="{ name: 'socialsharing' }" class="full-width q-mt-md" label="sharing" type="sharing" color="primary"/>
      </div>
    </q-form>

  </q-page>
</template>

<style>
</style>

<script>
import { setTimeout } from 'timers'

export default {
  data () {
    return {
      publickey: null,
      loading: false
    }
  },
  methods: {
    onSubmit () {
      this.loading = true
      setTimeout(function () {
        this.loading = false
        this.$router.push({ name: 'coinlist' })
      }.bind(this), 3000)
    }
  },
  components: {
  }
}
</script>
