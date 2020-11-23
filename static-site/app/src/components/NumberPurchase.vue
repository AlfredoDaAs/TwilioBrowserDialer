<script>
import axios from '../axios'
import { mapGetters } from "vuex";
import { handleError, handleMessage } from '../handleErrors'

export default {
  name: 'NumberPurchase',
  props: {
    phoneNumber: {
      type: String,
      required: true
    },
    show: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  computed: mapGetters(['getUserId']),
  methods: {
    handleOk(e) {
      if(e) e.preventDefault();

      this.confirm();
    },
    cancel(e) {
      if(e) e.preventDefault();

      this.$emit('onClose');
    },
    onChange(visible) {
      if(!visible) this.cancel();
    },
    async confirm() {
      try {
        const result = await axios.post('numbers/provision', {
          phoneNumber: this.phoneNumber
        })

        if(result.data) {
          handleMessage('Phone number purchased and assigned to your account', this, 'success');
          this.$emit('onPurchased');
        }
      } catch (error) {
        handleError(error, this, 'danger');
      }
    }
  }
}
</script>

<template>
  <b-modal
    :visible="show"
    title="Purchase Phone Number"
    ok-title="Confirm"
    ok-variant="outline-success"
    @ok="handleOk"
    cancel-variant="outline-secondary"
    @cancel="cancel"
    @change="onChange"
  >
    <b-form>
      <p>Purchase and assign this phone number: {{ phoneNumber }} to your account. <br> Click confirm to continue.</p>
    </b-form>
  </b-modal>
</template>