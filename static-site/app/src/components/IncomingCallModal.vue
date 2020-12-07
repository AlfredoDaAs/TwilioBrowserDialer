<script>
export default {
  name: 'IncomingCallModal',
  props: {
    from: {
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    handleOk(e) {
      if(e) e.preventDefault()

      this.takeCall();
    },
    handleCancel(e) {
      if(e) e.preventDefault();

      this.$emit('onCancel');
    },
    takeCall() {
      this.$emit('onAccept');
    }
  }
}
</script>

<template>
  <b-modal
    :visible="show"
    title="Incoming Call"
    ok-title="Take Call"
    ok-variant="success"
    @ok="handleOk"
    @cancel="handleCancel"
    no-close-on-esc
    no-close-on-backdrop
  >
    <p>Call From {{ from }}</p>
  </b-modal>
</template>