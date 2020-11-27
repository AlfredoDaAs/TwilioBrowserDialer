<script>
import axios from '../axios'
import { handleMessage, handleError } from '../handleErrors'

export default {
  name: 'DepartmentDeleteForm',
  props: {
    department: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  methods: {
    handleOk(e) {
      if(e) e.preventDefault();

      this.confirm();
    },
    async confirm() {
      try {
        const result = await axios.delete(`/departments/${this.department.id}`)

        if(result.data) {
          handleMessage('Department was deleted', this, 'success');
          this.$emit('onDelete');
        }
      } catch (error) {
        handleError(error, this, 'danger')
      }
    },
    cancel(e) {
      if(e) e.preventDefault();

      this.$emit('onCancel');
    },
    onChange(visible) {
      if(!visible) this.cancel()
    }
  }
}
</script>

<template>
  <b-modal
    title="Delete Department"
    :visible="show"
    ok-title="Confirm"
    ok-variant="outline-primary"
    @ok="handleOk"
    cancel-variant="outline-secondary"
    @cancel="cancel"
    @change="onChange"
  >
    <b-form>
      <p>Are you sure you want to delete {{ department.name }} department?</p>
    </b-form>
  </b-modal>
</template>